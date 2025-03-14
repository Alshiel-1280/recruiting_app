// ApplicantMatching.js
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

function ApplicantMatching() {
  const { applicantId } = useParams();
  const [searchParams] = useSearchParams();
  const applicantIdFromQuery = searchParams.get('applicantId');

  // URLパラメータかクエリパラメータからIDを取得
  const currentApplicantId = applicantId || applicantIdFromQuery;

  const [applicant, setApplicant] = useState(null);
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [processedJobs, setProcessedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('distance'); // デフォルトは距離順
  const [transportMode, setTransportMode] = useState('driving'); // デフォルトは車での移動
  const [displayCount, setDisplayCount] = useState(20); // 表示件数

  useEffect(() => {
    // APIのベースURL設定
    axios.defaults.baseURL = 'http://localhost:5001';

    // 求職者データの取得
    const fetchApplicantData = async () => {
      try {
        setIsLoading(true);

        if (!currentApplicantId) {
          setError('求職者IDが指定されていません');
          setIsLoading(false);
          return;
        }

        console.log(`求職者データの取得を開始: ${currentApplicantId}`);
        const applicantResponse = await axios.get(`/api/applicants/${currentApplicantId}`);

        if (applicantResponse.status !== 200) {
          throw new Error(`API error: ${applicantResponse.status}`);
        }

        const applicantData = applicantResponse.data;
        console.log('取得した求職者データ:', applicantData);

        // 住所情報のデバッグログ
        console.log('住所情報:', {
          hasAddress: 'address' in applicantData,
          addressValue: applicantData.address,
          applicantKeys: Object.keys(applicantData)
        });

        // 状態を更新
        setApplicant(applicantData);

        // マッチング求人データを取得し、取得した求職者データを直接使用
        await fetchMatchingJobsWithApplicant(applicantData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`データの取得に失敗しました: ${error.message}`);
        setIsLoading(false);
      }
    };

    fetchApplicantData();
  }, [currentApplicantId]);

  // 求職者データを直接引数として使用する版のfetchMatchingJobs
  const fetchMatchingJobsWithApplicant = async (applicantData) => {
    try {
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      console.log(`マッチング求人の取得を開始: applicantId=${currentApplicantId}`);
      const response = await axios.get(
        `/api/matching/applicant/${currentApplicantId}`,
        options
      );

      if (response.status !== 200) {
        throw new Error(`API error: ${response.status}`);
      }

      console.log('マッチング求人取得成功:', response.data.length, '件');
      setMatchingJobs(response.data);

      // 求人に距離情報を追加（取得した求職者データを直接使用）
      if (response.data.length > 0) {
        await calculateDistancesWithApplicant(response.data, applicantData);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching matching jobs:', error);
      setError(`マッチング求人の取得に失敗しました: ${error.message}`);
      setIsLoading(false);
    }
  };

  // 求職者データを直接引数として使用する版のcalculateDistances
  const calculateDistancesWithApplicant = async (jobs, applicantData) => {
    try {
      // 住所情報の確認
      if (!applicantData || !applicantData.address) {
        console.warn('求職者の住所情報がありません:', applicantData);
        setError('求職者の住所情報がないため、距離計算ができません。');
        setProcessedJobs(jobs);
        setIsLoading(false);
        return;
      }

      // 通勤手段に基づいて適切なモードを設定
      let travelMode = transportMode;
      if (applicantData.commute_method) {
        if (applicantData.commute_method.includes('車') || applicantData.commute_method.includes('自動車')) {
          travelMode = 'driving';
        } else if (applicantData.commute_method.includes('電車') || applicantData.commute_method.includes('バス') || applicantData.commute_method.includes('公共')) {
          travelMode = 'transit';
        } else if (applicantData.commute_method.includes('自転車')) {
          travelMode = 'bicycling';
        } else if (applicantData.commute_method.includes('徒歩')) {
          travelMode = 'walking';
        }
      }

      console.log(`通勤手段: ${applicantData.commute_method || '指定なし'}, 計算モード: ${travelMode}`);
      console.log(`求職者住所: ${applicantData.address}`);

      // バックエンドAPI経由でGoogle Distance Matrix APIを呼び出す
      const destinations = jobs.map(job => `${job.job.prefecture}${job.job.city || ''}`);

      console.log('距離計算リクエスト準備:', { 
        origin: applicantData.address, 
        destinations: destinations.slice(0, 3) + '...' 
      });

      // バックエンド経由で距離計算を行う - POSTメソッドを使用
      const distanceResponse = await axios.post('/api/calculate-distances', {
        origin: applicantData.address,
        destinations: destinations,
        mode: travelMode
      });

      if (distanceResponse.status !== 200) {
        throw new Error(`距離計算API error: ${distanceResponse.status}`);
      }

      console.log('距離計算結果受信成功');

      // 距離情報を求人データに追加
      const jobsWithDistance = jobs.map((job, index) => {
        return {
          ...job,
          distance: distanceResponse.data.distances[index],
          duration: distanceResponse.data.durations[index],
          durationText: distanceResponse.data.durationTexts[index],
          distanceText: distanceResponse.data.distanceTexts[index]
        };
      });

      // 距離でソート（デフォルト）
      const sortedJobs = [...jobsWithDistance].sort((a, b) => {
        // nullのdurationを最後にする
        if (a.duration === null && b.duration === null) return 0;
        if (a.duration === null) return 1;
        if (b.duration === null) return -1;
        return a.duration - b.duration;
      });

      // 上位件数を取得
      const topJobs = sortedJobs.slice(0, displayCount);

      setProcessedJobs(topJobs);
    } catch (error) {
      console.error('Error calculating distances:', error);
      setError(`距離計算中にエラーが発生しました: ${error.message}`);
      setProcessedJobs(jobs); // エラー時は元の求人リストを使用
    } finally {
      setIsLoading(false);
    }
  };

  // マッチング求人を取得する処理（componentDidMountからの直接呼び出し用）
  const fetchMatchingJobs = async () => {
    try {
      setIsLoading(true);

      // applicantがまだ設定されていない可能性がある
      if (!applicant) {
        console.warn('求職者データがまだロードされていません');
        setError('求職者データがロードされていないため、マッチング求人を取得できません。');
        setIsLoading(false);
        return;
      }

      const options = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      console.log(`マッチング求人の取得を開始: applicantId=${currentApplicantId}`);
      const response = await axios.get(
        `/api/matching/applicant/${currentApplicantId}`,
        options
      );

      if (response.status !== 200) {
        throw new Error(`API error: ${response.status}`);
      }

      console.log('マッチング求人取得成功:', response.data.length, '件');
      setMatchingJobs(response.data);

      // 求人に距離情報を追加
      if (response.data.length > 0) {
        await calculateDistances(response.data);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching matching jobs:', error);
      setError(`マッチング求人の取得に失敗しました: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Google Distance Matrix APIを使用して距離と所要時間を計算（componentDidMountからの間接呼び出し用）
  const calculateDistances = async (jobs) => {
    try {
      // applicantがまだ設定されていない可能性がある
      if (!applicant) {
        console.warn('求職者データがまだロードされていません');
        setError('求職者データがロードされていないため、距離計算ができません。');
        setProcessedJobs(jobs);
        setIsLoading(false);
        return;
      }

      if (!applicant.address) {
        console.warn('求職者の住所情報がありません');
        setError('求職者の住所情報がないため、距離計算ができません。');
        setProcessedJobs(jobs);
        setIsLoading(false);
        return;
      }

      // 通勤手段に基づいて適切なモードを設定
      let travelMode = transportMode;
      if (applicant.commute_method) {
        if (applicant.commute_method.includes('車') || applicant.commute_method.includes('自動車')) {
          travelMode = 'driving';
        } else if (applicant.commute_method.includes('電車') || applicant.commute_method.includes('バス') || applicant.commute_method.includes('公共')) {
          travelMode = 'transit';
        } else if (applicant.commute_method.includes('自転車')) {
          travelMode = 'bicycling';
        } else if (applicant.commute_method.includes('徒歩')) {
          travelMode = 'walking';
        }
      }

      console.log(`通勤手段: ${applicant.commute_method || '指定なし'}, 計算モード: ${travelMode}`);

      // バックエンドAPI経由でGoogle Distance Matrix APIを呼び出す
      const destinations = jobs.map(job => `${job.job.prefecture}${job.job.city || ''}`);

      // バックエンド経由で距離計算を行う - POSTメソッドを使用
      const distanceResponse = await axios.post('/api/calculate-distances', {
        origin: applicant.address,
        destinations: destinations,
        mode: travelMode
      });

      if (distanceResponse.status !== 200) {
        throw new Error(`距離計算API error: ${distanceResponse.status}`);
      }

      // 距離情報を求人データに追加
      const jobsWithDistance = jobs.map((job, index) => {
        return {
          ...job,
          distance: distanceResponse.data.distances[index],
          duration: distanceResponse.data.durations[index],
          durationText: distanceResponse.data.durationTexts[index],
          distanceText: distanceResponse.data.distanceTexts[index]
        };
      });

      // 距離でソート（デフォルト）
      const sortedJobs = [...jobsWithDistance].sort((a, b) => {
        if (a.duration === null && b.duration === null) return 0;
        if (a.duration === null) return 1;
        if (b.duration === null) return -1;
        return a.duration - b.duration;
      });

      // 上位20件を取得
      const topJobs = sortedJobs.slice(0, displayCount);

      setProcessedJobs(topJobs);
    } catch (error) {
      console.error('Error calculating distances:', error);
      setError(`距離計算中にエラーが発生しました: ${error.message}`);
      setProcessedJobs(jobs); // エラー時は元の求人リストを使用
    } finally {
      setIsLoading(false);
    }
  };

  // ソート方法変更時の処理
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);

    // ソート方法に応じて並べ替え
    let sortedJobs = [...processedJobs];

    if (newSortBy === 'distance') {
      sortedJobs.sort((a, b) => {
        if (a.duration === null && b.duration === null) return 0;
        if (a.duration === null) return 1;
        if (b.duration === null) return -1;
        return a.duration - b.duration;
      });
    } else if (newSortBy === 'age_limit') {
      sortedJobs.sort((a, b) => {
        // 年齢条件を満たすものを優先
        if (a.age_match && !b.age_match) return -1;
        if (!a.age_match && b.age_match) return 1;
        // 年齢制限なしは最後に
        if (a.job.age_limit === null && b.job.age_limit !== null) return 1;
        if (a.job.age_limit !== null && b.job.age_limit === null) return -1;
        return (a.job.age_limit || 999) - (b.job.age_limit || 999);
      });
    } else if (newSortBy === 'location') {
      sortedJobs.sort((a, b) => b.location_match - a.location_match);
    }

    setProcessedJobs(sortedJobs);
  };

  // 通勤手段変更時の処理
  const handleTransportModeChange = (newMode) => {
    setTransportMode(newMode);
    setIsLoading(true);

    // 現在のapplicantと求人データを使用して再計算
    if (applicant && matchingJobs.length > 0) {
      calculateDistancesWithApplicant(matchingJobs, applicant);
    } else {
      setIsLoading(false);
      setError('求職者データまたは求人データがありません。更新をやり直してください。');
    }
  };

  // デバッグ情報の表示（開発環境のみ）
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px' }}>
        <h4>デバッグ情報（開発環境のみ表示）:</h4>
        <p>求職者ID: {currentApplicantId}</p>
        <p>住所データ: {applicant ? JSON.stringify(applicant.address) : 'なし'}</p>
        <p>利用可能なフィールド: {applicant ? Object.keys(applicant).join(', ') : 'なし'}</p>
        <button onClick={() => console.log('求職者データ:', applicant)} style={{ padding: '5px 10px' }} >
          コンソールに求職者データを出力
        </button>
      </div>
    );
  };

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', margin: '10px 0' }}>
          エラーが発生しました: {error}
        </div>
        <Link to="/applicants" style={{ textDecoration: 'none', color: '#333' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px' }}>
            <span style={{ marginRight: '5px' }}>&larr;</span> 求職者一覧に戻る
          </div>
        </Link>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div style={{ padding: '20px' }}>
        <div>求職者情報が見つかりません</div>
        <Link to="/applicants" style={{ textDecoration: 'none', color: '#333' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px' }}>
            <span style={{ marginRight: '5px' }}>&larr;</span> 求職者一覧に戻る
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link to={`/applicants/${currentApplicantId}`} style={{ textDecoration: 'none', color: '#333' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '5px' }}>&larr;</span> 求職者詳細に戻る
          </div>
        </Link>
        <h2 style={{ margin: 0 }}>{applicant.name} さんに合う求人</h2>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>住所:</strong> {applicant.address ? (
              <span>{applicant.address}</span>
            ) : (
              <span style={{ color: 'red' }}>
                住所情報なし（距離計算には住所が必要です）
                <Link to={`/applicants/edit/${currentApplicantId}`} style={{ marginLeft: '10px', color: 'blue' }}>
                  住所を設定する
                </Link>
              </span>
            )}
            {applicant.commute_method && <span style={{ marginLeft: '15px' }}><strong>通勤手段:</strong> {applicant.commute_method}</span>}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div>
              <label htmlFor="transport-mode" style={{ marginRight: '8px' }}>移動手段:</label>
              <select
                id="transport-mode"
                value={transportMode}
                onChange={(e) => handleTransportModeChange(e.target.value)}
                style={{ padding: '5px', borderRadius: '4px' }}
              >
                <option value="driving">車</option>
                <option value="transit">公共交通機関</option>
                <option value="bicycling">自転車</option>
                <option value="walking">徒歩</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort-select" style={{ marginRight: '8px' }}>ソート:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                style={{ padding: '5px', borderRadius: '4px' }}
              >
                <option value="distance">所要時間順</option>
                <option value="age_limit">年齢条件順</option>
                <option value="location">希望勤務地優先</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* デバッグ情報（開発環境のみ） */}
      {renderDebugInfo()}

      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>近い順の求人一覧（上位{displayCount}件）</h3>
        </div>

        {processedJobs.length > 0 ? (
          <div>
            {/* 求職者の年齢情報を表示 */}
            {processedJobs[0].applicant_age && (
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                <p style={{ margin: 0 }}>
                  <strong>求職者の年齢:</strong> {processedJobs[0].applicant_age}歳
                  {sortBy === 'distance' && ' (所要時間が短い求人を優先的に表示しています)'}
                </p>
              </div>
            )}

            {/* 求人リスト */}
            {processedJobs.map((result, index) => (
              <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0 }}>{result.job.title || result.job.company}</h4>

                  {/* 所要時間バッジ */}
                  <div style={{
                    padding: '3px 8px',
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span>所要時間: {result.durationText || '計算中...'}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {/* 年齢条件バッジ */}
                  <span style={{
                    padding: '2px 6px',
                    backgroundColor: result.age_match ? '#e8f5e9' : '#ffebee',
                    color: result.age_match ? '#2e7d32' : '#c62828',
                    borderRadius: '4px',
                    fontSize: '0.85em'
                  }}>
                    {result.age_match ? '年齢条件OK' : '年齢超過'}
                    {result.job.age_limit && ` (上限${result.job.age_limit}歳)`}
                  </span>

                  {/* 距離バッジ */}
                  <span style={{
                    padding: '2px 6px',
                    backgroundColor: '#f0f4c3',
                    borderRadius: '4px',
                    fontSize: '0.85em'
                  }}>
                    距離: {result.distanceText || '計算中...'}
                  </span>

                  {/* 希望勤務地マッチバッジ */}
                  {result.location_match > 0 && (
                    <span style={{
                      padding: '2px 6px',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '4px',
                      fontSize: '0.85em'
                    }}>
                      勤務地マッチ: {result.location_match === 100 ? '完全一致' : '部分一致'}
                    </span>
                  )}
                </div>

                <p><strong>企業:</strong> {result.job.company}</p>
                <p><strong>勤務地:</strong> {result.job.prefecture} {result.job.city || ''}</p>
                <p><strong>給与:</strong> {result.job.salary || '情報なし'}</p>

                <div style={{ textAlign: 'right' }}>
                  <Link to={`/jobs/${result.job.id}`}>
                    <button style={{
                      padding: '5px 10px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      詳細を見る
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <p>マッチする求人が見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicantMatching;

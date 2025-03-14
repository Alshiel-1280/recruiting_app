import sqlite3
from sqlalchemy import create_engine
import sqlite3

# データベースURI

DATABASE_URI = 'sqlite:///recruiting.db'
DATABASE_URI = 'sqlite:///../../../recruiting.db'

# SQLAlchemyエンジンを作成
engine = create_engine(DATABASE_URI)

# データベースに接続
conn = engine.raw_connection()
# データベースに接続

conn = sqlite3.connect('recruiting.db')
conn = sqlite3.connect('../../../recruiting.db')
cursor = conn.cursor()

# テーブルの一覧を取得
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("データベース内のテーブル一覧:")
for table in tables:
    print(table[0])

# jobテーブルの内容を出力
print("\njobテーブルの内容:")
cursor.execute("SELECT * FROM job;")
jobs = cursor.fetchall()
for job in jobs:
    print(job)

# 接続を閉じる
conn.close()

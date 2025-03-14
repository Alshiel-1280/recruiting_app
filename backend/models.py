from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import traceback

db = SQLAlchemy()

class Applicant(db.Model):
    """求職者モデル"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255))
    desired_occupation = db.Column(db.String(100))
    desired_location = db.Column(db.String(100))
    birthdate = db.Column(db.Date)
    email = db.Column(db.String(100))
    phone_number = db.Column(db.String(20))
    gender = db.Column(db.String(20))
    nationality = db.Column(db.String(50))
    employment_status = db.Column(db.String(50))
    available_date = db.Column(db.String(50))
    employment_period = db.Column(db.String(50))
    medical_history = db.Column(db.Text)
    disability_certificate = db.Column(db.String(10))
    tattoo = db.Column(db.String(10))
    tattoo_details = db.Column(db.Text)
    criminal_record = db.Column(db.String(10))
    clothing_size = db.Column(db.String(10))
    commute_or_dormitory = db.Column(db.String(50))
    commute_method = db.Column(db.String(50))
    commute_area = db.Column(db.String(100))
    factory_experience = db.Column(db.String(100))
    experience_details = db.Column(db.Text)
    desired_working_hours = db.Column(db.String(100))
    recent_applications = db.Column(db.Text)
    most_important_point = db.Column(db.String(100))
    important_point_details = db.Column(db.Text)
    desired_salary = db.Column(db.String(50))
    height = db.Column(db.String(20))
    weight = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 進捗状況フィールド
    application_date = db.Column(db.Date)
    call_date = db.Column(db.Date)
    connection_date = db.Column(db.Date)
    proposal_date = db.Column(db.Date)
    document_sent_date = db.Column(db.Date)
    document_passed_date = db.Column(db.Date)
    interview_date = db.Column(db.Date)
    offer_date = db.Column(db.Date)
    hire_date = db.Column(db.Date)
    payment_date = db.Column(db.Date)
    
    # 紹介料フィールド
    referral_fee = db.Column(db.Integer)
    
    assigned_employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=True)
    assigned_employee = db.relationship('Employee', backref=db.backref('assigned_applicants', lazy=True))
    
    # 面接関連の情報
    interviews = db.relationship('Interview', backref='applicant', lazy=True)
    
    def to_dict(self):
        """モデルを辞書に変換"""
        try:
            return {
                'id': self.id,
                'name': self.name,
                'address': self.address,
                'desired_occupation': self.desired_occupation,
                'desired_location': self.desired_location,
                'birthdate': self.birthdate.strftime('%Y-%m-%d') if self.birthdate else None,
                'email': self.email,
                'phone_number': self.phone_number,
                'gender': self.gender,
                'nationality': self.nationality,
                'employment_status': self.employment_status,
                'available_date': self.available_date,
                'employment_period': self.employment_period,
                'medical_history': self.medical_history,
                'disability_certificate': self.disability_certificate,
                'tattoo': self.tattoo,
                'tattoo_details': self.tattoo_details,
                'criminal_record': self.criminal_record,
                'clothing_size': self.clothing_size,
                'commute_or_dormitory': self.commute_or_dormitory,
                'commute_method': self.commute_method,
                'commute_area': self.commute_area,
                'factory_experience': self.factory_experience,
                'experience_details': self.experience_details,
                'desired_working_hours': self.desired_working_hours,
                'recent_applications': self.recent_applications,
                'most_important_point': self.most_important_point,
                'important_point_details': self.important_point_details,
                'desired_salary': self.desired_salary,
                'height': self.height,
                'weight': self.weight,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None,
                'application_date': self.application_date.strftime('%Y-%m-%d') if self.application_date else None,
                'call_date': self.call_date.strftime('%Y-%m-%d') if self.call_date else None,
                'connection_date': self.connection_date.strftime('%Y-%m-%d') if self.connection_date else None,
                'proposal_date': self.proposal_date.strftime('%Y-%m-%d') if self.proposal_date else None,
                'document_sent_date': self.document_sent_date.strftime('%Y-%m-%d') if self.document_sent_date else None,
                'document_passed_date': self.document_passed_date.strftime('%Y-%m-%d') if self.document_passed_date else None,
                'interview_date': self.interview_date.strftime('%Y-%m-%d') if self.interview_date else None,
                'offer_date': self.offer_date.strftime('%Y-%m-%d') if self.offer_date else None,
                'hire_date': self.hire_date.strftime('%Y-%m-%d') if self.hire_date else None,
                'payment_date': self.payment_date.strftime('%Y-%m-%d') if self.payment_date else None,
                'referral_fee': self.referral_fee,
            }
            
            # 生年月日から年齢を計算して追加
            if self.birthdate:
                from datetime import date
                today = date.today()
                age = today.year - self.birthdate.year - ((today.month, today.day) < (self.birthdate.month, self.birthdate.day))
                result['age'] = age
            
            return result
        
            # 担当社員IDをモデル属性から追加（ある場合）
            if hasattr(self, 'assigned_employee_id') and self.assigned_employee_id is not None:
                result['assigned_employee_id'] = self.assigned_employee_id
            
            # 代替フィールドから担当社員IDを抽出（ある場合）
            elif self.important_point_details and '【担当社員ID】' in self.important_point_details:
                import re
                match = re.search(r'【担当社員ID】(\d+)', self.important_point_details)
                if match:
                    result['assigned_employee_id'] = int(match.group(1))
            
            # バックアップフィールドから担当社員IDを抽出（ある場合）
            elif self.most_important_point and '担当社員ID:' in self.most_important_point:
                import re
                match = re.search(r'担当社員ID:(\d+)', self.most_important_point)
                if match:
                    result['assigned_employee_id'] = int(match.group(1))
                    
            # 生年月日から年齢を計算して追加
            if self.birthdate:
                from datetime import date
                today = date.today()
                age = today.year - self.birthdate.year - ((today.month, today.day) < (self.birthdate.month, self.birthdate.day))
                result['age'] = age
                
            return result
        
        except Exception as e:
            print(f"to_dict error for applicant {self.id}: {str(e)}")
            return {
                'id': self.id,
                'name': self.name or "不明",
                'error': f"データ変換エラー: {str(e)}"
            }

class PhoneCall(db.Model):
    """架電記録モデル"""
    id = db.Column(db.Integer, primary_key=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey('applicant.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'))
    call_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, completed, no_answer, cancelled
    notes = db.Column(db.Text)
    follow_up_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーションシップ
    applicant = db.relationship('Applicant', backref=db.backref('phone_calls', lazy=True))
    employee = db.relationship('Employee', backref=db.backref('phone_calls', lazy=True))
    
    def to_dict(self):
        """モデルを辞書に変換"""
        try:
            return {
                'id': self.id,
                'applicant_id': self.applicant_id,
                'employee_id': self.employee_id,
                'call_date': self.call_date.isoformat() if self.call_date else None,
                'status': self.status,
                'notes': self.notes,
                'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
        except Exception as e:
            print(f"to_dict error for phone call {self.id}: {str(e)}")
            return {
                'id': self.id,
                'applicant_id': self.applicant_id,
                'error': f"データ変換エラー: {str(e)}"
            }

class Job(db.Model):
    """求人情報モデル"""
    id = db.Column(db.Integer, primary_key=True)
    job_url = db.Column(db.String(255))  # ジョブパルURL
    job_number = db.Column(db.String(50))  # お仕事No
    cf_fc = db.Column(db.String(50)) # cf / fc / 事業所
    company = db.Column(db.String(100), nullable=False) # 企業名/工場名
    prefecture = db.Column(db.String(50))  # 所在地（都道府県）
    city = db.Column(db.String(100))  # 所在地（市区町村以降）
    title = db.Column(db.String(100), nullable=False) # CNT, AIM両方に存在しないが、モデルには存在。念の為残す。
    salary = db.Column(db.String(50))
    fee = db.Column(db.String(50))
    age_limit = db.Column(db.Integer)  # 年齢上限を整数型で定義
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)
    benefits = db.Column(db.Text)
    working_hours = db.Column(db.String(100))
    employment_type = db.Column(db.String(50))
    holidays = db.Column(db.String(100)) # 休日
    dormitory = db.Column(db.Boolean, default=False) # 入寮可否
    housing_cost = db.Column(db.String(50)) # 社宅費負担
    housing_allowance = db.Column(db.String(50)) # 社宅費補助額
    work_style = db.Column(db.String(50)) # 勤務形態
    annual_holidays = db.Column(db.String(50)) # 年間休日
    gender = db.Column(db.String(20)) # 性別
    min_age = db.Column(db.Integer) # 年齢下限
    work_experience = db.Column(db.Text) # 業務経験
    occupation_experience = db.Column(db.Text) # 職種経験
    japanese_required = db.Column(db.Boolean, default=False) # 外国人受け入れ
    commute_method = db.Column(db.String(100)) # 通勤手段
    nearest_station = db.Column(db.String(100)) # 最寄り駅
    salary_type = db.Column(db.String(50)) # 給与形態
    hourly_wage = db.Column(db.Integer) # 時給
    shift = db.Column(db.String(50)) # シフト
    products = db.Column(db.String(100)) # 生産品目
    occupation_major_category = db.Column(db.String(50)) # 職種大分類
    occupation_minor_category = db.Column(db.String(50)) # 職種小分類
    advantages = db.Column(db.Text) # メリット
    smoking_measures = db.Column(db.Text) # 受動喫煙防止対策
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 面接関連の情報
    interviews = db.relationship('Interview', backref='job', lazy=True)
    
    def to_dict(self):
        """モデルを辞書に変換"""
        try:
            return {
                'id': self.id,
                'job_url': self.job_url,
                'job_number': self.job_number,
                'cf_fc': self.cf_fc,
                'company': self.company,
                'prefecture': self.prefecture,
                'city': self.city,
                'title': self.title,
                'salary': self.salary,
                'fee': self.fee,
                'age_limit': self.age_limit,
                'description': self.description,
                'requirements': self.requirements,
                'benefits': self.benefits,
                'working_hours': self.working_hours,
                'employment_type': self.employment_type,
                'holidays': self.holidays,
                'dormitory': self.dormitory,
                'housing_cost': self.housing_cost,
                'housing_allowance': self.housing_allowance,
                'work_style': self.work_style,
                'annual_holidays': self.annual_holidays,
                'gender': self.gender,
                'min_age': self.min_age,
                'work_experience': self.work_experience,
                'occupation_experience': self.occupation_experience,
                'japanese_required': self.japanese_required,
                'commute_method': self.commute_method,
                'nearest_station': self.nearest_station,
                'salary_type': self.salary_type,
                'hourly_wage': self.hourly_wage,
                'shift': self.shift,
                'products': self.products,
                'occupation_major_category': self.occupation_major_category,
                'occupation_minor_category': self.occupation_minor_category,
                'advantages': self.advantages,
                'smoking_measures': self.smoking_measures,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
        except Exception as e:
            print(f"to_dict error for job {self.id}: {str(e)}")
            return {
                'id': self.id,
                'company': self.company or "不明",
                'error': f"データ変換エラー: {str(e)}"
            }

class Employee(db.Model):
    """社員モデル"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(50))
    position = db.Column(db.String(50))
    email = db.Column(db.String(100))
    phone_number = db.Column(db.String(20))
    hire_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """モデルを辞書に変換"""
        try:
            return {
                'id': self.id,
                'name': self.name,
                'department': self.department,
                'position': self.position,
                'email': self.email,
                'phone_number': self.phone_number,
                'hire_date': self.hire_date.strftime('%Y-%m-%d') if self.hire_date else None,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
        except Exception as e:
            print(f"to_dict error for employee {self.id}: {str(e)}")
            return {
                'id': self.id,
                'name': self.name or "不明",
                'error': f"データ変換エラー: {str(e)}"
            }

class Interview(db.Model):
    """面接モデル"""
    id = db.Column(db.Integer, primary_key=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey('applicant.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, completed, cancelled
    result = db.Column(db.String(20))  # passed, failed
    notes = db.Column(db.Text)
    preparation_info = db.Column(db.Text)  # 面接対策情報
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """モデルを辞書に変換"""
        try:
            return {
                'id': self.id,
                'applicant_id': self.applicant_id,
                'job_id': self.job_id,
                'date': self.date.isoformat() if self.date else None,
                'status': self.status,
                'result': self.result,
                'notes': self.notes,
                'preparation_info': self.preparation_info,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
        except Exception as e:
            print(f"to_dict error for interview {self.id}: {str(e)}")
            return {
                'id': self.id,
                'applicant_id': self.applicant_id,
                'job_id': self.job_id,
                'error': f"データ変換エラー: {str(e)}"
            }

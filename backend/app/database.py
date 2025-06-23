import os
from sqlalchemy import create_engine, Column, String, Boolean, DateTime, ForeignKey, Index, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.pool import StaticPool
from dotenv import load_dotenv
import datetime

# 加载环境变量
load_dotenv()

# 数据库配置
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./couple_scheduler.db")

# 创建SQLAlchemy引擎
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

# 创建会话
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()

# 定义模型
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Couple(Base):
    __tablename__ = "couples"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    partner_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # 创建索引
    __table_args__ = (
        Index('idx_user_partner', 'user_id', 'partner_id'),
    )

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(String, nullable=True)
    date = Column(DateTime, index=True)
    assignee = Column(String)
    priority = Column(String)
    couple_id = Column(String, index=True)
    completed = Column(Boolean, default=False)
    created_by = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

# 数据库依赖
def get_db():
    print("get_db 被调用", flush=True)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 初始化数据库
def init_db():
    """初始化数据库"""
    try:
        Base.metadata.create_all(bind=engine)
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")

# 关闭数据库
def close_db():
    """关闭数据库连接"""
    pass
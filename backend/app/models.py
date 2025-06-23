from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

# 用户模型
class UserBase(BaseModel):
    username: str
    
class UserCreate(UserBase):
    password: str
    
class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    
class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

# 情侣关系模型
class CoupleBase(BaseModel):
    user_id: str
    partner_id: str
    
class CoupleCreate(CoupleBase):
    pass
    
class CoupleInDB(CoupleBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
class Couple(CoupleBase):
    id: str
    created_at: datetime
    updated_at: datetime

# 任务模型
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: datetime
    assignee: str  # user_id 或 "both"
    priority: str = "medium"  # "high", "medium", "low"
    
class TaskCreate(TaskBase):
    couple_id: str
    
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    assignee: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None
    
class TaskInDB(TaskBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    couple_id: str
    completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str  # user_id
    
class Task(TaskBase):
    id: str
    couple_id: str
    completed: bool
    created_at: datetime
    updated_at: datetime
    created_by: str

# 认证模型
class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenData(BaseModel):
    user_id: Optional[str] = None
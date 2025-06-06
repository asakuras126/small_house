from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.models import User, UserCreate, UserUpdate, Token
from app.auth import (
    authenticate_user, create_access_token, get_current_user,
    get_password_hash, get_user_by_email, get_user_by_username,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.database import get_db, User as DBUser
from typing import List
import uuid
import datetime

router = APIRouter()

@router.post("/register", response_model=User)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """注册新用户"""
    # 检查用户名是否已存在
    existing_user = get_user_by_username(db, user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已被使用"
        )
    
    # 检查邮箱是否已存在
    existing_email = get_user_by_email(db, user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )
    
    # 创建新用户
    hashed_password = get_password_hash(user_data.password)
    user_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    
    db_user = DBUser(
        id=user_id,
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        created_at=now,
        updated_at=now
    )
    
    # 保存到数据库
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # 返回用户信息（不包含密码）
    return User(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        created_at=db_user.created_at,
        updated_at=db_user.updated_at
    )

@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """用户登录获取令牌"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return current_user

@router.put("/me", response_model=User)
def update_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新当前用户信息"""
    # 获取数据库中的用户
    db_user = db.query(DBUser).filter(DBUser.id == current_user.id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 检查用户名更新
    if user_update.username and user_update.username != db_user.username:
        existing_user = get_user_by_username(db, user_update.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已被使用"
            )
        db_user.username = user_update.username
    
    # 检查邮箱更新
    if user_update.email and user_update.email != db_user.email:
        existing_email = get_user_by_email(db, user_update.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被注册"
            )
        db_user.email = user_update.email
    
    # 检查密码更新
    if user_update.password:
        db_user.hashed_password = get_password_hash(user_update.password)
    
    # 更新时间
    db_user.updated_at = datetime.datetime.utcnow()
    
    # 提交更改
    db.commit()
    db.refresh(db_user)
    
    # 返回更新后的用户信息
    return User(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        created_at=db_user.created_at,
        updated_at=db_user.updated_at
    )
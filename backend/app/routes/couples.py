from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models import User, Couple, CoupleCreate
from app.auth import get_current_user, get_user
from app.database import get_db, Couple as DBCouple, User as DBUser
import datetime
import uuid
from sqlalchemy import or_
from fastapi import Request

router = APIRouter()

@router.post("/", response_model=Couple)
def create_couple(
    couple_data: CoupleCreate,
    db: Session = Depends(get_db)
):
    """创建情侣关系"""
    # 检查伴侣是否存在
    partner = db.query(DBUser).filter(DBUser.id == couple_data.partner_id).first()
    
    # 如果伴侣不存在，但ID以"partner_"开头，则创建一个虚拟伴侣
    if not partner and couple_data.partner_id.startswith("partner_"):
        # 从伴侣ID中提取邮箱（去掉"partner_"前缀，将下划线替换为@和.）
        email_parts = couple_data.partner_id[8:].split('_')
        if len(email_parts) >= 2:
            email = email_parts[0] + "@" + "_".join(email_parts[1:])
        else:
            email = couple_data.partner_id[8:] + "@example.com"
        
        # 创建虚拟伴侣用户
        partner_id = couple_data.partner_id
        now = datetime.datetime.utcnow()
        
        db_partner = DBUser(
            id=partner_id,
            username=email.split('@')[0],
            email=email,
            hashed_password="$2b$12$virtual_partner_no_login",  # 虚拟密码，无法登录
            created_at=now,
            updated_at=now
        )
        
        # 保存到数据库
        db.add(db_partner)
        db.commit()
        db.refresh(db_partner)
        
        partner = db_partner
    elif not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="伴侣用户不存在"
        )
    
    # 检查是否已经存在情侣关系
    existing_couple = db.query(DBCouple).filter(
        or_(
            (DBCouple.user_id == couple_data.user_id) & (DBCouple.partner_id == couple_data.partner_id),
            (DBCouple.user_id == couple_data.partner_id) & (DBCouple.partner_id == couple_data.user_id)
        )
    ).first()
    
    if existing_couple:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="情侣关系已存在"
        )
    
    # 创建新的情侣关系
    couple_id = str(uuid.uuid4())
    now = datetime.datetime.utcnow()
    
    db_couple = DBCouple(
        id=couple_id,
        user_id=couple_data.user_id,
        partner_id=couple_data.partner_id,
        created_at=now,
        updated_at=now
    )
    
    # 保存到数据库
    db.add(db_couple)
    db.commit()
    db.refresh(db_couple)
    
    # 返回情侣关系信息
    return Couple(
        id=db_couple.id,
        user_id=db_couple.user_id,
        partner_id=db_couple.partner_id,
        created_at=db_couple.created_at,
        updated_at=db_couple.updated_at
    )

@router.get("/", response_model=Couple)
def get_couple(user_id: str, db: Session = Depends(get_db)):
    """获取当前用户的情侣关系"""
    couple = db.query(DBCouple).filter(
        or_(
            DBCouple.user_id == user_id,
            DBCouple.partner_id == user_id
        )
    ).first()
    
    if not couple:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="未找到情侣关系"
        )
    
    return Couple(
        id=couple.id,
        user_id=couple.user_id,
        partner_id=couple.partner_id,
        created_at=couple.created_at,
        updated_at=couple.updated_at
    )

@router.get("/partner", response_model=User)
def get_partner(user_id: str, db: Session = Depends(get_db)):
    """获取当前用户的伴侣信息"""
    couple = db.query(DBCouple).filter(
        or_(
            DBCouple.user_id == user_id,
            DBCouple.partner_id == user_id
        )
    ).first()
    
    if not couple:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="未找到情侣关系"
        )
    
    # 确定伴侣ID
    partner_id = couple.partner_id if couple.user_id == user_id else couple.user_id
    
    # 获取伴侣信息
    partner = db.query(DBUser).filter(DBUser.id == partner_id).first()
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="未找到伴侣信息"
        )
    
    return User(
        id=partner.id,
        username=partner.username,
        created_at=partner.created_at,
        updated_at=partner.updated_at
    )

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def delete_couple(user_id: str, db: Session = Depends(get_db)):
    """删除情侣关系"""
    couple = db.query(DBCouple).filter(
        or_(
            DBCouple.user_id == user_id,
            DBCouple.partner_id == user_id
        )
    ).first()
    
    if not couple:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="未找到情侣关系"
        )
    
    # 删除情侣关系
    db.delete(couple)
    db.commit()
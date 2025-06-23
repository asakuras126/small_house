from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from app.models import User, Task, TaskCreate, TaskUpdate
from app.database import get_db, Task as DBTask, Couple as DBCouple
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

router = APIRouter()

def get_couple_id(db: Session, user_id: str):
    """获取用户的情侣关系ID"""
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
    
    return couple.id

@router.post("/", response_model=Task)
def create_task(
    task_data: TaskCreate,
    user_id: str,
    db: Session = Depends(get_db)
):
    """创建新任务"""
    # 验证情侣关系
    couple_id = get_couple_id(db, user_id)
    
    # 验证任务所属的情侣关系是否与当前用户匹配
    if task_data.couple_id != couple_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="只能为自己的情侣关系创建任务"
        )
    
    # 创建新任务
    task_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    db_task = DBTask(
        id=task_id,
        title=task_data.title,
        description=task_data.description,
        date=task_data.date,
        assignee=task_data.assignee,
        priority=task_data.priority,
        couple_id=task_data.couple_id,
        created_by=user_id,
        created_at=now,
        updated_at=now,
        completed=False
    )
    
    # 保存到数据库
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # 返回任务信息
    return Task(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        date=db_task.date,
        assignee=db_task.assignee,
        priority=db_task.priority,
        couple_id=db_task.couple_id,
        completed=db_task.completed,
        created_at=db_task.created_at,
        updated_at=db_task.updated_at,
        created_by=db_task.created_by
    )

@router.get("/", response_model=List[Task])
def get_tasks(
    user_id: str,
    period: Optional[str] = Query(None, description="过滤时间段: today, tomorrow, week, future, all"),
    completed: Optional[bool] = Query(None, description="过滤完成状态"),
    db: Session = Depends(get_db)
):
    """获取任务列表"""
    # 获取情侣关系ID
    couple_id = get_couple_id(db, user_id)
    
    # 构建查询条件
    query = db.query(DBTask).filter(DBTask.couple_id == couple_id)
    
    # 根据完成状态过滤
    if completed is not None:
        query = query.filter(DBTask.completed == completed)
    
    # 根据时间段过滤
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    tomorrow_start = today_start + timedelta(days=1)
    tomorrow_end = tomorrow_start + timedelta(days=1)
    week_start = today_start + timedelta(days=2)  # 从后天开始
    week_end = today_start + timedelta(days=7)
    
    if period == "today":
        query = query.filter(and_(DBTask.date >= today_start, DBTask.date < tomorrow_start))
    elif period == "tomorrow":
        query = query.filter(and_(DBTask.date >= tomorrow_start, DBTask.date < tomorrow_end))
    elif period == "week":
        query = query.filter(and_(DBTask.date >= week_start, DBTask.date < week_end))
    elif period == "future":
        query = query.filter(DBTask.date >= week_end)
    elif period == "all":
        # 在"全部"选项卡中显示所有任务，包括过去的任务
        pass
    else:
        # 默认显示所有任务
        pass
    
    # 查询任务并按日期排序
    tasks = query.order_by(DBTask.date).all()
    
    return [
        Task(
            id=task.id,
            title=task.title,
            description=task.description,
            date=task.date,
            assignee=task.assignee,
            priority=task.priority,
            couple_id=task.couple_id,
            completed=task.completed,
            created_at=task.created_at,
            updated_at=task.updated_at,
            created_by=task.created_by
        ) for task in tasks
    ]

@router.get("/{task_id}", response_model=Task)
def get_task(
    task_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """获取单个任务详情"""
    # 获取情侣关系ID
    couple_id = get_couple_id(db, user_id)
    
    # 查询任务
    task = db.query(DBTask).filter(
        and_(DBTask.id == task_id, DBTask.couple_id == couple_id)
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在或无权访问"
        )
    
    return Task(
        id=task.id,
        title=task.title,
        description=task.description,
        date=task.date,
        assignee=task.assignee,
        priority=task.priority,
        couple_id=task.couple_id,
        completed=task.completed,
        created_at=task.created_at,
        updated_at=task.updated_at,
        created_by=task.created_by
    )

@router.put("/{task_id}", response_model=Task)
def update_task(
    task_id: str,
    task_update: TaskUpdate,
    user_id: str,
    db: Session = Depends(get_db)
):
    """更新任务"""
    # 获取情侣关系ID
    couple_id = get_couple_id(db, user_id)
    
    # 查询任务
    task = db.query(DBTask).filter(
        and_(DBTask.id == task_id, DBTask.couple_id == couple_id)
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在或无权访问"
        )
    
    # 更新任务字段
    if task_update.title is not None:
        task.title = task_update.title
    
    if task_update.description is not None:
        task.description = task_update.description
    
    if task_update.date is not None:
        task.date = task_update.date
    
    if task_update.assignee is not None:
        task.assignee = task_update.assignee
    
    if task_update.priority is not None:
        task.priority = task_update.priority
    
    if task_update.completed is not None:
        task.completed = task_update.completed
    
    # 更新时间
    task.updated_at = datetime.utcnow()
    
    # 提交更改
    db.commit()
    db.refresh(task)
    
    # 返回更新后的任务
    return Task(
        id=task.id,
        title=task.title,
        description=task.description,
        date=task.date,
        assignee=task.assignee,
        priority=task.priority,
        couple_id=task.couple_id,
        completed=task.completed,
        created_at=task.created_at,
        updated_at=task.updated_at,
        created_by=task.created_by
    )

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """删除任务"""
    # 获取情侣关系ID
    couple_id = get_couple_id(db, user_id)
    
    # 查询任务
    task = db.query(DBTask).filter(
        and_(DBTask.id == task_id, DBTask.couple_id == couple_id)
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在或无权访问"
        )
    
    # 删除任务
    db.delete(task)
    db.commit()
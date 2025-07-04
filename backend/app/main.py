from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from app.routes import users, tasks, couples
from app.database import init_db, get_db
from sqlalchemy.orm import Session
import logging

app = FastAPI(
    title="情侣日程小程序 API",
    description="情侣双人日程小程序的后端API",
    version="1.0.0"
)

# 日志配置
logging.basicConfig(level=logging.INFO)

# 配置CORS
origins = [
    "http://localhost:12000",
    "https://work-1-ywbhbikoyjcaxyrh.prod-runtime.all-hands.dev",
    "https://work-2-ywbhbikoyjcaxyrh.prod-runtime.all-hands.dev",
    "http://10.2.41.141:12000",  # 添加网络IP地址
    "*",  # 允许所有来源（仅用于开发环境）
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.middleware("http")
# async def log_request(request: Request, call_next):
#     body = await request.body()
#     logging.info(f"收到请求: {request.method} {request.url}")
#     logging.info(f"请求头: {dict(request.headers)}")
#     logging.info(f"请求体: {body.decode('utf-8', errors='ignore')}")
#     response = await call_next(request)
#     return response

# 初始化数据库
@app.on_event("startup")
def startup_db_client():
    init_db()

# 包含路由
app.include_router(users.router, prefix="/api/users", tags=["用户"])
app.include_router(couples.router, prefix="/api/couples", tags=["情侣"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["任务"])

@app.get("/")
async def root():
    return {"message": "欢迎使用情侣日程小程序API"}
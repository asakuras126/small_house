import uvicorn

if __name__ == "__main__":
    # 使用端口12001，这是分配给work-2的端口
    uvicorn.run("app.main:app", host="0.0.0.0", port=12001, reload=True)
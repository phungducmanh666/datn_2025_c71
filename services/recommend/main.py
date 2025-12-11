from fastapi import FastAPI
from controllers import embedding_controller
from middlewares.error_handler import ErrorHandlerMiddleware

app = FastAPI(title="Embedding Service")

app.add_middleware(ErrorHandlerMiddleware)

app.include_router(embedding_controller.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Chào mừng đến với Embedding Service"}

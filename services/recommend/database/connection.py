from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from config.settings import get_settings

settings = get_settings()

# engine sync (pyodbc là sync)
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    echo=False,
    pool_pre_ping=True,        # ping trước khi dùng kết nối (tránh stale)
    pool_size=10,
    max_overflow=20,
    fast_executemany=True      # tối ưu bulk insert cho pyodbc
)
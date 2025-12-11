from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Ví dụ SQL Auth
    MSSQL_SERVER: str = "localhost,1433"
    MSSQL_DB: str = "recommendation_system"
    MSSQL_USER: str = "sa"
    MSSQL_PASSWORD: str = "YourStrong!Passw0rd"
    ODBC_DRIVER: str = "ODBC Driver 17 for SQL Server"  # hoặc "ODBC Driver 17 for SQL Server"
    # Nếu DEV không có cert, bật TrustServerCertificate
    DB_ENCRYPT: str = "yes"   # yes/no
    DB_TRUST_SERVER_CERT: str = "yes"  # yes/no

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # mssql+pyodbc với DSN kết nối đầy đủ
        # Lưu ý: dùng ; trong query string, SQLAlchemy yêu cầu encode: "..." ?driver=ODBC+Driver+18+for+SQL+Server
        driver_enc = self.ODBC_DRIVER.replace(" ", "+")
        return (
            "mssql+pyodbc://"
            f"{self.MSSQL_USER}:{self.MSSQL_PASSWORD}"
            f"@{self.MSSQL_SERVER}/{self.MSSQL_DB}"
            f"?driver={driver_enc}"
            f"&Encrypt={self.DB_ENCRYPT}"
            f"&TrustServerCertificate={self.DB_TRUST_SERVER_CERT}"
        )

@lru_cache
def get_settings() -> Settings:
    return Settings()  # tự động đọc biến môi trường .env nếu có python-dotenv

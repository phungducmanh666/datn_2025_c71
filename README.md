# Hướng Dẫn Chạy Dự Án

## Yêu Cầu Hệ Thống
- Docker và Docker Compose
- SQL Server (được chạy trong Docker container)
- Đợi từ 5-10 phút để các service khởi động hoàn tất

## Thông Tin Database

### SQL Server Configuration
- **Server**: `localhost,1433`
- **Username**: `sa`
- **Password**: `YourStrong!Passw0rd`
- **Image**: SQL Server 2022 Latest

> **📌 Lưu ý về Kiến trúc Database**
> 
> Dự án sử dụng **kiến trúc Microservices** với **Database per Service pattern**, nhưng để tối ưu tài nguyên trên môi trường development, tất cả các database được đặt trong **một SQL Server container duy nhất** thay vì mỗi service một container riêng.
> 
> **Lý do:**
> - ✅ Tiết kiệm tài nguyên RAM và CPU
> - ✅ Dễ dàng quản lý và backup
> - ✅ Phù hợp cho môi trường development/testing
> - ✅ Vẫn đảm bảo tính độc lập về mặt logic (mỗi service có database riêng)
> 
> **Trong môi trường Production**, nên tách riêng mỗi database ra container/instance riêng để đảm bảo:
> - Khả năng scale độc lập
> - Isolation và security tốt hơn
> - High availability và fault tolerance

### Danh Sách Databases Cần Tạo
Tất cả các database sau được tạo trong **cùng một SQL Server container**:

1. `product` - Product Service (R2DBC)
2. `user` - User Service (R2DBC)
3. `order` - Order Service (JDBC)
4. `warehouse` - Warehouse Service (JDBC)
5. `promotion` - Promotion Service (JDBC)

## Các Bước Cài Đặt và Chạy Dự Án

### Bước 1: Khởi Động Database Service

Chạy **chỉ database service** trước tiên:

```bash
cd ./services
docker-compose up -d database-service
```

> **Lưu ý**: Đợi khoảng 30 giây để SQL Server khởi động hoàn tất.

### Bước 2: Tạo Các Database Trống

Kết nối đến SQL Server và tạo các database:

#### Sử dụng SQL Server Management Studio (SSMS)
```
Server: localhost,1433
Login: sa
Password: YourStrong!Passw0rd
```

#### Hoặc sử dụng sqlcmd
```bash
# Kết nối vào container
docker exec -it sqlserver-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd"

# Tạo các database
CREATE DATABASE product;
GO
CREATE DATABASE [user];
GO
CREATE DATABASE [order];
GO
CREATE DATABASE warehouse;
GO
CREATE DATABASE promotion;
GO
EXIT
```

#### Hoặc sử dụng Docker exec trực tiếp
```bash
docker exec -it sqlserver-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -Q "CREATE DATABASE product"
docker exec -it sqlserver-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -Q "CREATE DATABASE [user]"
docker exec -it sqlserver-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -Q "CREATE DATABASE [order]"
docker exec -it sqlserver-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -Q "CREATE DATABASE warehouse"
docker exec -it sqlserver-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -Q "CREATE DATABASE promotion"
```

### Bước 3: Chạy SQL Schema cho Product và User Service

Các service sẽ tự động tạo database schema khi chạy, **TRỪ** `product service` và `user service`.

Chạy các file SQL để tạo schema cho hai service này:

#### Sử dụng SSMS
1. Kết nối đến SQL Server
2. Mở file `./database_schema_sql/product.database.sql`
3. Chọn database `product` và Execute
4. Mở file `./database_schema_sql/user.database.sql`
5. Chọn database `user` và Execute

#### Hoặc sử dụng sqlcmd
```bash
# Import schema cho product database
docker exec -i sqlserver-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -d product < ./database_schema_sql/product.database.sql

# Import schema cho user database
docker exec -i sqlserver-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -d user < ./database_schema_sql/user.database.sql
```

### Bước 4: Cấu Hình Google OAuth

Thông tin Google OAuth được lưu trong file `google client oauth.txt`:

```
Google Client ID: 212014364101-b72rca9c0shubom4t6547rdicc5gkf20.apps.googleusercontent.com
Google Client Secret: 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
```

**Để cấu hình đăng nhập bằng Google:**

Mở file `./services/docker-compose.yaml` và cập nhật phần `user-service`:

```yaml
user-service:
  environment:
    # ... các biến môi trường khác ...
    - GOOGLE_AUTH_CLIENT_ID=212014364101-b72rca9c0shubom4t6547rdicc5gkf20.apps.googleusercontent.com
    - GOOGLE_AUTH_CLIENT_SECRET=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
    - GOOGLE_AUTH_REDIRECT_URL=http://localhost:4000/auth/google/callback
```

> **Hiện tại**: File docker-compose.yaml đang có giá trị placeholder `client_id` và `client_secret` cần được thay thế.

### Bước 5: Chạy Tất Cả Các Service

Sau khi đã tạo database và chạy SQL schema, khởi động tất cả các service:

```bash
cd ./services
docker-compose up -d
```

> **Quan trọng**: Đợi từ **5-10 phút** để các service khởi động hoàn tất trước khi chuyển sang bước tiếp theo.

#### Kiểm tra trạng thái services
```bash
# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của một service cụ thể
docker-compose logs -f user-service

# Kiểm tra trạng thái
docker-compose ps
```

### Bước 6: Chạy Recommend Service

Recommend service **không chạy được trên Docker**. Chạy bằng file batch:

```bash
cd ./services/recommend
# Nhấn đúp vào file run.bat hoặc chạy:
run.bat
```

> **Lưu ý**: Service này cần chạy ngoài Docker do yêu cầu về môi trường Python và dependencies đặc biệt.

### Bước 6.5: Kiểm Tra Qdrant Collections (Tùy Chọn)

Chatbot service sẽ **tự động tạo** các Qdrant collections khi khởi động lần đầu tiên:
- `product_embeddings` - Lưu trữ embeddings của sản phẩm
- `business_embeddings` - Lưu trữ embeddings về thông tin doanh nghiệp
- `chat_history_embeddings` - Lưu trữ lịch sử chat

#### Kiểm Tra Collections Đã Được Tạo

```bash
# Kiểm tra danh sách collections
curl http://localhost:6333/collections
```

**Kết quả mong đợi:**
```json
{
  "result": {
    "collections": [
      {"name": "product_embeddings"},
      {"name": "business_embeddings"},
      {"name": "chat_history_embeddings"}
    ]
  }
}
```

#### Xử Lý Lỗi: Tạo Collections Thủ Công

Nếu gặp lỗi liên quan đến Qdrant và xác định collections **chưa được tạo**, tạo thủ công bằng REST API:

```bash
# 1. Tạo product_embeddings collection
curl -X PUT "http://localhost:6333/collections/product_embeddings" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 768,
      "distance": "Cosine"
    }
  }'

# 2. Tạo business_embeddings collection
curl -X PUT "http://localhost:6333/collections/business_embeddings" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 768,
      "distance": "Cosine"
    }
  }'

# 3. Tạo chat_history_embeddings collection
curl -X PUT "http://localhost:6333/collections/chat_history_embeddings" \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 768,
      "distance": "Cosine"
    }
  }'
```

> **Lưu ý**: 
> - `size: 768` là kích thước vector của Gemini embedding model (`text-embedding-004`)
> - `distance: Cosine` là phương pháp tính khoảng cách giữa các vectors
> - Chỉ cần tạo thủ công nếu chatbot service không tự động tạo được

#### Truy Cập Qdrant Dashboard

Để quản lý collections qua giao diện web:
```
http://localhost:6333/dashboard
```

### Bước 7: Chạy Frontend

Sau khi tất cả các service backend đã chạy hoàn tất (đợi 5-10 phút), khởi động frontend:

```bash
cd ./fe
docker-compose up -d
```

## Truy Cập Ứng Dụng

### Frontend
Mở trình duyệt và truy cập:
- **Primary**: `http://localhost:4000`
- **Alternative**: `http://localhost:3000`

### Backend Services
- **API Gateway**: `http://localhost:8080`
- **Eureka Discovery**: `http://localhost:8761`
- **Kafka UI**: `http://localhost:8090`

> **Lưu ý**: Nếu gặp lỗi khi truy cập, rất có thể các service chưa chạy xong. Hãy đợi thêm vài phút và thử lại.

## Thông Tin Đăng Nhập

### Tài Khoản Admin Mặc Định

Khi chạy lần đầu tiên, hệ thống sẽ tự động tạo một tài khoản admin nếu chưa tồn tại.

**Thông tin đăng nhập:**
- **Username**: `admin123`
- **Password**: `admin123`

**Quyền của Admin:**
- `thongke` - Thống kê
- `sanpham` - Sản phẩm
- `kho` - Kho
- `taikhoan` - Tài khoản
- `donhang` - Đơn hàng
- `khachhang` - Khách hàng

> **Lưu ý**: Thông tin tài khoản admin được cấu hình trong biến môi trường `ROOT_USERNAME` và `ROOT_PASSWORD` của user service trong file `./services/docker-compose.yaml`.

## Kiến Trúc Hệ Thống

### Microservices Architecture

```
┌─────────────────┐
│   Frontend      │ :4000, :3000
│   (React/Vue)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │ :8080
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│         Eureka Discovery Service :8761          │
└─────────────────────────────────────────────────┘
         │
         ├──────┬──────┬──────┬──────┬──────┬──────┐
         ▼      ▼      ▼      ▼      ▼      ▼      ▼
    Product  User  Order  Warehouse Promotion Image Chatbot
     :9000  :9002 :9003   :9001    :12000   :8000  :10000
         │      │      │      │      │
         └──────┴──────┴──────┴──────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │    SQL Server Container     │ :1433
         │  ┌───────────────────────┐  │
         │  │ ┌─────────────────┐   │  │
         │  │ │ product DB      │   │  │
         │  │ │ user DB         │   │  │
         │  │ │ order DB        │   │  │
         │  │ │ warehouse DB    │   │  │
         │  │ │ promotion DB    │   │  │
         │  │ └─────────────────┘   │  │
         │  │  Shared Instance      │  │
         │  └───────────────────────┘  │
         └─────────────────────────────┘

         ┌──────┬──────┬──────┐
         ▼      ▼      ▼      
       Kafka  Qdrant  Recommend
       :9092  :6333   :11000
```

> **💡 Giải thích:**
> - Mỗi microservice vẫn có **database riêng biệt** (product, user, order, warehouse, promotion)
> - Tất cả databases được host trong **một SQL Server container** để tiết kiệm tài nguyên
> - Mỗi service chỉ truy cập vào database của chính nó (Database per Service pattern)
> - Không có service nào được phép truy cập trực tiếp vào database của service khác

### Database Connections

| Service | Database | Connection Type | Port |
|---------|----------|-----------------|------|
| Product | `product` | R2DBC (Reactive) | 9000 |
| User | `user` | R2DBC (Reactive) | 9002 |
| Order | `order` | JDBC | 9003 |
| Warehouse | `warehouse` | JDBC | 9001 |
| Promotion | `promotion` | JDBC | 12000 |

### Message Queue (Kafka)

Kafka được sử dụng bởi:
- **Order Service** - Xử lý đơn hàng bất đồng bộ
- **Warehouse Service** - Đồng bộ tồn kho
- **Promotion Service** - Áp dụng khuyến mãi

**Kafka Ports:**
- Internal (Docker): `kafka-1:9092`
- External (Host): `localhost:19092`

## Xử Lý Lỗi Thường Gặp

### 1. Lỗi Khi Nhập Kho hoặc Tạo Khuyến Mãi

**Triệu chứng**: Thao tác thất bại với lỗi authentication

**Nguyên nhân**: Token đăng nhập đã hết hạn

**Giải pháp:**
1. Đăng xuất khỏi hệ thống
2. Đăng nhập lại với tài khoản admin

### 2. Lỗi Khi Truy Cập Frontend

**Triệu chứng**: Không thể truy cập `localhost:4000` hoặc `localhost:3000`

**Nguyên nhân**: Các service backend chưa khởi động hoàn tất

**Giải pháp:**
- Đợi thêm 5-10 phút để các service khởi động đầy đủ
- Kiểm tra logs: `docker-compose logs -f`
- Kiểm tra trạng thái: `docker-compose ps`

### 3. Lỗi Kết Nối Database

**Triệu chứng**: Service không thể kết nối đến SQL Server

**Giải pháp:**
```bash
# Kiểm tra SQL Server đã chạy chưa
docker ps | grep sqlserver-db

# Restart database service
docker-compose restart database-service

# Kiểm tra logs
docker-compose logs database-service
```

### 4. Lỗi Kafka Connection

**Triệu chứng**: Order/Warehouse/Promotion service không hoạt động

**Giải pháp:**
```bash
# Kiểm tra Kafka
docker-compose logs kafka-1

# Restart Kafka
docker-compose restart kafka-1

# Truy cập Kafka UI để monitor
http://localhost:8090
```

### 5. Recommend Service Không Chạy

**Triệu chứng**: Tính năng gợi ý sản phẩm không hoạt động

**Giải pháp:**
- Đảm bảo đã chạy `./services/recommend/run.bat`
- Kiểm tra Python dependencies đã được cài đặt
- Xem logs trong terminal của recommend service

### 6. Lỗi Qdrant Collections

**Triệu chứng**: Chatbot service báo lỗi liên quan đến collections hoặc vector store

**Nguyên nhân**: Qdrant collections chưa được tạo tự động

**Cách kiểm tra:**
```bash
# Kiểm tra danh sách collections
curl http://localhost:6333/collections
```

**Giải pháp:**

Nếu collections chưa tồn tại, tạo thủ công bằng REST API:

```bash
# Tạo product_embeddings
curl -X PUT "http://localhost:6333/collections/product_embeddings" \
  -H "Content-Type: application/json" \
  -d '{"vectors": {"size": 768, "distance": "Cosine"}}'

# Tạo business_embeddings
curl -X PUT "http://localhost:6333/collections/business_embeddings" \
  -H "Content-Type: application/json" \
  -d '{"vectors": {"size": 768, "distance": "Cosine"}}'

# Tạo chat_history_embeddings
curl -X PUT "http://localhost:6333/collections/chat_history_embeddings" \
  -H "Content-Type: application/json" \
  -d '{"vectors": {"size": 768, "distance": "Cosine"}}'
```

Sau đó restart chatbot service:
```bash
docker-compose restart chatbot-service
```

> **Lưu ý**: Thông thường chatbot service sẽ tự động tạo collections khi khởi động. Chỉ cần tạo thủ công nếu gặp lỗi.

## Dừng và Xóa Hệ Thống

### Dừng tất cả services
```bash
# Dừng services
cd ./services
docker-compose down

cd ../fe
docker-compose down
```

### Xóa toàn bộ (bao gồm volumes)
```bash
# Xóa services và volumes (MẤT DỮ LIỆU)
cd ./services
docker-compose down -v

cd ../fe
docker-compose down -v
```

### Khởi động lại từ đầu
```bash
# Xóa containers và volumes
docker-compose down -v

# Xóa images (tùy chọn)
docker-compose down --rmi all

# Build lại và khởi động
docker-compose up -d --build
```

## Tóm Tắt Quy Trình

1. ✅ Chạy database service (`./services/docker-compose.yaml`)
   ```bash
   docker-compose up -d database-service
   ```

2. ✅ Tạo 5 database trống: `product`, `user`, `order`, `warehouse`, `promotion`
   ```bash
   docker exec -it sqlserver-db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd"
   ```

3. ✅ Chạy SQL schema cho `product` và `user` từ `./database_schema_sql/*.sql`

4. ✅ Cấu hình Google OAuth trong `./services/docker-compose.yaml`
   - Client ID: `212014364101-b72rca9c0shubom4t6547rdicc5gkf20.apps.googleusercontent.com`
   - Client Secret: `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`

5. ✅ Chạy tất cả các service
   ```bash
   docker-compose up -d
   ```

6. ⏳ **Đợi 5-10 phút** cho các service khởi động

7. ✅ Chạy recommend service
   ```bash
   cd ./services/recommend
   run.bat
   ```

8. 🔍 (Tùy chọn) Kiểm tra Qdrant collections đã được tạo
   ```bash
   curl http://localhost:6333/collections
   ```
   > Nếu chưa có, tạo thủ công bằng REST API (xem phần Xử Lý Lỗi)

9. ✅ Chạy frontend
   ```bash
   cd ./fe
   docker-compose up -d
   ```

10. ✅ Truy cập `http://localhost:4000` hoặc `http://localhost:3000`

11. ✅ Đăng nhập với tài khoản `admin123` / `admin123`

---

## Thông Tin Bổ Sung

### Ports Summary

| Service | Port | Description |
|---------|------|-------------|
| SQL Server | 1433 | Database |
| Frontend | 3000, 4000 | Web UI |
| API Gateway | 8080 | API Entry Point |
| Eureka | 8761 | Service Discovery |
| Product | 9000 | Product Service |
| Warehouse | 9001 | Warehouse Service |
| User | 9002 | User & Auth Service |
| Order | 9003 | Order Service |
| Image | 8000 | Image Upload Service |
| Kafka | 9092, 19092 | Message Queue |
| Kafka UI | 8090 | Kafka Monitor |
| Chatbot | 10000 | AI Chatbot |
| Recommend | 11000 | Recommendation Engine |
| Promotion | 12000 | Promotion Service |
| Qdrant | 6333, 6334 | Vector Database |

### Environment Variables

Các biến môi trường quan trọng trong `docker-compose.yaml`:

```yaml
# Database
SA_PASSWORD=YourStrong!Passw0rd

# Admin Account
ROOT_USERNAME=admin123
ROOT_PASSWORD=admin123

# Google OAuth
GOOGLE_AUTH_CLIENT_ID=212014364101-b72rca9c0shubom4t6547rdicc5gkf20.apps.googleusercontent.com
GOOGLE_AUTH_CLIENT_SECRET=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

# Kafka
KAFKA_BOOTSTRAP_SERVERS=kafka-1:9092

# Gemini API (Chatbot)
GEMINI_API_KEY=AIzaSyCTGNEA_TGJYrHPEG6Omr0m-GGuBbEeC1Y
```

---

**Chúc bạn triển khai thành công! 🚀**

*Nếu gặp vấn đề, hãy kiểm tra logs bằng lệnh `docker-compose logs -f [service-name]`*

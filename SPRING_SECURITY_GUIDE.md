# Spring Security & JWT Authentication Guide

## 📋 Tổng Quan
Đã tích hợp Spring Security + JWT (JSON Web Token) để bảo vệ các endpoints. Hệ thống hỗ trợ 3 roles: **USER**, **ADMIN**, **STAFF**.

---

## 🔐 Authentication & Authorization

### Roles & Permissions
| Role | Endpoints | Mô Tả |
|------|-----------|-------|
| USER | `/api/auth/**`, `/api/...` | Người dùng bình thường |
| STAFF | `/api/staff/**`, `/api/...` | Nhân viên quản lý đơn hàng |
| ADMIN | `/api/admin/**`, `/api/staff/**`, `/api/...` | Quản trị viên hệ thống |

---

## 🚀 API Endpoints

### 1. **Đăng Ký (Public)**
```
POST /api/auth/dang-ky
Content-Type: application/json

{
  "tenDangNhap": "testuser",
  "matKhau": "123456",
  "email": "testuser@gmail.com",
  "hoTen": "Test User"
}

Response (200):
{
  "message": "Đăng ký thành công!"
}
```

### 2. **Đăng Nhập (Public) - Trả JWT Token**
```
POST /api/auth/dang-nhap
Content-Type: application/json

{
  "taiKhoan": "testuser",
  "matKhau": "123456"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "maNguoiDung": 1,
  "tenDangNhap": "testuser",
  "hoTen": "Test User",
  "email": "testuser@gmail.com",
  "roles": ["USER"],
  "hangThanhVien": "SILVER"
}
```

### 3. **Sử Dụng JWT Token**
```
GET /api/admin/users
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Lưu ý:** Token phải được gửi trong header `Authorization` với format `Bearer <token>`

---

## 👨‍💼 Admin Endpoints (Chỉ ADMIN)

### Danh Sách Người Dùng
```
GET /api/admin/users
Authorization: Bearer <token>

Response (200):
[
  {
    "maNguoiDung": 1,
    "tenDangNhap": "admin",
    "hoTen": "Admin User",
    "email": "admin@gmail.com",
    "danhSachVaiTro": "ADMIN"
  }
]
```

### Chi Tiết Người Dùng
```
GET /api/admin/users/{id}
Authorization: Bearer <token>
```

### Cập Nhật Quyền Người Dùng
```
PUT /api/admin/users/{id}/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "roles": "STAFF"
}

Response (200):
{
  "message": "Cập nhật quyền thành công!"
}
```

### Xóa Người Dùng
```
DELETE /api/admin/users/{id}
Authorization: Bearer <token>

Response (200):
{
  "message": "Xóa người dùng thành công!"
}
```

### Thống Kê Hệ Thống
```
GET /api/admin/stats
Authorization: Bearer <token>

Response (200):
{
  "totalUsers": 10
}
```

### Dashboard Admin
```
GET /api/admin/dashboard
Authorization: Bearer <token>
```

---

## 👥 Staff Endpoints (ADMIN hoặc STAFF)

### Danh Sách Khách Hàng
```
GET /api/staff/customers
Authorization: Bearer <token>
```

### Danh Sách Hóa Đơn
```
GET /api/staff/orders
Authorization: Bearer <token>
```

### Cập Nhật Hóa Đơn
```
PUT /api/staff/orders/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "trangThai": "Đã sử dụng"
}

Response (200):
{
  "message": "Cập nhật hóa đơn thành công!"
}
```

### Chi Tiết Khách Hàng
```
GET /api/staff/customers/{id}
Authorization: Bearer <token>
```

### Cập Nhật Khách Hàng
```
PUT /api/staff/customers/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "hoTen": "New Name",
  "email": "newemail@gmail.com",
  "soDienThoai": "0987654321"
}
```

### Thống Kê Nhân Viên
```
GET /api/staff/stats
Authorization: Bearer <token>

Response (200):
{
  "totalCustomers": 50,
  "totalOrders": 100,
  "totalRevenue": 5000000
}
```

---

## 🔒 Password Security

- **Kiểu Mã Hóa:** BCrypt (Secure password hashing)
- **Độ Dài Tối Thiểu:** 6 ký tự
- Mật khẩu không thể được trả về từ API

---

## ⏰ JWT Token Expiration

- **Thời Hạn:** 24 giờ (86,400,000 ms)
- Sau khi hết hạn, người dùng phải đăng nhập lại để lấy token mới

---

## 🛡️ Security Features

✅ **Spring Security** - Framework bảo mật  
✅ **JWT Token** - Stateless authentication  
✅ **BCrypt** - Password hashing  
✅ **CORS** - Cross-Origin Resource Sharing  
✅ **Role-Based Access Control** - RBAC  
✅ **@PreAuthorize** - Method-level security  

---

## 🚫 Error Responses

### Unauthorized (401)
```json
{
  "error": "Unauthorized"
}
```

### Forbidden (403)
```json
{
  "error": "Access Denied"
}
```

### Not Found (404)
```json
{
  "error": "Người dùng không tồn tại"
}
```

---

## 📝 Notes

- Tất cả request (trừ `/api/auth/**`) yêu cầu JWT Token trong Header
- Token phải được gửi trong format: `Authorization: Bearer <token>`
- Các trường mật khẩu không bao giờ được trả về từ API
- Role được lưu dưới dạng chuỗi CSV nếu người dùng có nhiều role (vd: "ADMIN,STAFF")

---

## 🔄 Quy Trình Login

1. **Gọi API đăng nhập** → Gửi `taiKhoan` + `matKhau`
2. **Nhận JWT Token** → Token chứa username, roles, và thông tin khác
3. **Lưu Token** → Lưu trữ trong localStorage (React) hoặc session
4. **Gửi Request** → Thêm `Authorization: Bearer <token>` vào header
5. **Server Validate** → JwtAuthFilter kiểm tra token hợp lệ
6. **Access Resource** → Nếu hợp lệ, cho phép truy cập

---

## 🧪 Testing dengan Postman

1. **Đăng nhập:** POST `/api/auth/dang-nhap`
2. **Copy token** từ response
3. **Vào Tests tab** → Set `pm.globals.set("token", pm.response.json().token)`
4. **Authorization tab** → Chọn `Bearer Token` → `{{token}}`
5. **Gọi admin endpoint** → Tự động thêm token vào header

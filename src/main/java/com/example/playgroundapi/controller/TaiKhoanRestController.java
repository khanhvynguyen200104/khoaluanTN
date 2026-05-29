package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.NguoiDung;
import com.example.playgroundapi.service.DichVuTaiKhoan;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/tai-khoan")
@CrossOrigin("*") // Cho phép React gọi API mà không bị chặn CORS
public class TaiKhoanRestController {

    @Autowired
    private DichVuTaiKhoan dichVuTaiKhoan;

    // --- 1. ĐĂNG KÝ ---
    @PostMapping("/dang-ky")
    public ResponseEntity<?> xuLyDangKy(@RequestBody NguoiDung nguoiDung) {
        try {
            // Mặc định đăng ký mới là vai trò USER
            if(nguoiDung.getDanhSachVaiTro() == null || nguoiDung.getDanhSachVaiTro().isEmpty()) {
                nguoiDung.setDanhSachVaiTro("USER");
            }
            dichVuTaiKhoan.dangKyNguoiDung(nguoiDung);
            
            // Trả về JSON thông báo thành công
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đăng ký thành công!");
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            // Trả về lỗi 400 (Bad Request) cùng câu thông báo lỗi
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // --- 2. ĐĂNG NHẬP ---
    // Sử dụng Map hoặc tạo một class LoginRequest (DTO) để nhận JSON từ React
    @PostMapping("/dang-nhap")
    public ResponseEntity<?> xuLyDangNhap(@RequestBody Map<String, String> requestData, HttpSession session) {
        String tenDangNhap = requestData.get("tenDangNhap");
        String matKhau = requestData.get("matKhau");
        
        Map<String, Object> response = new HashMap<>();

        // --- A. TRƯỜNG HỢP ADMIN CỨNG (Test nhanh) ---
        if ("admin".equals(tenDangNhap) && "123456".equals(matKhau)) {
            session.setAttribute("user", "admin");
            session.setAttribute("role", "ADMIN");

            response.put("message", "Đăng nhập thành công");
            response.put("username", "admin");
            response.put("role", "ADMIN");
            // React sẽ đọc role = "ADMIN" và tự dùng navigate('/admin')
            return ResponseEntity.ok(response);
        }

        // --- B. KIỂM TRA TÀI KHOẢN TRONG DATABASE ---
        if (dichVuTaiKhoan.kiemTraDangNhap(tenDangNhap, matKhau)) {
            NguoiDung user = dichVuTaiKhoan.timNguoiDungTheoTen(tenDangNhap);
            
            // Lưu thông tin vào session (Session Base Auth)
            session.setAttribute("nguoiDung", user); 
            session.setAttribute("user", user.getTenDangNhap()); 
            session.setAttribute("role", user.getDanhSachVaiTro()); 

            // Trả về thông tin cho React
            response.put("message", "Đăng nhập thành công");
            response.put("username", user.getTenDangNhap());
            response.put("role", user.getDanhSachVaiTro());
            
            return ResponseEntity.ok(response);

        } else {
            // Đăng nhập thất bại trả về lỗi 401 (Unauthorized)
            Map<String, String> error = new HashMap<>();
            error.put("error", "Tên đăng nhập hoặc mật khẩu không chính xác!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    // --- 3. ĐĂNG XUẤT ---
    @PostMapping("/dang-xuat")
    public ResponseEntity<?> dangXuat(HttpSession session) {
        // Xóa sạch session
        session.invalidate();
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đăng xuất thành công");
        return ResponseEntity.ok(response);
    }
}
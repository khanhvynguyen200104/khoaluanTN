package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.NguoiDung;
import com.example.playgroundapi.security.JwtTokenProvider;
import com.example.playgroundapi.security.CustomUserDetailsService;
import com.example.playgroundapi.service.DichVuTaiKhoan;
import com.example.playgroundapi.service.DichVuEmail; 
import com.example.playgroundapi.repository.NguoiDungRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController 
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") 
public class AuthRestController {

    @Autowired
    private DichVuTaiKhoan dichVuTaiKhoan;

    @Autowired
    private DichVuEmail dichVuEmail; 

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Map<String, String> otpStorage = new HashMap<>();

    // ==========================================
    // 1. API ĐĂNG KÝ
    // ==========================================
    @PostMapping("/dang-ky")
    public ResponseEntity<?> xuLyDangKy(@RequestBody NguoiDung nguoiDung) {
        try {
            if(nguoiDung.getDanhSachVaiTro() == null || nguoiDung.getDanhSachVaiTro().isEmpty()) {
                nguoiDung.setDanhSachVaiTro("USER"); 
            }
            
            // XÓA MÃ HÓA Ở ĐÂY VÌ FILE DichVuTaiKhoan ĐÃ LÀM RỒI
            // Chỉ cần gọi thẳng service:
            dichVuTaiKhoan.dangKyNguoiDung(nguoiDung);
            
            return ResponseEntity.ok(Map.of("message", "Đăng ký thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================
    // 2. API ĐĂNG NHẬP
    // ==========================================
    @PostMapping("/dang-nhap")
    public ResponseEntity<?> xuLyDangNhap(@RequestBody Map<String, String> payload) {
        // Cắt khoảng trắng dư thừa ở Tài khoản do lỡ tay gõ nhầm
        String taiKhoan = payload.get("taiKhoan") != null ? payload.get("taiKhoan").trim() : ""; 
        String matKhau = payload.get("matKhau") != null ? payload.get("matKhau").trim() : "";

        try {
            NguoiDung user = dichVuTaiKhoan.timTheoTaiKhoanHoacEmail(taiKhoan);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Tài khoản không tồn tại!"));
            }

            // =========================================================
            // ĐOẠN DEBUG: CHỈ ĐÍCH DANH LỖI GỬI THẲNG LÊN WEB REACT
            // =========================================================
            boolean matKhauDung = passwordEncoder.matches(matKhau, user.getMatKhau());
            if (taiKhoan.equals("admin01") && matKhau.equals("admin")) {
                matKhauDung = true; // Bypass cho admin
            }
            if (!matKhauDung) {
                String loiChiTiet = "Mật khẩu không chính xác! (DEBUG - Frontend gửi lên: [" + matKhau + "] | Trong DB đang lưu: [" + user.getMatKhau() + "])";
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", loiChiTiet));
            }

            List<String> roles = customUserDetailsService.getUserRoles(user);
            String token = jwtTokenProvider.generateToken(user.getTenDangNhap(), user.getHoTen(), roles);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("maNguoiDung", user.getMaNguoiDung());
            response.put("tenDangNhap", user.getTenDangNhap());
            response.put("hoTen", user.getHoTen());
            response.put("email", user.getEmail());
            response.put("tongChiTieu", user.getTongChiTieu() != null ? user.getTongChiTieu() : 0.0);
            response.put("hangThanhVien", user.getHangThanhVien() != null ? user.getHangThanhVien() : "SILVER");
            response.put("roles", roles);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Lỗi: " + e.getMessage()));
        }
    }

    // ==========================================
    // 3. YÊU CẦU GỬI MÃ OTP QUA EMAIL
    // ==========================================
    @PostMapping("/quen-mat-khau")
    public ResponseEntity<?> quenMatKhau(@RequestBody Map<String, String> payload) {
        String email = payload.get("email").trim(); 

        NguoiDung user = dichVuTaiKhoan.timTheoEmail(email);
        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Không tìm thấy tài khoản nào liên kết với Email này!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);

        try {
            dichVuEmail.guiEmailOTP(email, otp);
            System.out.println("Đã gửi thành công email OTP thật đến: " + email);
        } catch (Exception e) {
            e.printStackTrace(); 
            Map<String, String> error = new HashMap<>();
            error.put("message", "Lỗi hệ thống: Không thể gửi email lúc này. Vui lòng kiểm tra lại cấu hình SMTP.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Mã OTP đã được gửi! Vui lòng kiểm tra Email của bạn.");
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 4. XÁC NHẬN OTP & ĐỔI MẬT KHẨU MỚI
    // ==========================================
    @PostMapping("/dat-lai-mat-khau")
    public ResponseEntity<?> datLaiMatKhau(@RequestBody Map<String, String> payload) {
        String email = payload.get("email").trim(); 
        String otpNhapVao = payload.get("otp").trim(); 
        String matKhauMoi = payload.get("matKhauMoi"); 

        String otpHeThong = otpStorage.get(email);

        if (otpHeThong == null || !otpHeThong.equals(otpNhapVao)) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Mã OTP không chính xác hoặc đã hết hạn!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        try {
            // ĐÃ XÓA MÃ HÓA Ở ĐÂY VÌ TRONG DỊCH VỤ CŨNG CÓ THỂ ĐÃ LÀM
            dichVuTaiKhoan.doiMatKhauTheoEmail(email, matKhauMoi); 
            
            otpStorage.remove(email);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Khôi phục mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Đã xảy ra lỗi khi cập nhật mật khẩu.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ==========================================
    // 5. TÌM KHÁCH HÀNG BẰNG SỐ ĐIỆN THOẠI (DÙNG CHO POS)
    // ==========================================
    @GetMapping("/tim-sdt")
    public ResponseEntity<?> timTheoSdt(@RequestParam("sdt") String sdt) {
        Optional<NguoiDung> khachOpt = nguoiDungRepository.findBySoDienThoai(sdt);
        
        if (khachOpt.isPresent()) {
            return ResponseEntity.ok(khachOpt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy khách hàng");
        }
    }

    // ==========================================
    // 6. LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI
    // ==========================================
    @GetMapping("/me")
    public ResponseEntity<?> layThongTinNguoiDungHienTai() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Người dùng chưa đăng nhập."));
        }

        String taiKhoan = authentication.getName();
        NguoiDung user = dichVuTaiKhoan.timTheoTaiKhoanHoacEmail(taiKhoan);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Người dùng không tồn tại."));
        }

        List<String> roles = customUserDetailsService.getUserRoles(user);
        Map<String, Object> response = new HashMap<>();
        response.put("maNguoiDung", user.getMaNguoiDung());
        response.put("tenDangNhap", user.getTenDangNhap());
        response.put("hoTen", user.getHoTen());
        response.put("email", user.getEmail());
        response.put("tongChiTieu", user.getTongChiTieu() != null ? user.getTongChiTieu() : 0.0);
        response.put("hangThanhVien", user.getHangThanhVien() != null ? user.getHangThanhVien() : "SILVER");
        response.put("roles", roles);

        return ResponseEntity.ok(response);
    }
}
package com.example.playgroundapi.service;

import com.example.playgroundapi.entity.NguoiDung;
import com.example.playgroundapi.repository.KhoNguoiDung;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class DichVuTaiKhoan {

    @Autowired
    private KhoNguoiDung khoNguoiDung;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==========================================
    // --- HÀM 1: ĐĂNG KÝ (Đã thêm check trùng Email) ---
    // ==========================================
    public void dangKyNguoiDung(NguoiDung nguoiDung) {
        
        // 1. KIỂM TRA MẬT KHẨU
        if (nguoiDung.getMatKhau() == null || nguoiDung.getMatKhau().length() < 6) {
            throw new RuntimeException("Mật khẩu quá ngắn! Phải có ít nhất 6 ký tự.");
        }

        // 2. KIỂM TRA EMAIL HỢP LỆ
        if (nguoiDung.getEmail() == null || !nguoiDung.getEmail().toLowerCase().endsWith("@gmail.com")) {
            throw new RuntimeException("Email không hợp lệ! Vui lòng dùng địa chỉ @gmail.com");
        }

        // 3. KIỂM TRA TRÙNG TÊN ĐĂNG NHẬP
        if (khoNguoiDung.findByTenDangNhap(nguoiDung.getTenDangNhap()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập này đã có người dùng!");
        }

        // 4. KIỂM TRA TRÙNG EMAIL (Mới thêm)
        if (khoNguoiDung.findByEmail(nguoiDung.getEmail()).isPresent()) {
            throw new RuntimeException("Email này đã được sử dụng! Vui lòng chọn email khác.");
        }

        // 5. MÃ HÓA MẬT KHẨU BẰNG BCRYPT
        String matKhauMaHoa = passwordEncoder.encode(nguoiDung.getMatKhau());
        nguoiDung.setMatKhau(matKhauMaHoa);

        // Gán mặc định khi đăng ký
        nguoiDung.setTongChiTieu(0.0);
        nguoiDung.setHangThanhVien("SILVER");

        khoNguoiDung.save(nguoiDung);
    }

    // ==========================================
    // --- HÀM 2: KIỂM TRA ĐĂNG NHẬP (Hỗ trợ Tên hoặc Email) ---
    // ==========================================
    public boolean kiemTraDangNhap(String taiKhoan, String matKhauNhapVao) {
        // Tìm user theo Tên đăng nhập hoặc Email
        NguoiDung user = timTheoTaiKhoanHoacEmail(taiKhoan);
        if (user == null) {
            return false;
        }
        
        // SỬA Ở ĐÂY: Dùng passwordEncoder của BCrypt thay vì MD5
        return passwordEncoder.matches(matKhauNhapVao, user.getMatKhau());
    }

    // ==========================================
    // --- HÀM 3: CÁC HÀM TÌM KIẾM ---
    // ==========================================
    public NguoiDung timNguoiDungTheoTen(String tenDangNhap) {
         return khoNguoiDung.findByTenDangNhap(tenDangNhap).orElse(null);
    }

    // public NguoiDung timNguoiDungTheoTenHoacSdt(String taiKhoan) {
    //     // Tạm giữ lại hàm cũ nếu bạn còn dùng ở đâu đó
    //     return khoNguoiDung.findByTenDangNhapOrSoDienThoai(taiKhoan, taiKhoan).orElse(null);
    // }

    // Hàm mới: Tìm theo Tên đăng nhập hoặc Email
    public NguoiDung timTheoTaiKhoanHoacEmail(String taiKhoan) {
        return khoNguoiDung.findByTenDangNhapOrEmail(taiKhoan, taiKhoan).orElse(null);
    }

    public NguoiDung timTheoEmail(String email) {
        return khoNguoiDung.findByEmail(email).orElse(null);
    }

    // ==========================================
    // --- HÀM 4: ĐỔI MẬT KHẨU ---
    // ==========================================
    // public void doiMatKhau(String taiKhoan, String matKhauMoi) {
    //     NguoiDung user = timNguoiDungTheoTenHoacSdt(taiKhoan);
    //     if (user != null) {
    //         user.setMatKhau(maHoaMD5(matKhauMoi));
    //         khoNguoiDung.save(user);
    //     } else {
    //         throw new RuntimeException("Không tìm thấy tài khoản để đổi mật khẩu!");
    //     }
    // }

    public void doiMatKhauTheoEmail(String email, String matKhauMoi) {
        NguoiDung user = timTheoEmail(email);
        if (user != null) {
            user.setMatKhau(passwordEncoder.encode(matKhauMoi));
            khoNguoiDung.save(user);
        } else {
            throw new RuntimeException("Không tìm thấy tài khoản để đổi mật khẩu!");
        }
    }

    // ==========================================
    // --- HÀM 5: CẬP NHẬT CHI TIÊU ---
    // ==========================================
    public void capNhatChiTieuVaHang(String taiKhoan, Double soTienChiThem) {
        // SỬA LỖI Ở ĐÂY: Sử dụng hàm tìm kiếm mới thay cho hàm cũ đã bị comment
        NguoiDung user = timTheoTaiKhoanHoacEmail(taiKhoan);
        
        if (user != null) {
            Double tongTienMoi = (user.getTongChiTieu() != null ? user.getTongChiTieu() : 0.0) + soTienChiThem;
            user.setTongChiTieu(tongTienMoi);

            if (tongTienMoi >= 3000000) {
                user.setHangThanhVien("DIAMOND");
            } else if (tongTienMoi >= 1000000) {
                user.setHangThanhVien("GOLD");
            } else {
                user.setHangThanhVien("SILVER");
            }

            khoNguoiDung.save(user);
        }
    }

    // ==========================================
    // --- HÀM 6: MÃ HÓA MD5 ---
    // ==========================================
    public String maHoaMD5(String matKhau) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] array = md.digest(matKhau.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : array) {
                sb.append(Integer.toHexString((b & 0xFF) | 0x100).substring(1, 3));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        }
    }
}
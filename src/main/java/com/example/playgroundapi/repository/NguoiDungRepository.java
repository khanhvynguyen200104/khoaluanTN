package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long> {
    // Phải trả về Optional để dùng được hàm .orElse(null) hoặc .isPresent()
    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);
    Optional<NguoiDung> findByEmail(String email);
    
    // 👇 THÊM DÒNG NÀY ĐỂ TÌM KHÁCH HÀNG BẰNG SĐT BÊN TRANG BÁN VÉ
    Optional<NguoiDung> findBySoDienThoai(String soDienThoai);

    // Tìm theo tên đăng nhập hoặc email
    Optional<NguoiDung> findByTenDangNhapOrEmail(String tenDangNhap, String email);
}
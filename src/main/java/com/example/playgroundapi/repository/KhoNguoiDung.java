package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface KhoNguoiDung extends JpaRepository<NguoiDung, Long> {
    // Tìm theo tên đăng nhập
    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);
    
    // Tìm theo email
    Optional<NguoiDung> findByEmail(String email);
    
    // Tìm theo tên đăng nhập HOẶC email (Dùng cho đăng nhập)
    Optional<NguoiDung> findByTenDangNhapOrEmail(String tenDangNhap, String email);
}
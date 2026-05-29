package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.DonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonHangRepository extends JpaRepository<DonHang, Long> {
    // Lấy lịch sử mua hàng của user, mới nhất lên đầu
    List<DonHang> findByTenTaiKhoanOrderByIdDesc(String tenTaiKhoan);
}
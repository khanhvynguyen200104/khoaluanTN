package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.ChiTietHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChiTietHoaDonRepository extends JpaRepository<ChiTietHoaDon, Long> {
    // Tìm các món ăn thuộc hóa đơn nào đó
    List<ChiTietHoaDon> findByHoaDonId(Long hoaDonId);
}
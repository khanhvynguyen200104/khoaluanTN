package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    // Tìm hóa đơn của user
    List<HoaDon> findByNguoiMuaOrderByIdDesc(String nguoiMua);
    List<HoaDon> findByNguoiMuaAndLoaiGiaoDich(String nguoiMua, String loai);

	HoaDon findByMaVe(String maVe);
}
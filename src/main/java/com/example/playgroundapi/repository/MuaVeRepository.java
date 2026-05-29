package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.MuaVe;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MuaVeRepository extends JpaRepository<MuaVe, Long> {
    // Thêm dòng này nếu chưa có
    List<MuaVe> findByTenTaiKhoanOrderByIdDesc(String tenTaiKhoan);

    List<MuaVe> findByTenTaiKhoan(String tenTaiKhoan);

    MuaVe findByMaVe(String maVe);
}
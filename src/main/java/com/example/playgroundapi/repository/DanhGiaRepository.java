package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DanhGiaRepository extends JpaRepository<DanhGia, Long> {
    List<DanhGia> findAllByOrderByNgayDanhGiaDesc();
}
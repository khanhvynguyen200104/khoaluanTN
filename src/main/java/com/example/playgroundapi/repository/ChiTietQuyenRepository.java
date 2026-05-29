package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.ChiTietQuyen;
import com.example.playgroundapi.entity.VaiTro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietQuyenRepository extends JpaRepository<ChiTietQuyen, Long> {
    List<ChiTietQuyen> findByVaiTro(VaiTro vaiTro);
}

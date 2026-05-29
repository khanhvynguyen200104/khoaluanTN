package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.QuyenHan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuyenHanRepository extends JpaRepository<QuyenHan, Long> {
    Optional<QuyenHan> findByTenQuyen(String tenQuyen);
}

package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.MonAn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MonAnRepository extends JpaRepository<MonAn, Long> {
    // Không cần viết thêm hàm deleteById, Spring Boot đã tự có sẵn rồi!
}
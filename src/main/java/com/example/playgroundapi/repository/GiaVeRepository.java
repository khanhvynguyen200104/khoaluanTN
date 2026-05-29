package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.GiaVe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GiaVeRepository extends JpaRepository<GiaVe, Long> {
    GiaVe findFirstByOrderByIdAsc();
}
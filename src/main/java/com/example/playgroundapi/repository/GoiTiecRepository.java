package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.GoiTiec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoiTiecRepository extends JpaRepository<GoiTiec, Long> {
}
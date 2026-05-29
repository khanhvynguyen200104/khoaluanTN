package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.DatTiec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DatTiecRepository extends JpaRepository<DatTiec, Long> {
    // Tìm danh sách tiệc của user, sắp xếp mới nhất lên đầu
    List<DatTiec> findByTenTaiKhoanOrderByIdDesc(String tenTaiKhoan);
}
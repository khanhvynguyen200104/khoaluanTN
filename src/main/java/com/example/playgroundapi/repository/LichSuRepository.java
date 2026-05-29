package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.LichSu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LichSuRepository extends JpaRepository<LichSu, Integer> {
    
    // Phương thức này tự động tạo câu lệnh: 
    // SELECT * FROM lich_su_mua_hang ORDER BY ngay_mua DESC
    List<LichSu> findAllByOrderByNgayMuaDesc(); 
}
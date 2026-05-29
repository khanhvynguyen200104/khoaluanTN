package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.Ve;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VeRepository extends JpaRepository<Ve, Long> {
    // Hàm tìm vé theo tên người dùng (để ai chỉ xem được vé của người đó)
    // Sắp xếp vé mới nhất lên đầu (Order By Id Desc)
    List<Ve> findByTenTaiKhoanOrderByIdDesc(String tenTaiKhoan);
}
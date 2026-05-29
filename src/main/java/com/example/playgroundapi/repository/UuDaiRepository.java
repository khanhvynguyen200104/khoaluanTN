package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.UuDai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; // Nhớ import List nhé

@Repository
public interface UuDaiRepository extends JpaRepository<UuDai, Integer> {
    
    // Tự động tìm kiếm Voucher theo mã code
    UuDai findByMaCode(String maCode);

    // ✅ THÊM DÒNG NÀY: Lấy danh sách mã có trạng thái khác với chữ truyền vào
    List<UuDai> findByTrangThaiNot(String trangThai);
}
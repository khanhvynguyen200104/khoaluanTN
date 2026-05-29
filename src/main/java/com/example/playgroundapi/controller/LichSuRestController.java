package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.ChiTietHoaDon;
import com.example.playgroundapi.entity.HoaDon;
import com.example.playgroundapi.repository.ChiTietHoaDonRepository;
import com.example.playgroundapi.repository.HoaDonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lich-su")
@CrossOrigin(origins = "*")
public class LichSuRestController {

    @Autowired
    private HoaDonRepository hoaDonRepo;

    @Autowired
    private ChiTietHoaDonRepository chiTietHoaDonRepo; // Khai báo thêm Repo này

    // 1. API Lấy toàn bộ lịch sử giao dịch của 1 user (Code cũ của bạn)
    @PostMapping("")
    public ResponseEntity<?> xemLichSu(@RequestBody Map<String, String> payload) {
        String user = payload.get("user");
        if (user == null || user.isEmpty()) {
            return ResponseEntity.badRequest().body("Thiếu thông tin người dùng!");
        }
        List<HoaDon> listTatCa = hoaDonRepo.findByNguoiMuaOrderByIdDesc(user);
        return ResponseEntity.ok(listTatCa);
    }

    // 2. API MỚI: Xem chi tiết các món đồ đã mua trong 1 hóa đơn
    @GetMapping("/chi-tiet/{hoaDonId}")
    public ResponseEntity<?> xemChiTietHoaDon(@PathVariable Long hoaDonId) {
        // Tìm tất cả chi tiết thuộc về hóa đơn này
        List<ChiTietHoaDon> danhSachChiTiet = chiTietHoaDonRepo.findByHoaDonId(hoaDonId);
        return ResponseEntity.ok(danhSachChiTiet);
    }
}
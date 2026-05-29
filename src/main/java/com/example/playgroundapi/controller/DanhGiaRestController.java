package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.DanhGia;
import com.example.playgroundapi.entity.NguoiDung;
import com.example.playgroundapi.repository.DanhGiaRepository;
import com.example.playgroundapi.repository.NguoiDungRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/danh-gia")
@CrossOrigin("*")
public class DanhGiaRestController {

    @Autowired
    private DanhGiaRepository danhGiaRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    // GET danh sách
    @GetMapping
    public List<DanhGia> layDanhSachDanhGia() {
        return danhGiaRepository.findAllByOrderByNgayDanhGiaDesc();
    }

    // POST thêm đánh giá (PHIÊN BẢN ĐÃ FIX LỖI)
    @PostMapping
    public ResponseEntity<?> themDanhGia(@RequestBody Map<String, Object> payload) {
        
        // In ra console để bạn dễ dàng kiểm tra React đang gửi gì xuống
        System.out.println("=== DỮ LIỆU TỪ REACT GỬI XUỐNG ===");
        System.out.println(payload);

        try {
            DanhGia danhGiaMoi = new DanhGia();
            
            // 1. Lấy số sao
            if (payload.get("soSao") != null) {
                danhGiaMoi.setSoSao(Integer.parseInt(payload.get("soSao").toString()));
            }
            
            // 2. Lấy nội dung
            if (payload.get("noiDung") != null) {
                danhGiaMoi.setNoiDung(payload.get("noiDung").toString());
            }

            // 3. Lấy mã người dùng (Linh hoạt: React gửi 'maNguoiDung' hay 'id' đều nhận được)
            Long userId = null;
            if (payload.get("maNguoiDung") != null) {
                userId = Long.parseLong(payload.get("maNguoiDung").toString());
            } else if (payload.get("id") != null) {
                userId = Long.parseLong(payload.get("id").toString());
            }

            // Nếu không có ID người dùng
            if (userId == null) {
                return ResponseEntity.badRequest().body("Lỗi: Không tìm thấy ID người dùng từ React gửi xuống!");
            }

            // 4. Kiểm tra User có tồn tại trong SQL Server không
            NguoiDung userInDb = nguoiDungRepository.findById(userId).orElse(null);
            if (userInDb == null) {
                return ResponseEntity.badRequest().body("Lỗi: User ID = " + userId + " không tồn tại trong database. Bạn hãy tạo mới/đăng nhập lại tài khoản trên web nhé!");
            }

            // 5. Lưu vào Database
            danhGiaMoi.setNguoiDung(userInDb);
            danhGiaMoi.setNgayDanhGia(LocalDateTime.now());
            
            danhGiaRepository.save(danhGiaMoi);
            System.out.println("=> LƯU ĐÁNH GIÁ THÀNH CÔNG VÀO SQL!");

            return ResponseEntity.ok(danhGiaMoi);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi code Backend: " + e.getMessage());
        }
    }

    // DELETE xóa đánh giá
    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaDanhGia(@PathVariable Long id) {
        try {
            if (!danhGiaRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            danhGiaRepository.deleteById(id);
            return ResponseEntity.ok(Map.of(
                "message", "Xóa đánh giá thành công!",
                "id", id
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi khi xóa đánh giá: " + e.getMessage());
        }
    }
}
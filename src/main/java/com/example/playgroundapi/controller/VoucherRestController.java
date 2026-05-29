package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.UuDai;
import com.example.playgroundapi.entity.UuDaiNguoiDung;
import com.example.playgroundapi.repository.UuDaiRepository;
import com.example.playgroundapi.repository.UuDaiNguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/voucher")
@CrossOrigin(origins = "*")
public class VoucherRestController {

    @Autowired
    private UuDaiRepository uuDaiRepo; 

    @Autowired
    private UuDaiNguoiDungRepository uuDaiNguoiDungRepo;

    // API 1: Lấy danh sách Ưu đãi
    @GetMapping("/danh-sach")
    public ResponseEntity<List<UuDai>> layDanhSachVoucher() {
        List<UuDai> danhSachUuDai = uuDaiRepo.findByTrangThaiNot("DA_SU_DUNG");
        return ResponseEntity.ok(danhSachUuDai);
    }

    // API 2: Lưu mã 
    @PostMapping("/luu-ma/{id}")
    public ResponseEntity<Map<String, String>> luuVoucherVaoVi(@PathVariable int id, @RequestParam String tenTaiKhoan) {
        Map<String, String> response = new HashMap<>();

        UuDai uuDai = uuDaiRepo.findById(id).orElse(null);
        if (uuDai == null) {
            response.put("loi", "Không tìm thấy voucher!");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<UuDaiNguoiDung> daLuu = uuDaiNguoiDungRepo.findByTenTaiKhoanAndUuDai(tenTaiKhoan, uuDai);
        if (daLuu.isPresent()) {
            response.put("loi", "Tài khoản này đã dùng voucher này rồi!");
            return ResponseEntity.badRequest().body(response);
        }

        UuDaiNguoiDung mapping = new UuDaiNguoiDung();
        mapping.setUuDai(uuDai);
        mapping.setTenTaiKhoan(tenTaiKhoan);
        mapping.setDaSuDung(false);
        mapping.setNgayLuu(LocalDate.now());
        uuDaiNguoiDungRepo.save(mapping);

        response.put("thongBao", "Đã lưu mã giảm giá thành công vào ví của bạn!");
        return ResponseEntity.ok(response);
    }

    // API 3: Kiểm tra mã hợp lệ (Có check thêm trạng thái)
    @PostMapping("/kiem-tra")
    public ResponseEntity<?> kiemTraMaGiamGia(@RequestBody Map<String, String> payload) {
        String maCode = payload.get("maCode");
        
        UuDai uuDai = uuDaiRepo.findByMaCode(maCode);
        
        if (uuDai == null) {
            Map<String, String> loi = new HashMap<>();
            loi.put("loi", "Mã giảm giá không tồn tại!");
            return ResponseEntity.badRequest().body(loi);
        }
        
        // KIỂM TRA: Xem mã đã bị sử dụng chưa
        if ("DA_SU_DUNG".equals(uuDai.getTrangThai())) {
            Map<String, String> loi = new HashMap<>();
            loi.put("loi", "Mã giảm giá này đã được sử dụng!");
            return ResponseEntity.badRequest().body(loi);
        }
        
        if (uuDai.getNgayKetThuc() != null && uuDai.getNgayKetThuc().isBefore(LocalDate.now())) {
            Map<String, String> loi = new HashMap<>();
            loi.put("loi", "Mã giảm giá đã hết hạn!");
            return ResponseEntity.badRequest().body(loi);
        }
        
        return ResponseEntity.ok(uuDai);
    }

    // API 4: THÊM MỚI - Đánh dấu mã đã sử dụng (Gọi API này sau khi thanh toán mua vé thành công)
    @PostMapping("/su-dung")
    public ResponseEntity<?> xacNhanSuDungMa(@RequestBody Map<String, String> payload) {
        String maCode = payload.get("maCode");
        String tenTaiKhoan = payload.get("tenTaiKhoan");
        UuDai uuDai = uuDaiRepo.findByMaCode(maCode);

        if (uuDai != null) {
            if (tenTaiKhoan != null && !tenTaiKhoan.isBlank()) {
                Optional<UuDaiNguoiDung> mappingOpt = uuDaiNguoiDungRepo.findByTenTaiKhoanAndUuDai(tenTaiKhoan, uuDai);
                if (mappingOpt.isPresent()) {
                    UuDaiNguoiDung mapping = mappingOpt.get();
                    if (Boolean.TRUE.equals(mapping.getDaSuDung())) {
                        Map<String, String> loi = new HashMap<>();
                        loi.put("loi", "Tài khoản này đã sử dụng voucher này rồi!");
                        return ResponseEntity.badRequest().body(loi);
                    }
                    mapping.setDaSuDung(true);
                    uuDaiNguoiDungRepo.save(mapping);

                    Map<String, String> thongBao = new HashMap<>();
                    thongBao.put("thongBao", "Đã xác nhận sử dụng voucher cho tài khoản này!");
                    return ResponseEntity.ok(thongBao);
                }
            }

            if (!"DA_SU_DUNG".equals(uuDai.getTrangThai())) {
                uuDai.setTrangThai("DA_SU_DUNG"); // Đổi trạng thái
                uuDaiRepo.save(uuDai); // Cập nhật xuống Database
            }
            
            Map<String, String> thongBao = new HashMap<>();
            thongBao.put("thongBao", "Đã khóa mã voucher thành công!");
            return ResponseEntity.ok(thongBao);
        }

        Map<String, String> loi = new HashMap<>();
        loi.put("loi", "Không thể cập nhật trạng thái mã này!");
        return ResponseEntity.badRequest().body(loi);
    }
}
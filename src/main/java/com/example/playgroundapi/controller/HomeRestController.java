package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.*;
import com.example.playgroundapi.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*") // Cho phép ReactJS gọi API không bị lỗi CORS
@RestController
@RequestMapping("/api")
public class HomeRestController {

    @Autowired private UuDaiRepository uuDaiRepo;
    @Autowired private HoaDonRepository hoaDonRepo; 

    // --- 1. API LẤY DỮ LIỆU TRANG CHỦ ---
    @GetMapping("/trang-chu") 
    public ResponseEntity<?> getTrangChuData() {
        List<UuDai> allUuDai = uuDaiRepo.findAll();
        List<UuDai> activeUuDai = new ArrayList<>();

        LocalDate today = LocalDate.now();
        for (UuDai ud : allUuDai) {
            if (ud.getNgayKetThuc() != null && !ud.getNgayKetThuc().isBefore(today)) { 
                activeUuDai.add(ud);
            }
        }
        
        // Trả về JSON chứa danh sách ưu đãi
        return ResponseEntity.ok(activeUuDai); 
    }

    // --- 2. API XỬ LÝ ĐẶT VÉ ---
    @PostMapping("/dat-ve")
    public ResponseEntity<?> xuLyDatVe(@RequestBody Map<String, Object> payload) {
        String tenKhach = payload.get("tenKhach").toString();
        String loaiVe = payload.get("loaiVe").toString();
        int soLuong = Integer.parseInt(payload.get("soLuong").toString());
        String maCode = payload.getOrDefault("maGiamGia", "").toString();
        
        double giaDonVi = loaiVe.equals("TRE_EM") ? 100000 : 150000;
        double tongTienGoc = giaDonVi * soLuong;
        double tienGiam = 0;
        String thongBao = "";
        String maCodeChuan = maCode.trim().toUpperCase();

        if (!maCodeChuan.isEmpty()) {
            UuDai voucher = uuDaiRepo.findByMaCode(maCodeChuan); 
            if (voucher != null) {
                if (voucher.getNgayKetThuc() != null && voucher.getNgayKetThuc().isBefore(LocalDate.now())) {
                    thongBao = "Tiếc quá, mã này đã hết hạn!";
                } else {
                    tienGiam = tongTienGoc * voucher.getPhanTramGiam() / 100.0;
                    thongBao = "Đã áp dụng mã " + maCodeChuan + " (Giảm " + voucher.getPhanTramGiam() + "%)";
                }
            } else {
                thongBao = "Mã giảm giá không tồn tại!";
            }
        }

        double tongThanhToan = tongTienGoc - tienGiam;

        HoaDon hd = new HoaDon();
        hd.setNguoiMua(tenKhach);
        hd.setTongTien(tongThanhToan);
        //hd.setNgaySuDung(java.sql.Date.valueOf(LocalDate.now())); 
        hd.setTrangThai("Chờ thanh toán");
        hd.setLoaiGiaoDich("MUA_VE");
        hoaDonRepo.save(hd);

        // Trả về kết quả JSON cho React
        Map<String, Object> response = new HashMap<>();
        response.put("tenKhach", tenKhach);
        response.put("tongTienGoc", tongTienGoc);
        response.put("tienGiam", tienGiam);
        response.put("tongThanhToan", tongThanhToan);
        response.put("thongBao", thongBao);
        
        return ResponseEntity.ok(response); 
    }

    // --- 3. API LẤY DANH SÁCH VOUCHER ---
    @GetMapping("/voucher")
    public ResponseEntity<?> getVouchers() {
        List<UuDai> list = uuDaiRepo.findAll();
        return ResponseEntity.ok(list); 
    }
}
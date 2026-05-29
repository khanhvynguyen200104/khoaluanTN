package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.MuaVe;
import com.example.playgroundapi.entity.HoaDon;
import com.example.playgroundapi.repository.MuaVeRepository;
import com.example.playgroundapi.repository.HoaDonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trang-su-dung")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true") 
public class SuDungRestController {

    @Autowired 
    private MuaVeRepository muaVeRepository;
    
    @Autowired 
    private HoaDonRepository hoaDonRepository;

    @PostMapping("/danh-sach")
    public ResponseEntity<?> getDanhSach(@RequestBody Map<String, String> payload) {
        String username = payload.get("user");
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: Không có thông tin user"));
        }
        username = username.trim(); // Cắt dấu cách thừa

        List<Map<String, Object>> result = new ArrayList<>();

        // =========================
        // 1. LẤY VÉ VÀO CỔNG
        // =========================
        List<MuaVe> allVe = muaVeRepository.findAll();
        for(MuaVe ve : allVe) {
            String dbNguoiMua = ve.getTenTaiKhoan() != null ? ve.getTenTaiKhoan().trim() : "";
            if (username.equalsIgnoreCase(dbNguoiMua)) { 
                String tt = ve.getTrangThai() != null ? ve.getTrangThai().trim() : "";
                if (tt.equalsIgnoreCase("Thành công") || tt.equalsIgnoreCase("Đã sử dụng")) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", ve.getId());
                    item.put("displayId", ve.getMaVe() != null ? ve.getMaVe() : ("VE-" + ve.getId()));
                    item.put("type", "VE");
                    item.put("loaiVe", ve.getLoaiVe());
                    item.put("ngaySuDung", ve.getNgaySuDung());
                    item.put("soLuong", ve.getSoLuong());
                    item.put("trangThai", tt);
                    item.put("soDienThoaiKhach", ve.getSoDienThoaiKhach());
                    result.add(item);
                }
            }
        }

        // =========================
        // 2. LẤY HÓA ĐƠN ĐỒ ĂN (CÓ LOG ĐỂ BẮT LỖI)
        // =========================
        System.out.println("--- ĐANG TÌM HÓA ĐƠN ĐỒ ĂN CHO USER: [" + username + "] ---");
        List<HoaDon> allHd = hoaDonRepository.findAll();
        
        for(HoaDon hd : allHd) {
            String dbNguoiMua = hd.getNguoiMua() != null ? hd.getNguoiMua().trim() : "NULL";
            String dbLoai = hd.getLoaiGiaoDich() != null ? hd.getLoaiGiaoDich().trim() : "NULL";
            String dbTrangThai = hd.getTrangThai() != null ? hd.getTrangThai().trim() : "NULL";
            
            // Dòng này in ra tất cả hóa đơn trong DB để xem bị lệch ở đâu
            System.out.println("Kiểm tra HD ID: " + hd.getId() + " | Người mua: [" + dbNguoiMua + "] | Loại: [" + dbLoai + "] | Trạng thái: [" + dbTrangThai + "]");
            
            // So sánh không phân biệt hoa thường và bỏ qua dấu cách
            if (username.equalsIgnoreCase(dbNguoiMua) && "AN_UONG".equalsIgnoreCase(dbLoai)) {
                if (dbTrangThai.equalsIgnoreCase("Thành công") || dbTrangThai.equalsIgnoreCase("Đã nhận món")) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", hd.getId());
                    item.put("displayId", "FOOD-" + hd.getId());
                    item.put("type", "FOOD");
                    item.put("loaiVe", "🍔 Hóa đơn Khu Ẩm Thực");
                    
                    // Xử lý an toàn cho định dạng ngày
                    String ngay = "";
                    try {
                        if (hd.getNgayMua() != null) {
                            ngay = hd.getNgayMua().toString().split("T")[0];
                        }
                    } catch(Exception e) { ngay = "Hôm nay"; }
                    
                    item.put("ngaySuDung", ngay);
                    item.put("soLuong", 1);
                    item.put("trangThai", dbTrangThai.equalsIgnoreCase("Đã nhận món") ? "Đã sử dụng" : "Thành công");
                    
                    result.add(item);
                    System.out.println("=> ĐÃ TÌM THẤY VÀ THÊM VÀO DANH SÁCH!");
                } else {
                    System.out.println("=> Bỏ qua vì trạng thái không hợp lệ!");
                }
            }
        }

        // Sắp xếp mới nhất lên đầu
        result.sort((a, b) -> ((Long) b.get("id")).compareTo((Long) a.get("id")));

        return ResponseEntity.ok(result);
    }

    @PostMapping("/xac-nhan")
    public ResponseEntity<?> xacNhanSuDung(@RequestBody Map<String, String> payload) {
        String type = payload.get("type"); 
        Long id = Long.parseLong(payload.get("id"));

        if ("VE".equals(type)) {
            MuaVe ve = muaVeRepository.findById(id).orElse(null);
            if (ve != null && "Thành công".equalsIgnoreCase(ve.getTrangThai())) {
                ve.setTrangThai("Đã sử dụng");
                muaVeRepository.save(ve);
                return ResponseEntity.ok(Map.of("message", "Quét vé vào cổng thành công!"));
            }
        } else if ("FOOD".equals(type)) {
            HoaDon hd = hoaDonRepository.findById(id).orElse(null);
            if (hd != null && "Thành công".equalsIgnoreCase(hd.getTrangThai())) {
                hd.setTrangThai("Đã nhận món"); 
                hoaDonRepository.save(hd);
                return ResponseEntity.ok(Map.of("message", "Đã giao đồ ăn cho khách!"));
            }
        }
        
        return ResponseEntity.badRequest().body(Map.of("message", "Mã không hợp lệ hoặc đã được sử dụng!"));
    }
}
package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.ChiTietHoaDon;
import com.example.playgroundapi.entity.HoaDon;
import com.example.playgroundapi.entity.MonAn;
import com.example.playgroundapi.entity.GioHangItem; 
import com.example.playgroundapi.repository.ChiTietHoaDonRepository;
import com.example.playgroundapi.repository.HoaDonRepository;
import com.example.playgroundapi.repository.MonAnRepository;
import com.example.playgroundapi.service.QRCodeService;
import com.example.playgroundapi.service.DichVuTaiKhoan; // <-- ĐÃ THÊM IMPORT NÀY

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/an-uong")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true") 
public class AnUongRestController {

    @Autowired private MonAnRepository monAnRepository;
    @Autowired private HoaDonRepository hoaDonRepository;
    @Autowired private ChiTietHoaDonRepository chiTietHoaDonRepository;
    @Autowired private QRCodeService qrCodeService; 
    
    @Autowired private DichVuTaiKhoan dichVuTaiKhoan; // <-- ĐÃ THÊM DỊCH VỤ NÀY

    @GetMapping("/danh-sach")
    public ResponseEntity<?> getMenu() {
        return ResponseEntity.ok(monAnRepository.findAll());
    }

    // ==========================================
    // GIỎ HÀNG ĐỒ ĂN & MÃ QR
    // ==========================================

    @PostMapping("/gio-hang/them")
    public ResponseEntity<?> themVaoGioHang(@RequestBody GioHangItem payload, HttpSession session) {
        List<GioHangItem> list = (List<GioHangItem>) session.getAttribute("gioHangAnUong");
        if (list == null) list = new ArrayList<>();
        
        boolean daCo = false;
        for (GioHangItem item : list) {
            if (item.getId().equals(payload.getId())) {
                item.setSoLuong(item.getSoLuong() + payload.getSoLuong());
                daCo = true; break;
            }
        }
        
        if (!daCo) {
            list.add(new GioHangItem(payload.getId(), payload.getTenSp(), payload.getGia(), payload.getHinhAnh(), payload.getSoLuong()));
        }
        
        session.setAttribute("gioHangAnUong", list);
        return ResponseEntity.ok(Map.of("message", "Đã thêm " + payload.getSoLuong() + " " + payload.getTenSp() + " vào giỏ!"));
    }

    @GetMapping("/gio-hang")
    public ResponseEntity<?> xemGioHang(HttpSession session) {
        List<GioHangItem> list = (List<GioHangItem>) session.getAttribute("gioHangAnUong");
        if (list == null) list = new ArrayList<>();

        double tongTien = 0;
        for (GioHangItem item : list) {
            tongTien += (item.getGia() * item.getSoLuong()); 
        }

        Map<String, Object> response = new HashMap<>();
        response.put("gioHang", list);
        response.put("tongTien", tongTien);
        
        if (tongTien > 0) {
            String qrUrl = qrCodeService.generateQRCodeURL((long) tongTien, "Thanh toan do an");
            response.put("qrUrl", qrUrl);
        } else {
            response.put("qrUrl", "");
        }
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/gio-hang/xoa/{id}")
    public ResponseEntity<?> xoaKhoiGioHang(@PathVariable Long id, HttpSession session) {
        List<GioHangItem> list = (List<GioHangItem>) session.getAttribute("gioHangAnUong");
        if (list != null) {
            list.removeIf(item -> item.getId().equals(id));
            session.setAttribute("gioHangAnUong", list);
        }
        return ResponseEntity.ok(Map.of("message", "Đã xóa!"));
    }

    @PostMapping("/gio-hang/thanh-toan")
    public ResponseEntity<?> thanhToanGioHang(@RequestBody Map<String, Object> payload, HttpSession session) {
        try {
            // Lấy giỏ từ payload thay vì session
            List<Map<String, Object>> list = (List<Map<String, Object>>) payload.get("gioHang");
            
            if (list == null || list.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Giỏ hàng trống!"));
            }

            // Chuyển sang GioHangItem
            List<GioHangItem> cartItems = new ArrayList<>();
            for (Map<String, Object> item : list) {
                Long id = Long.valueOf(item.get("id").toString());
                String tenSp = item.get("tenSp").toString();
                Double gia = Double.valueOf(item.get("gia").toString());
                String hinhAnh = item.getOrDefault("hinhAnh", "").toString();
                int soLuong = Integer.valueOf(item.get("soLuong").toString());
                cartItems.add(new GioHangItem(id, tenSp, gia, hinhAnh, soLuong));
            }

            // Bắt lỗi an toàn hơn
            Object nguoiMuaObj = payload.get("nguoiMua");
            String user = "Khách vãng lai"; // Mặc định
            if (nguoiMuaObj != null && !nguoiMuaObj.toString().trim().isEmpty()) {
                user = nguoiMuaObj.toString().trim();
            }

            double tongTien = cartItems.stream().mapToDouble(i -> i.getGia() * i.getSoLuong()).sum();

            // Trừ tồn kho cho từng món trước khi lưu hóa đơn
            for (GioHangItem item : cartItems) {
                MonAn monAn = monAnRepository.findById(item.getId()).orElse(null);
                if (monAn == null) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy món ăn ID = " + item.getId()));
                }

                int tonHienTai = monAn.getSoLuongTon() == null ? 0 : monAn.getSoLuongTon();
                if (tonHienTai < item.getSoLuong()) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "message", "Món '" + monAn.getTenMon() + "' không đủ tồn kho. Hiện còn: " + tonHienTai
                    ));
                }

                monAn.setSoLuongTon(tonHienTai - item.getSoLuong());
                monAnRepository.save(monAn);
            }

            HoaDon hd = new HoaDon();
            hd.setNguoiMua(user);
            hd.setTongTien(tongTien);
            hd.setNgayMua(LocalDateTime.now());
            hd.setTrangThai("Thành công"); 
            hd.setLoaiGiaoDich("AN_UONG");
            HoaDon savedHd = hoaDonRepository.save(hd);

            for (GioHangItem item : cartItems) {
                ChiTietHoaDon ct = new ChiTietHoaDon();
                ct.setHoaDonId(savedHd.getId());
                ct.setTenSanPham(item.getTenSp());
                ct.setGia(item.getGia());
                ct.setSoLuong(item.getSoLuong());
                ct.setHinhAnh(item.getHinhAnh());
                chiTietHoaDonRepository.save(ct);
            }

            // ========================================================
            // ĐÃ THÊM: CỘNG TIỀN VÀO TỔNG CHI TIÊU ĐỂ LÊN HẠNG VIP
            // ========================================================
            if (!"Khách vãng lai".equals(user)) {
                dichVuTaiKhoan.capNhatChiTieuVaHang(user, tongTien);
            }

            return ResponseEntity.ok(Map.of(
                "message", "Thanh toán thành công!",
                "hoaDonId", savedHd.getId()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi xử lý thanh toán: " + e.getMessage()));
        }
    }
}
package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.ChiTietHoaDon;
import com.example.playgroundapi.entity.GioHangItem;
import com.example.playgroundapi.entity.HoaDon;
import com.example.playgroundapi.repository.ChiTietHoaDonRepository;
import com.example.playgroundapi.repository.HoaDonRepository;
import com.example.playgroundapi.service.QRCodeService;
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
@RequestMapping("/api/gio-hang")
// Bắt buộc phải có allowCredentials = "true" để React giữ được Session giỏ hàng
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class GioHangRestController {

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private ChiTietHoaDonRepository chiTietHoaDonRepository;

    @Autowired
    private QRCodeService qrCodeService;

    // ==========================================
    // PHẦN 1: GIỎ HÀNG ĐỒ CHƠI (HOẶC VÉ)
    // ==========================================
    
    @PostMapping("/do-choi/them") 
    public ResponseEntity<?> themVaoGio(@RequestBody GioHangItem payload, HttpSession session) {
        xuLyThemVaoGio(session, "gioHang", payload);
        
        Map<String, String> res = new HashMap<>();
        res.put("message", "Đã thêm " + payload.getTenSp() + " vào giỏ hàng đồ chơi!");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/do-choi")
    public ResponseEntity<?> xemGioHang(HttpSession session) {
        return ResponseEntity.ok(hienThiGioHang(session, "gioHang"));
    }

    @DeleteMapping("/do-choi/xoa/{id}")
    public ResponseEntity<?> xoaKhoiGio(@PathVariable Long id, HttpSession session) {
        xoaKhoiSession(session, "gioHang", id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi giỏ hàng!"));
    }

    @PostMapping("/do-choi/thanh-toan")
    public ResponseEntity<?> thanhToanDoChoi(@RequestBody Map<String, Object> payload, HttpSession session) {
        return luuHoaDon(session, payload, "gioHang", "DO_CHOI");
    }

    // ==========================================
    // PHẦN 2: GIỎ HÀNG ĂN UỐNG
    // ==========================================

    @PostMapping("/an-uong/them")
    public ResponseEntity<?> themVaoGioAnUong(@RequestBody GioHangItem payload, HttpSession session) {
        xuLyThemVaoGio(session, "gioHangAnUong", payload);
        
        Map<String, String> res = new HashMap<>();
        res.put("message", "Đã thêm " + payload.getTenSp() + " vào giỏ hàng ăn uống!");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/an-uong")
    public ResponseEntity<?> xemGioHangAnUong(HttpSession session) {
        return ResponseEntity.ok(hienThiGioHang(session, "gioHangAnUong"));
    }

    @DeleteMapping("/an-uong/xoa/{id}")
    public ResponseEntity<?> xoaKhoiGioAnUong(@PathVariable Long id, HttpSession session) {
        xoaKhoiSession(session, "gioHangAnUong", id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa món ăn khỏi giỏ hàng!"));
    }

    @PostMapping("/an-uong/thanh-toan")
    public ResponseEntity<?> thanhToanAnUong(@RequestBody Map<String, Object> payload, HttpSession session) {
        return luuHoaDon(session, payload, "gioHangAnUong", "AN_UONG");
    }

    // ==========================================
    // CÁC HÀM XỬ LÝ CHUNG (Đã chuyển đổi sang REST)
    // ==========================================

    private void xuLyThemVaoGio(HttpSession session, String sessionKey, GioHangItem payload) {
        List<GioHangItem> list = (List<GioHangItem>) session.getAttribute(sessionKey);
        if (list == null) list = new ArrayList<>();
        
        boolean daCo = false;
        for (GioHangItem item : list) {
            if (item.getId().equals(payload.getId())) {
                item.setSoLuong(item.getSoLuong() + payload.getSoLuong());
                daCo = true;
                break;
            }
        }
        
        if (!daCo) {
            list.add(new GioHangItem(payload.getId(), payload.getTenSp(), payload.getGia(), payload.getHinhAnh(), payload.getSoLuong()));
        }
        session.setAttribute(sessionKey, list);
    }

    // Trả về Map<String, Object> thay vì gán vào Model như cũ
    private Map<String, Object> hienThiGioHang(HttpSession session, String sessionKey) {
        List<GioHangItem> list = (List<GioHangItem>) session.getAttribute(sessionKey);
        if (list == null) list = new ArrayList<>();

        double tongTien = 0;
        for (GioHangItem item : list) {
            tongTien += (item.getGia() * item.getSoLuong()); 
        }

        Map<String, Object> response = new HashMap<>();
        response.put("gioHang", list);
        response.put("tongTien", tongTien);
        
        // Gọi Service tạo QR Code nếu giỏ hàng có tiền
        if (tongTien > 0) {
            long soTienNguyen = (long) tongTien;
            String noiDungCk = "THANHTOAN DONHANG"; 
            String qrUrl = qrCodeService.generateQRCodeURL(soTienNguyen, noiDungCk);
            response.put("qrUrl", qrUrl);
        } else {
            response.put("qrUrl", "");
        }

        return response;
    }

    private void xoaKhoiSession(HttpSession session, String sessionKey, Long id) {
        List<GioHangItem> list = (List<GioHangItem>) session.getAttribute(sessionKey);
        if (list != null) {
            list.removeIf(item -> item.getId().equals(id));
            session.setAttribute(sessionKey, list);
        }
    }

    // Trả về ResponseEntity báo thành công/thất bại cho React
    private ResponseEntity<?> luuHoaDon(HttpSession session, Map<String, Object> payload, String sessionKey, String loaiGiaoDich) {
        List<GioHangItem> list = (List<GioHangItem>) session.getAttribute(sessionKey);
        
        if (list == null || list.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Giỏ hàng của bạn đang trống!"));
        }

        // Lấy thông tin user từ React gửi lên (hoặc gán mặc định nếu không có)
        String user = payload.getOrDefault("nguoiMua", "").toString();
        if (user.isEmpty()) {
            user = "Khách vãng lai"; 
        }

        double tongTien = list.stream().mapToDouble(item -> item.getGia() * item.getSoLuong()).sum();

        HoaDon hd = new HoaDon();
        hd.setNguoiMua(user);
        hd.setTongTien(tongTien);
        hd.setNgayMua(LocalDateTime.now());
        hd.setTrangThai("Đang xử lý");
        hd.setLoaiGiaoDich(loaiGiaoDich);
        HoaDon savedHd = hoaDonRepository.save(hd);

        for (GioHangItem item : list) {
            ChiTietHoaDon ct = new ChiTietHoaDon();
            ct.setHoaDonId(savedHd.getId());
            ct.setTenSanPham(item.getTenSp());
            ct.setGia(item.getGia());
            ct.setSoLuong(item.getSoLuong());
            ct.setHinhAnh(item.getHinhAnh());
            chiTietHoaDonRepository.save(ct);
        }
        
        session.removeAttribute(sessionKey); // Thanh toán xong thì xóa giỏ hàng
        
        return ResponseEntity.ok(Map.of(
            "message", "Thanh toán thành công!", 
            "hoaDonId", savedHd.getId()
        ));
    }
}
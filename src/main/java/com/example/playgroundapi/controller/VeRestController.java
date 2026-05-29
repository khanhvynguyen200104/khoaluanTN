package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.ChiTietHoaDon;
import com.example.playgroundapi.entity.GiaVe;
import com.example.playgroundapi.entity.HoaDon;
import com.example.playgroundapi.entity.MuaVe;
import com.example.playgroundapi.entity.UuDai;
import com.example.playgroundapi.repository.ChiTietHoaDonRepository;
import com.example.playgroundapi.repository.GiaVeRepository;
import com.example.playgroundapi.repository.HoaDonRepository;
import com.example.playgroundapi.repository.MuaVeRepository;
import com.example.playgroundapi.repository.UuDaiRepository;
import com.example.playgroundapi.repository.NguoiDungRepository;
import com.example.playgroundapi.service.QRCodeService;
import com.example.playgroundapi.service.DichVuTaiKhoan; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ve")
@CrossOrigin(origins = "*")
public class VeRestController {

    @Autowired private MuaVeRepository muaVeRepository;
    @Autowired private HoaDonRepository hoaDonRepository;
    @Autowired private ChiTietHoaDonRepository chiTietHoaDonRepository;
    @Autowired private QRCodeService qrCodeService; 
    @Autowired private UuDaiRepository uuDaiRepo;
    @Autowired private GiaVeRepository giaVeRepository;
    @Autowired private DichVuTaiKhoan dichVuTaiKhoan;
    @Autowired private NguoiDungRepository nguoiDungRepository;

    private GiaVe layOrTaoGiaVeMacDinh() {
        GiaVe giaVe = giaVeRepository.findFirstByOrderByIdAsc();
        if (giaVe != null) {
            return giaVe;
        }

        GiaVe macDinh = new GiaVe();
        macDinh.setGiaCombo(100000L);
        macDinh.setPhuThuComboCuoiTuan(20000L);
        macDinh.setGiaNguoiLon(20000L);
        return giaVeRepository.save(macDinh);
    }

    // --- 1. API Tính Tiền & Hiện QR Code ---
    @PostMapping("/xac-nhan")
    public ResponseEntity<?> xacNhanThanhToan(@RequestBody Map<String, Object> payload) {
        String ngaySuDung = payload.get("ngaySuDung").toString();
        int slCombo = Integer.parseInt(payload.get("slCombo").toString());
        int slNguoiLon = Integer.parseInt(payload.get("slNguoiLon").toString());
        int slBe = Integer.parseInt(payload.get("slBe").toString());
        String maGiamGia = payload.getOrDefault("maGiamGia", "").toString();
        
        String hangThanhVien = payload.getOrDefault("hangThanhVien", "SILVER").toString().toUpperCase();

        GiaVe giaVe = layOrTaoGiaVeMacDinh();
        long giaCombo = giaVe.getGiaCombo();
        long phuThu = 0;
        LocalDate date = LocalDate.parse(ngaySuDung);
        if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            phuThu = giaVe.getPhuThuComboCuoiTuan();
            giaCombo += phuThu; 
        }

        long tongTienGoc = (slCombo * giaCombo) + (slNguoiLon * giaVe.getGiaNguoiLon());
        int tongSoLuong = slCombo + slNguoiLon + slBe;

        long soTienGiamHang = 0;
        if ("SILVER".equals(hangThanhVien)) {
            soTienGiamHang = (long) (tongTienGoc * 0.15);
        } else if ("GOLD".equals(hangThanhVien)) {
            soTienGiamHang = (long) (tongTienGoc * 0.20);
        } else if ("DIAMOND".equals(hangThanhVien)) {
            soTienGiamHang = (long) (tongTienGoc * 0.25);
        }

        long soTienGiamVoucher = 0;
        String thongBaoVoucher = "";

        if (!maGiamGia.trim().isEmpty()) {
            UuDai voucher = uuDaiRepo.findByMaCode(maGiamGia.trim().toUpperCase());
            if (voucher != null) {
                if (voucher.getNgayKetThuc() != null && voucher.getNgayKetThuc().isBefore(LocalDate.now())) {
                    thongBaoVoucher = "Mã đã hết hạn!";
                } else {
                    soTienGiamVoucher = (long) (tongTienGoc * voucher.getPhanTramGiam() / 100.0);
                    thongBaoVoucher = "Giảm " + voucher.getPhanTramGiam() + "%";
                }
            } else {
                thongBaoVoucher = "Mã không tồn tại!";
            }
        }

        long tongTienPhaiTra = Math.max(0, tongTienGoc - soTienGiamHang - soTienGiamVoucher);

        StringBuilder moTaVe = new StringBuilder();
        if (slCombo > 0) moTaVe.append(slCombo).append(" Combo, ");
        if (slNguoiLon > 0) moTaVe.append(slNguoiLon).append(" Phụ huynh, ");
        if (slBe > 0) moTaVe.append(slBe).append(" Bé");
        
        String loaiVeStr = moTaVe.toString();
        if (loaiVeStr.endsWith(", ")) loaiVeStr = loaiVeStr.substring(0, loaiVeStr.length() - 2);
        if (phuThu > 0) loaiVeStr += " (Phụ thu T7/CN)";

        String qrUrl = qrCodeService.generateQRCodeURL(tongTienPhaiTra, "MUAVE " + System.currentTimeMillis() % 10000);

        Map<String, Object> response = new HashMap<>();
        response.put("ngaySuDung", ngaySuDung);
        response.put("loaiVe", loaiVeStr);
        response.put("tongSoLuong", tongSoLuong);
        response.put("tongTienGoc", tongTienGoc);
        
        response.put("soTienGiamHang", soTienGiamHang); 
        response.put("soTienGiam", soTienGiamVoucher);
        response.put("thongBaoVoucher", thongBaoVoucher);
        response.put("tongTien", tongTienPhaiTra);
        response.put("qrUrl", qrUrl);

        return ResponseEntity.ok(response);
    }

    // --- 2. API Lưu Vé Sau Khi Khách Chuyển Khoản ---
    @PostMapping("/hoan-tat")
    public ResponseEntity<?> luuVeVaoDB(@RequestBody Map<String, Object> payload) {
        String loaiVe = payload.get("loaiVe").toString();
        int tongSoLuong = Integer.parseInt(payload.get("tongSoLuong").toString());
        double tongTien = Double.parseDouble(payload.get("tongTien").toString());
        String ngaySuDung = payload.get("ngaySuDung").toString();
        String user = payload.getOrDefault("nguoiMua", "Khách vãng lai").toString();
        String soDienThoaiKhach = payload.getOrDefault("soDienThoaiKhach", "").toString().trim();

        if (soDienThoaiKhach.isEmpty() && user != null && !user.trim().isEmpty() && !"Khách vãng lai".equalsIgnoreCase(user.trim())) {
            soDienThoaiKhach = nguoiDungRepository.findByTenDangNhap(user.trim())
                .map(nd -> nd.getSoDienThoai() == null ? "" : nd.getSoDienThoai().trim())
                .orElse("");
        }
        
        String maVeRandom = "VE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        MuaVe ve = new MuaVe();
        ve.setTenTaiKhoan(user);
        ve.setLoaiVe(loaiVe);
        ve.setSoLuong(tongSoLuong);
        ve.setTongTien((int)tongTien);
        ve.setNgaySuDung(ngaySuDung);
        ve.setNgayDat(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy")));
        ve.setTrangThai("Thành công"); 
        ve.setMaVe(maVeRandom);
        ve.setSoDienThoaiKhach(soDienThoaiKhach);
        
        // --- ĐÃ THÊM DÒNG NÀY ĐỂ FIX LỖI ---
        ve.setGiaTaiThoiDiemMua((int)tongTien); 
        
        muaVeRepository.save(ve);

        HoaDon hd = new HoaDon();
        hd.setNguoiMua(user);
        hd.setTongTien(tongTien);
        hd.setNgayMua(LocalDateTime.now());
        hd.setTrangThai("Thành công");
        hd.setLoaiGiaoDich("MUA_VE");
        
        hd.setMaVe(maVeRandom);
        hd.setLoaiVe(loaiVe);
        hd.setSoDienThoaiKhach(soDienThoaiKhach.isEmpty() ? null : soDienThoaiKhach);
        
        HoaDon savedHd = hoaDonRepository.save(hd);

        ChiTietHoaDon ct = new ChiTietHoaDon();
        ct.setHoaDonId(savedHd.getId());
        ct.setTenSanPham("Vé tham quan: " + loaiVe);
        ct.setGia(tongTien);
        ct.setSoLuong(1);    
        ct.setHinhAnh("https://cdn-icons-png.flaticon.com/512/2850/2850769.png"); 
        chiTietHoaDonRepository.save(ct);

        if (!user.equals("Khách vãng lai")) {
            dichVuTaiKhoan.capNhatChiTieuVaHang(user, tongTien);
        }

        Map<String, String> res = new HashMap<>();
        res.put("message", "Thanh toán thành công, đã cập nhật chi tiêu!");
        res.put("maVe", maVeRandom); 
        
        return ResponseEntity.ok(res);
    }
}
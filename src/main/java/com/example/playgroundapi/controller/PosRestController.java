package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.ThanhToanRequest; 
import com.example.playgroundapi.entity.HoaDon;
import com.example.playgroundapi.entity.MonAn;
import com.example.playgroundapi.entity.Ve;
import com.example.playgroundapi.entity.NguoiDung; 
import com.example.playgroundapi.entity.MuaVe;
import com.example.playgroundapi.repository.NguoiDungRepository; 

import com.example.playgroundapi.repository.HoaDonRepository;
import com.example.playgroundapi.repository.MonAnRepository;
import com.example.playgroundapi.repository.MuaVeRepository;
import com.example.playgroundapi.repository.VeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/pos")
@CrossOrigin(origins = "*") // Cho phép React gọi API không bị lỗi CORS
public class PosRestController {

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private MonAnRepository monAnRepository;

    @Autowired
    private VeRepository veRepository;

    @Autowired
    private MuaVeRepository muaVeRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository; 

    // ==========================================
    // API 1: LẤY DANH SÁCH MÓN ĂN TỪ SQL
    // ==========================================
    @GetMapping("/mon-an")
    public List<MonAn> getAllMonAn() {
        return monAnRepository.findAll(); 
    }

    // ==========================================
    // API 2: LẤY DANH SÁCH VÉ TỪ SQL
    // ==========================================
    @GetMapping("/ve")
    public List<Ve> getAllVe() {
        return veRepository.findAll(); 
    }

    // ==========================================
    // API 3: THANH TOÁN
    // ==========================================
    @PostMapping("/thanh-toan")
    public ResponseEntity<?> xuLyThanhToan(@RequestBody ThanhToanRequest request) {
        try {
            HoaDon hd = new HoaDon();

            // 1. Logic Đổi tên loại vé theo ý bạn
            String loaiVeHienThi = "";
            if (request.getVeCombo() > 0 && request.getVeNguoiLon() > 0) {
                loaiVeHienThi = "Combo + Phụ huynh";
            } else if (request.getVeCombo() > 0) {
                loaiVeHienThi = "Vé Combo";
            } else if (request.getVeNguoiLon() > 0) {
                loaiVeHienThi = "Vé Phụ huynh";
            } else {
                loaiVeHienThi = "Đồ ăn/Nước uống";
            }
            hd.setLoaiVe(loaiVeHienThi);

            // Lưu tổng số lượng vé (Combo + Người lớn) xuống CSDL
            hd.setSoLuong(request.getVeCombo() + request.getVeNguoiLon());

            // 2. Logic Loại giao dịch: MUA_VE + AN_UONG
            boolean coMuaVe = (request.getVeCombo() > 0 || request.getVeNguoiLon() > 0);
            boolean coMuaDoAn = request.getChiTietHoaDon() != null && 
                               request.getChiTietHoaDon().stream().anyMatch(item -> "DO_AN".equals(item.getLoai()));

            if (coMuaVe && coMuaDoAn) {
                hd.setLoaiGiaoDich("MUA_VE + AN_UONG");
            } else if (coMuaVe) {
                hd.setLoaiGiaoDich("MUA_VE");
            } else {
                hd.setLoaiGiaoDich("AN_UONG");
            }

            // 3. Các thông tin khác
            hd.setTongTien(request.getTongThanhToan());
            hd.setNguoiMua(request.getNhanVienThuNgan());
            hd.setNgayMua(LocalDateTime.now());
            hd.setTrangThai("Thành công");
            hd.setPhuongThucThanhToan(request.getPhuongThucThanhToan()); 
            hd.setMaVongTay(request.getMaVongTay());
            hd.setSoDienThoaiKhach(request.getSoDienThoaiKhach());

            // Trừ tồn kho đồ ăn/nước uống nếu hóa đơn có món thuộc nhóm DO_AN
            if (request.getChiTietHoaDon() != null) {
                for (ThanhToanRequest.ChiTietItem item : request.getChiTietHoaDon()) {
                    if (item.getLoai() == null || !"DO_AN".equals(item.getLoai())) {
                        continue;
                    }

                    if (item.getId() == null || item.getId().trim().isEmpty()) {
                        continue;
                    }

                    Long monAnId;
                    try {
                        monAnId = Long.valueOf(item.getId().trim());
                    } catch (NumberFormatException nfe) {
                        return ResponseEntity.badRequest().body(Map.of("loi", "ID món ăn không hợp lệ: " + item.getId()));
                    }

                    MonAn monAn = monAnRepository.findById(monAnId).orElse(null);
                    if (monAn == null) {
                        return ResponseEntity.badRequest().body(Map.of("loi", "Không tìm thấy món ăn ID = " + item.getId()));
                    }

                    int soLuong = item.getSoLuong() == null ? 0 : item.getSoLuong();

                    int tonHienTai = monAn.getSoLuongTon() == null ? 0 : monAn.getSoLuongTon();
                    if (tonHienTai < soLuong) {
                        return ResponseEntity.badRequest().body(Map.of(
                            "loi", "Món '" + monAn.getTenMon() + "' không đủ tồn kho. Hiện còn: " + tonHienTai
                        ));
                    }

                    monAn.setSoLuongTon(tonHienTai - soLuong);
                    monAnRepository.save(monAn);
                }
            }

            // ✅ ĐÃ SỬA: Tự động sinh mã FOOD- hoặc VE- hoặc CMB- tùy loại giao dịch
            String prefix = "VE-"; 
            if ("AN_UONG".equals(hd.getLoaiGiaoDich())) {
                prefix = "FOOD-";
            } else if ("MUA_VE + AN_UONG".equals(hd.getLoaiGiaoDich())) {
                prefix = "CMB-";
            }
            
            String maGiaoDichRandom = prefix + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            hd.setMaVe(maGiaoDichRandom); // Lưu chung vào cột ma_ve trong SQL

            hoaDonRepository.save(hd);

            // 👉 4. LOGIC CỘNG TIỀN VÀ NÂNG HẠNG KHÁCH HÀNG 
            if (request.getSoDienThoaiKhach() != null && !request.getSoDienThoaiKhach().isEmpty()) {
                
                NguoiDung nd = nguoiDungRepository.findBySoDienThoai(request.getSoDienThoaiKhach()).orElse(null);
                
                if (nd != null) {
                    // Cộng dồn chi tiêu
                    double chiTieuMoi = nd.getTongChiTieu() + request.getTongThanhToan();
                    nd.setTongChiTieu(chiTieuMoi);
                    
                    // Auto cập nhật hạng thành viên
                    if (chiTieuMoi >= 4000000) { 
                        nd.setHangThanhVien("DIAMOND");
                    } else if (chiTieuMoi >= 1000000) { 
                        nd.setHangThanhVien("GOLD");    
                    } else {
                        nd.setHangThanhVien("SILVER");  
                    }
                    
                    // Lưu khách hàng lại vào Database
                    nguoiDungRepository.save(nd);
                }
            }

            // 5. CHUẨN BỊ DỮ LIỆU TRẢ VỀ CHO REACT
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Thanh toán thành công");
            response.put("maVe", maGiaoDichRandom); // ✅ Đã sửa biến

            // Nếu là chuyển khoản thì tạo link VietQR
            if ("CHUYEN_KHOAN".equals(request.getPhuongThucThanhToan())) {
                String maNganHang = "970422"; // Ví dụ mã BIN MBBank
                String soTaiKhoan = "0987654321"; // ĐIỀN SỐ TÀI KHOẢN CỦA BẠN VÀO ĐÂY
                long soTien = (long) request.getTongThanhToan();
                
                String linkQR = String.format("https://img.vietqr.io/image/%s-%s-compact2.jpg?amount=%d&addInfo=%s", 
                                              maNganHang, soTaiKhoan, soTien, maGiaoDichRandom); // ✅ Đã sửa biến
                
                // Trả về qrUrl cho React bắt được
                response.put("qrUrl", linkQR);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("loi", e.getMessage()));
        }
    }

    // ==========================================
    // API 4: LỊCH SỬ
    // ==========================================
    @GetMapping("/lich-su")
    public ResponseEntity<?> layLichSuBanHang(@RequestParam String nhanVien) {
        try {
            if (nhanVien == null || nhanVien.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("loi", "Thiếu thông tin nhân viên!"));
            }

            List<HoaDon> danhSach = hoaDonRepository.findByNguoiMuaOrderByIdDesc(nhanVien.trim());
            return ResponseEntity.ok(danhSach);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("loi", "Lỗi server: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ==========================================
    // API 5: TÌM VÉ ONLINE & ĐỔI VÉ
    // ==========================================
    @GetMapping("/ve-online")
    public ResponseEntity<?> timVeOnline(@RequestParam String maVe) {
        try {
            // Tìm hóa đơn dựa trên mã vé
            HoaDon hd = hoaDonRepository.findByMaVe(maVe);
            MuaVe ve = muaVeRepository.findByMaVe(maVe);

            String soDienThoaiTuNguoiDung = "";
            if (hd != null && hd.getNguoiMua() != null && !hd.getNguoiMua().trim().isEmpty()) {
                soDienThoaiTuNguoiDung = nguoiDungRepository.findByTenDangNhap(hd.getNguoiMua().trim())
                        .map(nd -> nd.getSoDienThoai() == null ? "" : nd.getSoDienThoai().trim())
                        .orElse("");
            } else if (ve != null && ve.getTenTaiKhoan() != null && !ve.getTenTaiKhoan().trim().isEmpty()) {
                soDienThoaiTuNguoiDung = nguoiDungRepository.findByTenDangNhap(ve.getTenTaiKhoan().trim())
                        .map(nd -> nd.getSoDienThoai() == null ? "" : nd.getSoDienThoai().trim())
                        .orElse("");
            }
            
            if (hd != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", hd.getId());
                response.put("maVe", hd.getMaVe());
                response.put("loaiVe", hd.getLoaiVe());
                response.put("tongTien", hd.getTongTien());
                response.put("trangThai", hd.getTrangThai());
                response.put("maVongTay", hd.getMaVongTay());
                response.put("soDienThoaiKhach", hd.getSoDienThoaiKhach() != null && !hd.getSoDienThoaiKhach().trim().isEmpty() ? hd.getSoDienThoaiKhach() : (ve != null && ve.getSoDienThoaiKhach() != null && !ve.getSoDienThoaiKhach().trim().isEmpty() ? ve.getSoDienThoaiKhach() : soDienThoaiTuNguoiDung));
                response.put("nguoiMua", hd.getNguoiMua());
                response.put("loaiGiaoDich", hd.getLoaiGiaoDich());
                return ResponseEntity.ok(response);
            } else if (ve != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", ve.getId());
                response.put("maVe", ve.getMaVe());
                response.put("loaiVe", ve.getLoaiVe());
                response.put("tongTien", ve.getTongTien());
                response.put("trangThai", ve.getTrangThai());
                response.put("soDienThoaiKhach", ve.getSoDienThoaiKhach() != null && !ve.getSoDienThoaiKhach().trim().isEmpty() ? ve.getSoDienThoaiKhach() : soDienThoaiTuNguoiDung);
                response.put("nguoiMua", ve.getTenTaiKhoan());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of("loi", "Không tìm thấy mã vé này!"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Lỗi server: " + e.getMessage()));
        }
    }

    // ==========================================
    // API 6.1: XUẤT VÉ ONLINE / GHI NHẬN ĐÃ SỬ DỤNG
    // ==========================================
    @PostMapping("/xuat-ve-online")
    public ResponseEntity<?> xuatVeOnline(@RequestBody Map<String, String> payload) {
        try {
            String maVe = payload.get("maVe");
            String maVongTay = payload.get("maVongTay");

            if (maVe == null || maVe.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("loi", "Thiếu mã vé!"));
            }

            String maVeTrim = maVe.trim();
            HoaDon hd = hoaDonRepository.findByMaVe(maVeTrim);
            MuaVe ve = muaVeRepository.findByMaVe(maVeTrim);

            if (hd == null && ve == null) {
                return ResponseEntity.badRequest().body(Map.of("loi", "Không tìm thấy vé online này!"));
            }

            if (ve != null) {
                String trangThai = ve.getTrangThai() != null ? ve.getTrangThai().trim() : "";
                if ("Đã sử dụng".equalsIgnoreCase(trangThai)) {
                    return ResponseEntity.badRequest().body(Map.of("loi", "Vé này đã được xuất/sử dụng rồi!"));
                }

                ve.setTrangThai("Đã sử dụng");
                muaVeRepository.save(ve);
            }

            if (hd != null) {
                hd.setTrangThai("Đã sử dụng");
                if (maVongTay != null && !maVongTay.trim().isEmpty()) {
                    hd.setMaVongTay(maVongTay.trim());
                }
                hoaDonRepository.save(hd);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Xuất vé online thành công!");
            response.put("maVe", maVeTrim);
            response.put("maVongTay", maVongTay != null ? maVongTay.trim() : "");
            response.put("soDienThoaiKhach", hd != null && hd.getSoDienThoaiKhach() != null && !hd.getSoDienThoaiKhach().trim().isEmpty() ? hd.getSoDienThoaiKhach() : (ve != null && ve.getSoDienThoaiKhach() != null && !ve.getSoDienThoaiKhach().trim().isEmpty() ? ve.getSoDienThoaiKhach() : (hd != null && hd.getNguoiMua() != null ? nguoiDungRepository.findByTenDangNhap(hd.getNguoiMua().trim()).map(nd -> nd.getSoDienThoai() == null ? "" : nd.getSoDienThoai().trim()).orElse("") : (ve != null && ve.getTenTaiKhoan() != null ? nguoiDungRepository.findByTenDangNhap(ve.getTenTaiKhoan().trim()).map(nd -> nd.getSoDienThoai() == null ? "" : nd.getSoDienThoai().trim()).orElse("") : ""))));
            response.put("trangThai", "Đã sử dụng");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Lỗi server: " + e.getMessage()));
        }
    }

    // ==========================================
    // API 6: TÌM ĐƠN ĐỒ ĂN ONLINE
    // ==========================================
    @GetMapping("/don-an-online")
    public ResponseEntity<?> timDonAnOnline(@RequestParam String maDon) {
        try {
            // ✅ ĐÃ SỬA: Tìm trực tiếp trong cột ma_ve bằng mã FOOD- truyền vào
            HoaDon hd = hoaDonRepository.findByMaVe(maDon);
            
            if (hd != null) {
                if ("AN_UONG".equals(hd.getLoaiGiaoDich()) || hd.getLoaiGiaoDich().contains("AN_UONG")) {
                    return ResponseEntity.ok(hd);
                } else {
                    return ResponseEntity.badRequest().body(Map.of("loi", "Mã giao dịch này không phải là đơn đồ ăn!"));
                }
            } else {
                return ResponseEntity.badRequest().body(Map.of("loi", "Không tìm thấy mã đơn này!"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Lỗi server: " + e.getMessage()));
        }
    }
    // ==========================================
    // API 7: CẬP NHẬT MÃ VÒNG TAY (Dành cho vé Online)
    // ==========================================
    @PostMapping("/cap-nhat-vong-tay")
    public ResponseEntity<?> capNhatVongTay(@RequestBody Map<String, String> payload) {
        try {
            String maVe = payload.get("maVe");
            String maVongTay = payload.get("maVongTay");

            // Tìm hóa đơn bằng mã vé
            HoaDon hd = hoaDonRepository.findByMaVe(maVe);
            
            if (hd != null) {
                hd.setMaVongTay(maVongTay); // Cập nhật mã vòng tay mới
                hoaDonRepository.save(hd);  // Lưu lại xuống CSDL
                return ResponseEntity.ok(Map.of("message", "Cập nhật mã vòng tay thành công!"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("loi", "Không tìm thấy mã vé này để cập nhật!"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Lỗi server: " + e.getMessage()));
        }
    }

    // ==========================================
    // API 8: CHECKOUT - LƯU GIỜ RA KHÁCH
    // ==========================================
    @PostMapping("/checkout")
    public ResponseEntity<?> checkoutKhach(@RequestBody Map<String, String> payload) {
        try {
            String maVe = payload.get("maVe");
            
            // Tìm hóa đơn bằng mã vé
            HoaDon hd = hoaDonRepository.findByMaVe(maVe);
            
            if (hd != null) {
                hd.setGioKhachVe(LocalDateTime.now()); // Lưu giờ ra hiện tại
                hoaDonRepository.save(hd);
                return ResponseEntity.ok(Map.of("message", "Checkout thành công! Giờ ra đã được ghi nhận."));
            } else {
                return ResponseEntity.badRequest().body(Map.of("loi", "Không tìm thấy mã vé này!"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Lỗi server: " + e.getMessage()));
        }
    }
}
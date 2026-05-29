package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.*;
import com.example.playgroundapi.repository.*;
import com.example.playgroundapi.service.DichVuEmail;
import com.example.playgroundapi.service.GuestForecastService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRestController {

    @Autowired private HoaDonRepository hoaDonRepo;
    @Autowired private GiaVeRepository giaVeRepo;
    @Autowired private NguoiDungRepository nguoiDungRepo;
    @Autowired private UuDaiRepository uuDaiRepo;
    @Autowired private GoiTiecRepository goiTiecRepo;
    @Autowired private DatTiecRepository datTiecRepo;
    @Autowired private GuestForecastService guestForecastService;
    @Autowired private DichVuEmail dichVuEmail;

    // Lớp chứa dữ liệu biểu đồ
    public static class BaoCaoNgay {
        private String ngay;
        private double tongCong = 0;
        public BaoCaoNgay(String ngay) { this.ngay = ngay; }
        public String getNgay() { return ngay; }
        public double getTongCong() { return tongCong; }
        public void setTongCong(double tongCong) { this.tongCong = tongCong; }
    }

    // ==========================================
    // Helper method to check if a transaction should be counted as revenue
    // ==========================================
    private boolean isValidRevenue(HoaDon hd) {
        if (hd == null) {
            return false;
        }
        
        // Get status, default to successful if null
        String status = hd.getTrangThai();
        if (status == null || status.trim().isEmpty()) {
            return true; // Treat null/empty as valid revenue
        }
        
        status = status.trim().toLowerCase();
        
        // Exclude only cancelled and awaiting payment statuses
        // Valid statuses: Đang xử lý, Thành công, Đã sử dụng, Đã nhận món, etc.
        return !status.contains("đã hủy") && 
               !status.contains("cancelled") &&
               !status.contains("hủy") &&
               !status.contains("chờ thanh toán") &&
               !status.contains("pending");
    }

    // ==========================================
    // 1. API THỐNG KÊ DASHBOARD (CÓ BIỂU ĐỒ 12 THÁNG)
    // ==========================================
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData() {
        List<HoaDon> listHoaDon = hoaDonRepo.findAll();
        List<DatTiec> listDatTiec = datTiecRepo.findAll();
        List<BaoCaoNgay> listThongKe = new ArrayList<>();
        
        LocalDate homNay = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM");
        DateTimeFormatter fmtNgayDat = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

        double doanhThuHomNay = 0;
        double doanhThuThangNay = 0;
        double doanhThuNamNay = 0;
        int veBanHomNay = 0;
        double doanhThuDoAnHomNay = 0;
        int soDonDatTiec = 0;

        // Mảng lưu doanh thu 12 tháng của năm nay
        double[] mangDoanhThu12Thang = new double[12];

        // 1. Thống kê 7 ngày cho Biểu đồ (chỉ tính hóa đơn có doanh thu hợp lệ)
        for (int i = 6; i >= 0; i--) {
            LocalDate ngayXet = homNay.minusDays(i);
            BaoCaoNgay bc = new BaoCaoNgay(ngayXet.format(fmt));

            for (HoaDon hd : listHoaDon) {
                if (hd.getNgayMua() != null && 
                    hd.getNgayMua().toLocalDate().isEqual(ngayXet) && 
                    isValidRevenue(hd) &&
                    hd.getTongTien() != null) {
                    bc.setTongCong(bc.getTongCong() + hd.getTongTien());
                }
            }
            listThongKe.add(bc);
        }

        // 2. Tính toán Doanh Thu (Ngày / Tháng / Năm) và gom dữ liệu 12 tháng
        for (HoaDon hd : listHoaDon) {
            if (hd.getNgayMua() != null && hd.getTongTien() != null && isValidRevenue(hd)) {
                LocalDate ngayMua = hd.getNgayMua().toLocalDate();

                // --- TÍNH DOANH THU THEO NĂM NAY ---
                if (ngayMua.getYear() == homNay.getYear()) {
                    doanhThuNamNay += hd.getTongTien();
                    
                    // Cộng dồn vào mảng 12 tháng
                    int thangMua = ngayMua.getMonthValue();
                    mangDoanhThu12Thang[thangMua - 1] += hd.getTongTien();

                    // --- TÍNH DOANH THU THEO THÁNG NÀY ---
                    if (thangMua == homNay.getMonthValue()) {
                        doanhThuThangNay += hd.getTongTien();
                    }
                }

                // --- TÍNH DOANH THU HÔM NAY ---
                if (ngayMua.isEqual(homNay)) {
                    doanhThuHomNay += hd.getTongTien();
                    
                    String loaiGiaoDich = hd.getLoaiGiaoDich() != null ? hd.getLoaiGiaoDich().toUpperCase() : "";
                    if (loaiGiaoDich.contains("AN_UONG")) {
                        doanhThuDoAnHomNay += hd.getTongTien();
                    } else if (loaiGiaoDich.contains("DAT_TIEC")) {
                        soDonDatTiec += 1;
                    } else {
                        veBanHomNay += (hd.getSoLuong() != null && hd.getSoLuong() > 0) ? hd.getSoLuong() : 1; 
                    }
                }
            }
        }

        // 2b. Đếm số đơn đặt tiệc hôm nay từ bảng DatTiec
        for (DatTiec dt : listDatTiec) {
            if (dt.getNgayDat() != null && !dt.getNgayDat().trim().isEmpty()) {
                try {
                    LocalDateTime ngayDatTime = LocalDateTime.parse(dt.getNgayDat(), fmtNgayDat);
                    LocalDate ngayDat = ngayDatTime.toLocalDate();
                    if (ngayDat.isEqual(homNay)) {
                        soDonDatTiec += 1;
                    }
                } catch (Exception e) {
                    System.out.println("Lỗi parse ngày đặt tiệc: " + dt.getNgayDat());
                }
            }
        }

        // 3. Đóng gói mảng 12 tháng thành List để gửi xuống React
        List<Map<String, Object>> listDoanhThu12Thang = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            Map<String, Object> thangMap = new HashMap<>();
            thangMap.put("thang", "Tháng " + (i + 1));
            thangMap.put("tongCong", mangDoanhThu12Thang[i]);
            listDoanhThu12Thang.add(thangMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("doanhThu7Ngay", listThongKe); 
        response.put("doanhThu12Thang", listDoanhThu12Thang); // Gửi thêm dữ liệu biểu đồ 12 tháng
        
        response.put("doanhThuHomNay", doanhThuHomNay);
        response.put("doanhThuThangNay", doanhThuThangNay); 
        response.put("doanhThuNamNay", doanhThuNamNay);     
        response.put("veBanHomNay", veBanHomNay);
        response.put("doanhThuDoAnHomNay", doanhThuDoAnHomNay);
        response.put("soDonDatTiec", soDonDatTiec);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 1b. API THỐNG KÊ DASHBOARD - FILTER THEO NGÀY/THÁNG/NĂM
    // ==========================================
    @GetMapping("/dashboard/filter")
    public ResponseEntity<?> getDashboardDataFilter(
            @RequestParam(required = false) String day,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String year) {
        
        List<HoaDon> listHoaDon = hoaDonRepo.findAll();
        List<DatTiec> listDatTiec = datTiecRepo.findAll();
        
        LocalDate filterDate = null;
        Integer filterMonth = null;
        Integer filterYear = null;
        LocalDate today = LocalDate.now();
        
        // Parse filter params
        if (year != null && !year.trim().isEmpty()) {
            try {
                filterYear = Integer.parseInt(year.trim());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("loi", "Năm không hợp lệ"));
            }
        } else {
            filterYear = today.getYear(); // Mặc định năm hiện tại
        }
        
        if (month != null && !month.trim().isEmpty()) {
            try {
                filterMonth = Integer.parseInt(month.trim());
                if (filterMonth < 1 || filterMonth > 12) {
                    return ResponseEntity.badRequest().body(Map.of("loi", "Tháng phải từ 1 đến 12"));
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("loi", "Tháng không hợp lệ"));
            }
        }
        
        // Nếu nhập ngày: tháng và năm phải được xác định
        if (day != null && !day.trim().isEmpty()) {
            try {
                int d = Integer.parseInt(day.trim());
                // Nếu không có tháng, dùng tháng hiện tại
                if (filterMonth == null) {
                    filterMonth = today.getMonthValue();
                }
                filterDate = LocalDate.of(filterYear, filterMonth, d);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("loi", "Ngày không hợp lệ"));
            }
        }
        
        // Nếu không có filter nào, trả về error
        if (filterDate == null && filterMonth == null) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Vui lòng chọn ít nhất ngày hoặc tháng"));
        }
        
        // Tính toán doanh thu theo filter
        double doanhThuFilter = 0;
        int soVeBan = 0;
        double doanhThuDoAn = 0;
        int soDonDatTiec = 0;
        int soLuongKhachDatTiec = 0;
        
        DateTimeFormatter fmtNgayDat = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");
        
        // Filter HoaDon
        for (HoaDon hd : listHoaDon) {
            if (hd.getNgayMua() == null) continue;
            
            LocalDate ngayMua = hd.getNgayMua().toLocalDate();
            boolean matchFilter = false;
            
            if (filterDate != null) {
                // Lọc theo ngày cụ thể
                matchFilter = ngayMua.isEqual(filterDate);
            } else if (filterMonth != null) {
                // Lọc theo tháng/năm
                matchFilter = ngayMua.getYear() == filterYear && ngayMua.getMonthValue() == filterMonth;
            } else {
                // Chỉ lọc theo năm
                matchFilter = ngayMua.getYear() == filterYear;
            }
            
            if (matchFilter && isValidRevenue(hd) && hd.getTongTien() != null) {
                doanhThuFilter += hd.getTongTien();
                String loaiGiaoDich = hd.getLoaiGiaoDich() != null ? hd.getLoaiGiaoDich().toUpperCase() : "";
                if (loaiGiaoDich.contains("AN_UONG")) {
                    doanhThuDoAn += hd.getTongTien();
                } else {
                    soVeBan += (hd.getSoLuong() != null && hd.getSoLuong() > 0) ? hd.getSoLuong() : 1;
                }
            }
        }
        
        // Filter DatTiec
        for (DatTiec dt : listDatTiec) {
            if (dt.getNgayDat() == null || dt.getNgayDat().trim().isEmpty()) continue;
            
            try {
                LocalDateTime ngayDatTime = LocalDateTime.parse(dt.getNgayDat(), fmtNgayDat);
                LocalDate ngayDat = ngayDatTime.toLocalDate();
                boolean matchFilter = false;
                
                if (filterDate != null) {
                    // Lọc theo ngày cụ thể
                    matchFilter = ngayDat.isEqual(filterDate);
                } else if (filterMonth != null) {
                    // Lọc theo tháng/năm
                    matchFilter = ngayDat.getYear() == filterYear && ngayDat.getMonthValue() == filterMonth;
                } else {
                    // Chỉ lọc theo năm
                    matchFilter = ngayDat.getYear() == filterYear;
                }
                
                if (matchFilter) {
                    soDonDatTiec += 1;
                    soLuongKhachDatTiec += dt.getSoLuongKhach() != null ? dt.getSoLuongKhach() : 0;
                }
            } catch (Exception e) {
                // Skip nếu parse lỗi
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("doanhThuFilter", doanhThuFilter);
        response.put("soVeBan", soVeBan);
        response.put("doanhThuDoAn", doanhThuDoAn);
        response.put("soDonDatTiec", soDonDatTiec);
        response.put("soLuongKhachDatTiec", soLuongKhachDatTiec);
        
        String filterDesc = "";
        if (filterDate != null) {
            filterDesc = "Ngày " + filterDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } else if (filterMonth != null && filterYear != null) {
            filterDesc = "Tháng " + filterMonth + "/" + filterYear;
        } else if (filterYear != null) {
            filterDesc = "Năm " + filterYear;
        }
        response.put("filterDesc", filterDesc);
        
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 1c. API DỰ ĐOÁN LƯỢNG KHÁCH NGÀY HÔM SAU (AI FORECAST)
    // ==========================================
    @GetMapping("/dashboard/forecast/next-day")
    public ResponseEntity<?> forecastNextDay() {
        try {
            Map<String, Object> forecast = guestForecastService.forecastNextDay();
            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("loi", "Lỗi dự đoán: " + e.getMessage()));
        }
    }

    // ==========================================
    // 1d. API DỰ ĐOÁN LƯỢNG KHÁCH CẢ TUẦN TỚI
    // ==========================================
    @GetMapping("/dashboard/forecast/week")
    public ResponseEntity<?> forecastWeek() {
        try {
            Map<String, Object> forecast = guestForecastService.forecastWeek();
            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("loi", "Lỗi dự đoán tuần: " + e.getMessage()));
        }
    }

    // ==========================================
    // 2. API QUẢN LÝ HÓA ĐƠN TỔNG
    // ==========================================
    @GetMapping("/hoa-don")
    public ResponseEntity<?> layTatCaHoaDon() {
        List<HoaDon> danhSach = hoaDonRepo.findAll();
        // Sắp xếp hóa đơn mới nhất lên đầu
        danhSach.sort((a, b) -> b.getId().compareTo(a.getId()));
        return ResponseEntity.ok(danhSach);
    }

    // ==========================================
    // API QUẢN LÝ VOUCHER CHO ADMIN
    // ==========================================
    @GetMapping("/voucher")
    public ResponseEntity<?> layTatCaVoucher() {
        List<UuDai> danhSach = uuDaiRepo.findAll();
        return ResponseEntity.ok(danhSach);
    }

    @PostMapping("/voucher")
    public ResponseEntity<?> themVoucher(@RequestBody UuDai uuDai) {
        try {
            uuDaiRepo.save(uuDai);
            return ResponseEntity.ok(Map.of("message", "Thêm voucher thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Lỗi: " + e.getMessage()));
        }
    }

    @PutMapping("/voucher/{id}")
    public ResponseEntity<?> capNhatVoucher(@PathVariable Integer id, @RequestBody UuDai uuDai) {
        return uuDaiRepo.findById(id)
                .map(existing -> {
                    existing.setMaCode(uuDai.getMaCode());
                    existing.setTenUuDai(uuDai.getTenUuDai());
                    existing.setPhanTramGiam(uuDai.getPhanTramGiam());
                    existing.setNgayKetThuc(uuDai.getNgayKetThuc());
                    existing.setTrangThai(uuDai.getTrangThai());
                    uuDaiRepo.save(existing);
                    return ResponseEntity.ok(Map.of("message", "Cập nhật voucher thành công"));
                })
                .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("loi", "Không tìm thấy voucher")));
    }

    @DeleteMapping("/voucher/{id}")
    public ResponseEntity<?> xoaVoucher(@PathVariable Integer id) {
        try {
            uuDaiRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Xóa voucher thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Không thể xóa voucher: " + e.getMessage()));
        }
    }

    // ==========================================
    // 2B. QUẢN LÝ GIÁ VÉ
    // ==========================================

    @GetMapping("/gia-ve")
    public ResponseEntity<?> layGiaVe() {
        return ResponseEntity.ok(layOrTaoGiaVeMacDinh());
    }

    @PutMapping("/gia-ve")
    public ResponseEntity<?> capNhatGiaVe(@RequestBody GiaVe giaVe) {
        GiaVe hienTai = layOrTaoGiaVeMacDinh();
        hienTai.setGiaCombo(giaVe.getGiaCombo());
        hienTai.setPhuThuComboCuoiTuan(giaVe.getPhuThuComboCuoiTuan());
        hienTai.setGiaNguoiLon(giaVe.getGiaNguoiLon());
        giaVeRepo.save(hienTai);
        return ResponseEntity.ok(Map.of("message", "Cập nhật giá vé thành công"));
    }

    private GiaVe layOrTaoGiaVeMacDinh() {
        GiaVe giaVe = giaVeRepo.findFirstByOrderByIdAsc();
        if (giaVe != null) {
            return giaVe;
        }

        GiaVe macDinh = new GiaVe();
        macDinh.setGiaCombo(100000L);
        macDinh.setPhuThuComboCuoiTuan(20000L);
        macDinh.setGiaNguoiLon(20000L);
        return giaVeRepo.save(macDinh);
    }

    @Autowired 
    private MonAnRepository monAnRepo; // Gọi đúng Repository của đồ ăn/nước uống

    // ==========================================
    // 3. QUẢN LÝ MÓN ĂN / NƯỚC UỐNG (CRUD)
    // ==========================================
    
    // Lấy danh sách
    @GetMapping("/mon-an")
    public ResponseEntity<?> layTatCaMonAn() {
        return ResponseEntity.ok(monAnRepo.findAll());
    }

    // Thêm món mới
    @PostMapping("/mon-an")
    public ResponseEntity<?> themMonAn(@RequestBody MonAn monAn) {
        try {
            monAnRepo.save(monAn);
            return ResponseEntity.ok(Map.of("message", "Thêm món ăn thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Lỗi: " + e.getMessage()));
        }
    }

    // Sửa món ăn
    @PutMapping("/mon-an/{id}")
    public ResponseEntity<?> capNhatMonAn(@PathVariable Long id, @RequestBody MonAn monAnDetails) {
        try {
            // Spring Boot tự động map dữ liệu, mình chỉ cần ép lại đúng ID rồi lưu là nó sẽ Update
            monAnDetails.setId(id); // (Lưu ý: Nếu file MonAn.java dùng int thay vì Long, hãy đổi Long id thành int id nhé)
            monAnRepo.save(monAnDetails);
            return ResponseEntity.ok(Map.of("message", "Cập nhật thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Lỗi: " + e.getMessage()));
        }
    }

    // Xóa món ăn
    @DeleteMapping("/mon-an/{id}")
    public ResponseEntity<?> xoaMonAn(@PathVariable Long id) {
        try {
            monAnRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Xóa thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Không thể xóa món này do đã có trong hóa đơn!"));
        }
    }


    // ==========================================
    // 4. HỦY HÓA ĐƠN
    // ==========================================
    @PutMapping("/hoa-don/{id}/huy")
    public ResponseEntity<?> huyHoaDon(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        String lyDo = payload != null ? payload.getOrDefault("lyDo", "") : "";
        return hoaDonRepo.findById(id)
                .map(hd -> {
                    hd.setTrangThai("Đã hủy");
                    hoaDonRepo.save(hd);
                    if (!lyDo.isBlank()) {
                        System.out.println("Lý do hủy hóa đơn #" + id + ": " + lyDo);
                    }
                    return ResponseEntity.ok(Map.of("message", "Hủy hóa đơn thành công"));
                })
                .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("loi", "Không tìm thấy hóa đơn")));
    }

    // ==========================================
    // 5. QUẢN LÝ NGƯỜI DÙNG
    // ==========================================
    @GetMapping("/nguoi-dung")
    public ResponseEntity<?> layTatCaNguoiDung() {
        List<NguoiDung> danhSach = nguoiDungRepo.findAll();
        danhSach.sort((a, b) -> b.getMaNguoiDung().compareTo(a.getMaNguoiDung()));
        return ResponseEntity.ok(danhSach);
    }

    @PostMapping("/nguoi-dung")
    public ResponseEntity<?> themNguoiDung(@RequestBody NguoiDung nguoiDung) {
        try {
            // Kiểm tra tên đăng nhập đã tồn tại chưa
            if (nguoiDung.getTenDangNhap() == null || nguoiDung.getTenDangNhap().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("loi", "Tên đăng nhập không được để trống"));
            }

            // Kiểm tra email đã tồn tại chưa (nếu có)
            if (nguoiDung.getEmail() != null && !nguoiDung.getEmail().isBlank()) {
                boolean emailTonTai = nguoiDungRepo.findAll().stream()
                    .anyMatch(nd -> nguoiDung.getEmail().equals(nd.getEmail()));
                if (emailTonTai) {
                    return ResponseEntity.badRequest().body(Map.of("loi", "Email đã được sử dụng"));
                }
            }

            // Thiết lập giá trị mặc định
            if (nguoiDung.getDanhSachVaiTro() == null || nguoiDung.getDanhSachVaiTro().isBlank()) {
                nguoiDung.setDanhSachVaiTro("USER");
            }
            if (nguoiDung.getHangThanhVien() == null || nguoiDung.getHangThanhVien().isBlank()) {
                nguoiDung.setHangThanhVien("Thường");
            }

            nguoiDungRepo.save(nguoiDung);
            return ResponseEntity.ok(Map.of("message", "Thêm người dùng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Lỗi: " + e.getMessage()));
        }
    }

    @PutMapping("/nguoi-dung/{id}")
    public ResponseEntity<?> capNhatNguoiDung(@PathVariable Long id, @RequestBody NguoiDung nguoiDung) {
        return nguoiDungRepo.findById(id)
                .map(nd -> {
                    if (nguoiDung.getHoTen() != null && !nguoiDung.getHoTen().isBlank()) {
                        nd.setHoTen(nguoiDung.getHoTen());
                    }
                    if (nguoiDung.getEmail() != null) {
                        nd.setEmail(nguoiDung.getEmail());
                    }
                    if (nguoiDung.getSoDienThoai() != null) {
                        nd.setSoDienThoai(nguoiDung.getSoDienThoai());
                    }
                    if (nguoiDung.getDanhSachVaiTro() != null) {
                        nd.setDanhSachVaiTro(nguoiDung.getDanhSachVaiTro());
                    }
                    if (nguoiDung.getHangThanhVien() != null) {
                        nd.setHangThanhVien(nguoiDung.getHangThanhVien());
                    }
                    nguoiDungRepo.save(nd);
                    return ResponseEntity.ok(Map.of("message", "Cập nhật người dùng thành công"));
                })
                .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("loi", "Không tìm thấy người dùng")));
    }

    @DeleteMapping("/nguoi-dung/{id}")
    public ResponseEntity<?> xoaNguoiDung(@PathVariable Long id) {
        return nguoiDungRepo.findById(id)
                .map(nd -> {
                    nguoiDungRepo.deleteById(id);
                    return ResponseEntity.ok(Map.of("message", "Xóa người dùng thành công"));
                })
                .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("loi", "Không tìm thấy người dùng")));
    }

    // ==========================================
    // 6. QUẢN LÝ ĐẶT TIỆC (GÓI TIỆC + ĐƠN ĐẶT)
    // ==========================================
    @GetMapping("/tiec/goi-tiec")
    public ResponseEntity<?> layTatCaGoiTiec() {
        List<GoiTiec> danhSach = goiTiecRepo.findAll();
        danhSach.sort((a, b) -> b.getId().compareTo(a.getId()));
        return ResponseEntity.ok(danhSach);
    }

    @PostMapping("/tiec/goi-tiec")
    public ResponseEntity<?> themGoiTiec(@RequestBody GoiTiec goiTiec) {
        try {
            if (goiTiec.getTenGoi() == null || goiTiec.getTenGoi().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("loi", "Tên gói không được để trống"));
            }
            if (goiTiec.getGia() < 0) {
                return ResponseEntity.badRequest().body(Map.of("loi", "Giá gói không hợp lệ"));
            }

            goiTiecRepo.save(goiTiec);
            return ResponseEntity.ok(Map.of("message", "Thêm gói tiệc thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Lỗi: " + e.getMessage()));
        }
    }

    @PutMapping("/tiec/goi-tiec/{id}")
    public ResponseEntity<?> capNhatGoiTiec(@PathVariable Long id, @RequestBody GoiTiec goiTiec) {
        return goiTiecRepo.findById(id)
                .map(existing -> {
                    if (goiTiec.getTenGoi() != null && !goiTiec.getTenGoi().isBlank()) {
                        existing.setTenGoi(goiTiec.getTenGoi());
                    }
                    if (goiTiec.getGia() >= 0) {
                        existing.setGia(goiTiec.getGia());
                    }
                    if (goiTiec.getMoTa() != null) {
                        existing.setMoTa(goiTiec.getMoTa());
                    }
                    goiTiecRepo.save(existing);
                    return ResponseEntity.ok(Map.of("message", "Cập nhật gói tiệc thành công"));
                })
                .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("loi", "Không tìm thấy gói tiệc")));
    }

    @DeleteMapping("/tiec/goi-tiec/{id}")
    public ResponseEntity<?> xoaGoiTiec(@PathVariable Long id) {
        return goiTiecRepo.findById(id)
                .map(goi -> {
                    goiTiecRepo.deleteById(id);
                    return ResponseEntity.ok(Map.of("message", "Xóa gói tiệc thành công"));
                })
                .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("loi", "Không tìm thấy gói tiệc")));
    }

    @GetMapping("/tiec/don-dat")
    public ResponseEntity<?> layTatCaDonDatTiec() {
        List<DatTiec> danhSach = datTiecRepo.findAll();
        danhSach.sort((a, b) -> b.getId().compareTo(a.getId()));
        return ResponseEntity.ok(danhSach);
    }

    @PutMapping("/tiec/don-dat/{id}/trang-thai")
    public ResponseEntity<?> capNhatTrangThaiDonDat(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String trangThaiNhapVao = payload != null ? payload.getOrDefault("trangThai", "").trim() : "";
        String trangThaiMoi = chuanHoaTrangThaiDonDat(trangThaiNhapVao);
        if (trangThaiMoi.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("loi", "Trạng thái không được để trống"));
        }

        return datTiecRepo.findById(id)
                .map(don -> {
                    String trangThaiCu = don.getTrangThai();
                    don.setTrangThai(trangThaiMoi);
                    datTiecRepo.save(don);

                    if (!trangThaiMoi.equalsIgnoreCase(trangThaiCu) && "Đã xác nhận".equalsIgnoreCase(trangThaiMoi)) {
                        guiEmailXacNhanDatTiec(don);
                    }

                    return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công"));
                })
                .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("loi", "Không tìm thấy đơn đặt")));
    }

    private String chuanHoaTrangThaiDonDat(String trangThai) {
        if (trangThai == null) {
            return "";
        }

        String giaTri = trangThai.trim();
        String thuong = giaTri.toUpperCase();

        switch (thuong) {
            case "CHO_XU_LY":
            case "ĐANG CHỜ XỬ LÝ":
                return "Đang chờ xử lý";
            case "DA_XAC_NHAN":
            case "ĐÃ XÁC NHẬN":
                return "Đã xác nhận";
            case "HOAN_THANH":
            case "HOÀN THÀNH":
                return "Hoàn thành";
            case "DA_HUY":
            case "ĐÃ HỦY":
            case "ĐÃ HUỶ":
                return "Đã hủy";
            default:
                return giaTri;
        }
    }

    private void guiEmailXacNhanDatTiec(DatTiec don) {
        try {
            if (don == null || don.getTenTaiKhoan() == null || don.getTenTaiKhoan().isBlank()) {
                return;
            }

            NguoiDung nguoiDung = nguoiDungRepo.findByTenDangNhapOrEmail(don.getTenTaiKhoan(), don.getTenTaiKhoan()).orElse(null);
            if (nguoiDung == null || nguoiDung.getEmail() == null || nguoiDung.getEmail().isBlank()) {
                return;
            }

            dichVuEmail.guiEmailXacNhanDatTiec(
                    nguoiDung.getEmail(),
                    don.getId(),
                    don.getTrungTam(),
                    don.getNgayToChuc(),
                    don.getSoLuongKhach()
            );
        } catch (Exception e) {
            System.out.println("Không gửi được email xác nhận đặt tiệc: " + e.getMessage());
        }
    }
}
package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.DatTiec;
import com.example.playgroundapi.entity.GoiTiec;
import com.example.playgroundapi.repository.DatTiecRepository;
import com.example.playgroundapi.repository.GoiTiecRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dat-tiec")
@CrossOrigin(origins = "*") // Mở CORS để Frontend React ở localhost:3000 gọi được
public class DatTiecRestController {

    @Autowired
    private DatTiecRepository datTiecRepository;

    @Autowired
    private GoiTiecRepository goiTiecRepository;

    // 1. API Lấy danh sách các gói tiệc (để đổ ra giao diện)
    @GetMapping("/goi-tiec")
    public ResponseEntity<List<GoiTiec>> getDanhSachGoiTiec() {
        List<GoiTiec> danhSachGoi = goiTiecRepository.findAll();
        danhSachGoi.sort((a, b) -> b.getId().compareTo(a.getId()));
        return ResponseEntity.ok(danhSachGoi);
    }

    // 2. API Xử lý khi khách hàng bấm nút "XÁC NHẬN ĐẶT TIỆC"
    @PostMapping("/dat")
    public ResponseEntity<String> datTiecSinhNhat(@RequestBody Map<String, Object> thongTinDat) {
        try {
            // Khởi tạo đối tượng Entity
            DatTiec dt = new DatTiec();
            
            // Map dữ liệu từ form React sang các cột của Entity
            // Lưu ý: Dùng .toString() và parse kiểu cho chuẩn
            String tenTaiKhoan = thongTinDat.getOrDefault("tenTaiKhoan", "").toString().trim();
            if (tenTaiKhoan.isEmpty()) {
                tenTaiKhoan = thongTinDat.getOrDefault("hoTen", "").toString().trim();
            }
            dt.setTenTaiKhoan(tenTaiKhoan);
            dt.setTrungTam(thongTinDat.getOrDefault("goiTiec", "").toString());  
            
            // Gộp ngày diễn ra và giờ đến thành 1 chuỗi để lưu vào DB
            String ngay = thongTinDat.getOrDefault("ngayDienRa", "").toString();
            String gio = thongTinDat.getOrDefault("gioDen", "").toString();
            dt.setNgayToChuc(ngay + " " + gio);
            
            dt.setSoLuongKhach(Integer.parseInt(thongTinDat.getOrDefault("soKhach", "1").toString()));
            dt.setYeuCauThem(thongTinDat.getOrDefault("ghiChu", "").toString());
            dt.setSoDienThoai(thongTinDat.getOrDefault("sdt", "").toString());
            
            // Tự động lấy giờ hiện tại làm ngày đặt
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");
            dt.setNgayDat(LocalDateTime.now().format(formatter));
            
            dt.setTrangThai("Đang chờ xử lý");

            // LƯU VÀO DATABASE
            datTiecRepository.save(dt);

            return ResponseEntity.ok("Gửi yêu cầu đặt tiệc thành công! Quản lý sẽ sớm liên hệ xác nhận với bạn.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi khi lưu thông tin đặt tiệc: " + e.getMessage());
        }
    }
}
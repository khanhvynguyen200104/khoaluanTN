package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.NguoiDung;
import com.example.playgroundapi.repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ho-so")
@CrossOrigin(origins = "*")
public class HoSoRestController {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @PostMapping("/cap-nhat")
    public ResponseEntity<?> capNhatHoSo(@RequestBody NguoiDung nguoiDungTuReact) {
        try {
            NguoiDung userInDb = nguoiDungRepository
                    .findById(nguoiDungTuReact.getMaNguoiDung())
                    .orElse(null);

            if (userInDb != null) {
                // Cập nhật tất cả các trường được phép
                userInDb.setTenDangNhap(nguoiDungTuReact.getTenDangNhap());
                userInDb.setHoTen(nguoiDungTuReact.getHoTen());
                userInDb.setSoDienThoai(nguoiDungTuReact.getSoDienThoai());
                userInDb.setEmail(nguoiDungTuReact.getEmail()); // Cập nhật cả Email

                nguoiDungRepository.save(userInDb);

                // Che mật khẩu trước khi trả về React
                userInDb.setMatKhau(null);
                return ResponseEntity.ok(userInDb);
            }

            return ResponseEntity.badRequest().body("Không tìm thấy người dùng!");
        } catch (Exception e) {
            // Nếu lưu database bị lỗi (ví dụ: Tên đăng nhập hoặc Email đã có người khác dùng)
            return ResponseEntity.badRequest().body("Tên đăng nhập hoặc Email này đã được sử dụng. Vui lòng chọn tên khác!");
        }
    }
}
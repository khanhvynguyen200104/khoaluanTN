package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.GiaVe;
import com.example.playgroundapi.repository.GiaVeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gia-ve")
@CrossOrigin(origins = "*")
public class GiaVeRestController {

    @Autowired
    private GiaVeRepository giaVeRepository;

    @GetMapping
    public ResponseEntity<?> layGiaVeHienTai() {
        return ResponseEntity.ok(layOrTaoGiaVeMacDinh());
    }

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
}
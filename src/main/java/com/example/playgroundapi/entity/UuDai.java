package com.example.playgroundapi.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "uu_dai")
public class UuDai {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_code", unique = true, nullable = false)
    private String maCode;

    @Column(name = "ten_uu_dai", nullable = false)
    private String tenUuDai;

    @Column(name = "phan_tram_giam", nullable = false)
    private Integer phanTramGiam;

    @Column(name = "ngay_ket_thuc")
    private LocalDate ngayKetThuc;

    // THÊM MỚI CỘT TRẠNG THÁI
    @Column(name = "trang_thai")
    private String trangThai = "DANG_HOAT_DONG";

    // --- Getters và Setters ---
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMaCode() {
        return maCode;
    }

    public void setMaCode(String maCode) {
        this.maCode = maCode;
    }

    public String getTenUuDai() {
        return tenUuDai;
    }

    public void setTenUuDai(String tenUuDai) {
        this.tenUuDai = tenUuDai;
    }

    public Integer getPhanTramGiam() {
        return phanTramGiam;
    }

    public void setPhanTramGiam(Integer phanTramGiam) {
        this.phanTramGiam = phanTramGiam;
    }

    public LocalDate getNgayKetThuc() {
        return ngayKetThuc;
    }

    public void setNgayKetThuc(LocalDate ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }

    // Getter và Setter cho trangThai
    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}
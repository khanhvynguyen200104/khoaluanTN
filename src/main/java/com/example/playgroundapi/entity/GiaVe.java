package com.example.playgroundapi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "gia_ve")
public class GiaVe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "gia_combo")
    private long giaCombo;

    @Column(name = "phu_thu_combo_cuoi_tuan")
    private long phuThuComboCuoiTuan;

    @Column(name = "gia_nguoi_lon")
    private long giaNguoiLon;

    public GiaVe() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public long getGiaCombo() {
        return giaCombo;
    }

    public void setGiaCombo(long giaCombo) {
        this.giaCombo = giaCombo;
    }

    public long getPhuThuComboCuoiTuan() {
        return phuThuComboCuoiTuan;
    }

    public void setPhuThuComboCuoiTuan(long phuThuComboCuoiTuan) {
        this.phuThuComboCuoiTuan = phuThuComboCuoiTuan;
    }

    public long getGiaNguoiLon() {
        return giaNguoiLon;
    }

    public void setGiaNguoiLon(long giaNguoiLon) {
        this.giaNguoiLon = giaNguoiLon;
    }
}
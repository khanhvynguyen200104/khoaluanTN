package com.example.playgroundapi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "dat_tiec")
public class DatTiec {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tenTaiKhoan;
    private String trungTam;
    private String ngayToChuc;
    private Integer soLuongKhach;
    private String yeuCauThem;
    private String soDienThoai;
    private String ngayDat;
    private String trangThai = "Đang chờ xử lý"; 

    // 1. Constructor rỗng (Bắt buộc cho JPA)
    public DatTiec() {
    }

    // 2. Constructor đầy đủ (Để dùng trong Controller)
    public DatTiec(String tenTaiKhoan, String trungTam, String ngayToChuc, Integer soLuongKhach, String yeuCauThem, String soDienThoai, String ngayDat, String trangThai) {
        this.tenTaiKhoan = tenTaiKhoan;
        this.trungTam = trungTam;
        this.ngayToChuc = ngayToChuc;
        this.soLuongKhach = soLuongKhach;
        this.yeuCauThem = yeuCauThem;
        this.soDienThoai = soDienThoai;
        this.ngayDat = ngayDat;
        this.trangThai = trangThai;
    }

    // Getters and Setters (Nhớ generate đầy đủ)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTenTaiKhoan() { return tenTaiKhoan; }
    public void setTenTaiKhoan(String tenTaiKhoan) { this.tenTaiKhoan = tenTaiKhoan; }
    public String getTrungTam() { return trungTam; }
    public void setTrungTam(String trungTam) { this.trungTam = trungTam; }
    public String getNgayToChuc() { return ngayToChuc; }
    public void setNgayToChuc(String ngayToChuc) { this.ngayToChuc = ngayToChuc; }
    public Integer getSoLuongKhach() { return soLuongKhach; }
    public void setSoLuongKhach(Integer soLuongKhach) { this.soLuongKhach = soLuongKhach; }
    public String getYeuCauThem() { return yeuCauThem; }
    public void setYeuCauThem(String yeuCauThem) { this.yeuCauThem = yeuCauThem; }
    public String getSoDienThoai() { return soDienThoai; }
    public void setSoDienThoai(String soDienThoai) { this.soDienThoai = soDienThoai; }
    public String getNgayDat() { return ngayDat; }
    public void setNgayDat(String ngayDat) { this.ngayDat = ngayDat; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
}
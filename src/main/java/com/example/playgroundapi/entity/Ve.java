package com.example.playgroundapi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ve")
public class Ve {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tenTaiKhoan;
    private String ngaySuDung;
    private String loaiVe;
    private int soLuong;
    private long tongTien;
    private String ngayDat;
    
    // THÊM CỘT NÀY
    private String trangThai; 

    public Ve() {}

    // Cập nhật Constructor có thêm trangThai
    public Ve(String tenTaiKhoan, String ngaySuDung, String loaiVe, int soLuong, long tongTien, String ngayDat, String trangThai) {
        this.tenTaiKhoan = tenTaiKhoan;
        this.ngaySuDung = ngaySuDung;
        this.loaiVe = loaiVe;
        this.soLuong = soLuong;
        this.tongTien = tongTien;
        this.ngayDat = ngayDat;
        this.trangThai = trangThai; // Lưu trạng thái
    }

    // Getter và Setter cho các trường cũ (giữ nguyên)...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTenTaiKhoan() { return tenTaiKhoan; }
    public void setTenTaiKhoan(String tenTaiKhoan) { this.tenTaiKhoan = tenTaiKhoan; }
    public String getNgaySuDung() { return ngaySuDung; }
    public void setNgaySuDung(String ngaySuDung) { this.ngaySuDung = ngaySuDung; }
    public String getLoaiVe() { return loaiVe; }
    public void setLoaiVe(String loaiVe) { this.loaiVe = loaiVe; }
    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }
    public long getTongTien() { return tongTien; }
    public void setTongTien(long tongTien) { this.tongTien = tongTien; }
    public String getNgayDat() { return ngayDat; }
    public void setNgayDat(String ngayDat) { this.ngayDat = ngayDat; }

    // Getter Setter cho trangThai
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
}
package com.example.playgroundapi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "don_hang")
public class DonHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String tenTaiKhoan;
    private String tenSanPham;
    private Double giaTien;
    private Integer soLuong;
    private String hinhAnh;
    private String ngayMua;
    private String trangThai;
    private String maHoaDon; // Trường mới để gộp hóa đơn

    public DonHang() {}

    // Getter và Setter cho tất cả các trường (bao gồm maHoaDon)
    public String getMaHoaDon() { return maHoaDon; }
    public void setMaHoaDon(String maHoaDon) { this.maHoaDon = maHoaDon; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTenTaiKhoan() { return tenTaiKhoan; }
    public void setTenTaiKhoan(String tenTaiKhoan) { this.tenTaiKhoan = tenTaiKhoan; }
    public String getTenSanPham() { return tenSanPham; }
    public void setTenSanPham(String tenSanPham) { this.tenSanPham = tenSanPham; }
    public double getGiaTien() { return giaTien; }
    public void setGiaTien(Double gia) { this.giaTien = gia; }
    public Integer getSoLuong() { return soLuong; }
    public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }
    public String getHinhAnh() { return hinhAnh; }
    public void setHinhAnh(String hinhAnh) { this.hinhAnh = hinhAnh; }
    public String getNgayMua() { return ngayMua; }
    public void setNgayMua(String ngayMua) { this.ngayMua = ngayMua; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
}
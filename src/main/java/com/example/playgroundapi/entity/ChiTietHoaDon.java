package com.example.playgroundapi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "chi_tiet_hoa_don")
public class ChiTietHoaDon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hoa_don_id")
    private Long hoaDonId; // ID của hóa đơn cha

    @Column(name = "ten_san_pham")
    private String tenSanPham;

    private Double gia;
    private int soLuong;

    @Column(name = "hinh_anh")
    private String hinhAnh;

    // Constructors
    public ChiTietHoaDon() {}
    public ChiTietHoaDon(Long hoaDonId, String tenSanPham, Double gia, int soLuong, String hinhAnh) {
        this.hoaDonId = hoaDonId;
        this.tenSanPham = tenSanPham;
        this.gia = gia;
        this.soLuong = soLuong;
        this.hinhAnh = hinhAnh;
    }

    // Getters and Setters (Bạn tự generate nhé, mình viết tắt cho gọn)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getHoaDonId() { return hoaDonId; }
    public void setHoaDonId(Long hoaDonId) { this.hoaDonId = hoaDonId; }
    public String getTenSanPham() { return tenSanPham; }
    public void setTenSanPham(String tenSanPham) { this.tenSanPham = tenSanPham; }
    public Double getGia() { return gia; }
    public void setGia(Double gia) { this.gia = gia; }
    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }
    public String getHinhAnh() { return hinhAnh; }
    public void setHinhAnh(String hinhAnh) { this.hinhAnh = hinhAnh; }
}
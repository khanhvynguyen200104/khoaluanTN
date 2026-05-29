package com.example.playgroundapi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lich_su_mua_hang")
public class LichSu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String tenSanPham;
    private Double gia;
    private Integer soLuong;
    private String hinhAnh;
    private String loaiGiaoDich; // "VE", "DAT_TIEC", "AN_UONG", "DO_CHOI"
    
    private String trangThai; // <--- THÊM CỘT NÀY (Đang xử lý / Thành công)

    @Column(name = "ngay_mua")
    private LocalDateTime ngayMua = LocalDateTime.now();

    // Getters và Setters mới
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    // Các Getters/Setters cũ giữ nguyên
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTenSanPham() { return tenSanPham; }
    public void setTenSanPham(String tenSanPham) { this.tenSanPham = tenSanPham; }
    public Double getGia() { return gia; }
    public void setGia(Double gia) { this.gia = gia; }
    public Integer getSoLuong() { return soLuong; }
    public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }
    public String getHinhAnh() { return hinhAnh; }
    public void setHinhAnh(String hinhAnh) { this.hinhAnh = hinhAnh; }
    public String getLoaiGiaoDich() { return loaiGiaoDich; }
    public void setLoaiGiaoDich(String loaiGiaoDich) { this.loaiGiaoDich = loaiGiaoDich; }
    public LocalDateTime getNgayMua() { return ngayMua; }
    public void setNgayMua(LocalDateTime ngayMua) { this.ngayMua = ngayMua; }
}
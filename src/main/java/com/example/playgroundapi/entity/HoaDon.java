package com.example.playgroundapi.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "hoa_don")
public class HoaDon {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nguoi_mua")
    private String nguoiMua;

    @Column(name = "ngay_mua")
    private LocalDateTime ngayMua;

    @Column(name = "gio_khach_ve")
    private LocalDateTime gioKhachVe;

    @Column(name = "thanh_tien")
    private Double tongTien;

    @Column(name = "trang_thai")
    private String trangThai; 
    
    @Column(name = "loai_giao_dich")
    private String loaiGiaoDich;

    @Column(name = "ma_ve")
    private String maVe; 

    @Column(name = "loai_ve")
    private String loaiVe; 

    @Column(name = "so_luong")
    private Integer soLuong;

    @Column(name = "ngay_su_dung")
    private LocalDate ngaySuDung;

    @Column(name = "phuong_thuc_thanh_toan")
    private String phuongThucThanhToan;

    // --- 2 CỘT MỚI THÊM CHO VÒNG TAY & SĐT KHÁCH ---
    @Column(name = "ma_vong_tay")
    private String maVongTay;

    @Column(name = "so_dien_thoai_khach")
    private String soDienThoaiKhach;

    // ==========================================
    // --- GETTER & SETTER ---
    // ==========================================
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNguoiMua() { return nguoiMua; }
    public void setNguoiMua(String nguoiMua) { this.nguoiMua = nguoiMua; }
    
    public LocalDateTime getNgayMua() { return ngayMua; }
    public void setNgayMua(LocalDateTime ngayMua) { this.ngayMua = ngayMua; }
    
    public LocalDateTime getGioKhachVe() { return gioKhachVe; }
    public void setGioKhachVe(LocalDateTime gioKhachVe) { this.gioKhachVe = gioKhachVe; }
    
    public Double getTongTien() { return tongTien; }
    public void setTongTien(Double tongTien) { this.tongTien = tongTien; }
    
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
    
    public String getLoaiGiaoDich() { return loaiGiaoDich; }
    public void setLoaiGiaoDich(String loaiGiaoDich) { this.loaiGiaoDich = loaiGiaoDich; }

    public String getMaVe() { return maVe; }
    public void setMaVe(String maVe) { this.maVe = maVe; }
    
    public String getLoaiVe() { return loaiVe; }
    public void setLoaiVe(String loaiVe) { this.loaiVe = loaiVe; }
    
    public Integer getSoLuong() { return soLuong; }
    public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }
    
    public LocalDate getNgaySuDung() { return ngaySuDung; }
    public void setNgaySuDung(LocalDate ngaySuDung) { this.ngaySuDung = ngaySuDung; }

    public String getPhuongThucThanhToan() { return phuongThucThanhToan; }
    public void setPhuongThucThanhToan(String phuongThucThanhToan) { this.phuongThucThanhToan = phuongThucThanhToan; }

    // Getter & Setter cho 2 cột mới
    public String getMaVongTay() { return maVongTay; }
    public void setMaVongTay(String maVongTay) { this.maVongTay = maVongTay; }

    public String getSoDienThoaiKhach() { return soDienThoaiKhach; }
    public void setSoDienThoaiKhach(String soDienThoaiKhach) { this.soDienThoaiKhach = soDienThoaiKhach; }
}
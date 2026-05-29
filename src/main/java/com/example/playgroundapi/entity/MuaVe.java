package com.example.playgroundapi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "mua_ve")
public class MuaVe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tenTaiKhoan;
    private String loaiVe;      // Ví dụ: tre-em, nguoi-lon
    private String ngaySuDung;
    private int soLuong;
    private int tongTien;
    private String ngayDat;
    private String trangThai;   // Ví dụ: Đang xử lý, Thành công

    // BỔ SUNG TRƯỜNG NÀY ĐỂ LƯU MÃ VÉ VÀO DATABASE
    @Column(name = "ma_ve")
    private String maVe; 

    @Column(name = "so_dien_thoai_khach")
    private String soDienThoaiKhach;

    // --- ĐÃ BỔ SUNG: TRƯỜNG NÀY ĐỂ FIX LỖI SQL SERVER BÁO NULL ---
    @Column(name = "gia_tai_thoi_diem_mua")
    private int giaTaiThoiDiemMua;

    public MuaVe() {
    }

    // Đã cập nhật constructor
    public MuaVe(String tenTaiKhoan, String loaiVe, String ngaySuDung, int soLuong, int tongTien, String ngayDat, String trangThai, String maVe, String soDienThoaiKhach, int giaTaiThoiDiemMua) {
        this.tenTaiKhoan = tenTaiKhoan;
        this.loaiVe = loaiVe;
        this.ngaySuDung = ngaySuDung;
        this.soLuong = soLuong;
        this.tongTien = tongTien;
        this.ngayDat = ngayDat;
        this.trangThai = trangThai;
        this.maVe = maVe;
        this.soDienThoaiKhach = soDienThoaiKhach;
        this.giaTaiThoiDiemMua = giaTaiThoiDiemMua;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTenTaiKhoan() { return tenTaiKhoan; }
    public void setTenTaiKhoan(String tenTaiKhoan) { this.tenTaiKhoan = tenTaiKhoan; }
    
    public String getLoaiVe() { return loaiVe; }
    public void setLoaiVe(String loaiVe) { this.loaiVe = loaiVe; }
    
    public String getNgaySuDung() { return ngaySuDung; }
    public void setNgaySuDung(String ngaySuDung) { this.ngaySuDung = ngaySuDung; }
    
    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }
    
    public int getTongTien() { return tongTien; }
    public void setTongTien(int tongTien) { this.tongTien = tongTien; }
    
    public String getNgayDat() { return ngayDat; }
    public void setNgayDat(String ngayDat) { this.ngayDat = ngayDat; }
    
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public String getMaVe() { return maVe; }
    public void setMaVe(String maVe) { this.maVe = maVe; }

    public String getSoDienThoaiKhach() { return soDienThoaiKhach; }
    public void setSoDienThoaiKhach(String soDienThoaiKhach) { this.soDienThoaiKhach = soDienThoaiKhach; }

    // --- GETTER & SETTER CHO GIÁ TẠI THỜI ĐIỂM MUA ---
    public int getGiaTaiThoiDiemMua() { return giaTaiThoiDiemMua; }
    public void setGiaTaiThoiDiemMua(int giaTaiThoiDiemMua) { this.giaTaiThoiDiemMua = giaTaiThoiDiemMua; }
}
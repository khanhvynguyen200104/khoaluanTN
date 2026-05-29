package com.example.playgroundapi.entity;

import java.util.List;

public class ThanhToanRequest {
    private int veCombo;
    private int veNguoiLon;
    private String maGiamGia;
    private double tongThanhToan;
    private String nhanVienThuNgan;
    private String soDienThoaiKhach;
    private String phuongThucThanhToan;

    // 👉 THÊM BIẾN NÀY ĐỂ NHẬN MÃ VÒNG TAY TỪ REACT
    private String maVongTay; 
    private Integer tongSoVe;

    // Biến nhận giỏ hàng từ React
    private List<ChiTietItem> chiTietHoaDon; 

    // --- Class phụ để hứng từng món ---
    public static class ChiTietItem {
        private String loai; // Để phân biệt 'VE' hay 'DO_AN'
        private String id;
        private Integer soLuong;
        public String getLoai() { return loai; }
        public void setLoai(String loai) { this.loai = loai; }
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public Integer getSoLuong() { return soLuong; }
        public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }
    }

    // ==========================================
    // --- GETTER & SETTER ---
    // ==========================================

    public List<ChiTietItem> getChiTietHoaDon() { return chiTietHoaDon; }
    public void setChiTietHoaDon(List<ChiTietItem> chiTietHoaDon) { this.chiTietHoaDon = chiTietHoaDon; }

    public int getVeCombo() { return veCombo; }
    public void setVeCombo(int veCombo) { this.veCombo = veCombo; }

    public int getVeNguoiLon() { return veNguoiLon; }
    public void setVeNguoiLon(int veNguoiLon) { this.veNguoiLon = veNguoiLon; }

    public String getMaGiamGia() { return maGiamGia; }
    public void setMaGiamGia(String maGiamGia) { this.maGiamGia = maGiamGia; }

    public double getTongThanhToan() { return tongThanhToan; }
    public void setTongThanhToan(double tongThanhToan) { this.tongThanhToan = tongThanhToan; }

    public String getNhanVienThuNgan() { return nhanVienThuNgan; }
    public void setNhanVienThuNgan(String nhanVienThuNgan) { this.nhanVienThuNgan = nhanVienThuNgan; }

    public String getPhuongThucThanhToan() { return phuongThucThanhToan; }
    public void setPhuongThucThanhToan(String phuongThucThanhToan) { this.phuongThucThanhToan = phuongThucThanhToan; }

    // 👉 THÊM GETTER & SETTER CHO SỐ ĐIỆN THOẠI KHÁCH
    public String getSoDienThoaiKhach() { return soDienThoaiKhach; }
    public void setSoDienThoaiKhach(String soDienThoaiKhach) { this.soDienThoaiKhach = soDienThoaiKhach; }

    // 👉 THÊM GETTER & SETTER CHO MÃ VÒNG TAY
    public String getMaVongTay() { return maVongTay; }
    public void setMaVongTay(String maVongTay) { this.maVongTay = maVongTay; }

    public Integer getTongSoVe() { return tongSoVe; }
    public void setTongSoVe(Integer tongSoVe) { this.tongSoVe = tongSoVe; }
}
package com.example.playgroundapi.entity;

public class GioHangItem {
    private Long id;
    private String tenSp;
    private Double gia;
    private String hinhAnh;
    private int soLuong;

    public GioHangItem() {}

    public GioHangItem(Long id, String tenSp, Double gia, String hinhAnh, int soLuong) {
        this.id = id;
        this.tenSp = tenSp;
        this.gia = gia;
        this.hinhAnh = hinhAnh;
        this.soLuong = soLuong;
    }

    // Tính thành tiền của món này
    public Double getThanhTien() {
        return gia * soLuong;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTenSp() { return tenSp; }
    public void setTenSp(String tenSp) { this.tenSp = tenSp; }
    public Double getGia() { return gia; }
    public void setGia(Double gia) { this.gia = gia; }
    public String getHinhAnh() { return hinhAnh; }
    public void setHinhAnh(String hinhAnh) { this.hinhAnh = hinhAnh; }
    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }
}
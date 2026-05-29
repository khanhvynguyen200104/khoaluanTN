package com.example.playgroundapi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "mon_an")
public class MonAn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_mon")
    private String tenMon;

    private Double gia;

    @Column(name = "hinh_anh")
    private String hinhAnh;
    
    @Column(name = "so_luong_ton")
    private Integer soLuongTon = 0;

    // Getters và Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTenMon() { return tenMon; }
    public void setTenMon(String tenMon) { this.tenMon = tenMon; }
    public Double getGia() { return gia; }
    public void setGia(Double gia) { this.gia = gia; }
    public String getHinhAnh() { return hinhAnh; }
    public void setHinhAnh(String hinhAnh) { this.hinhAnh = hinhAnh; }
    public Integer getSoLuongTon() { return soLuongTon; }
    public void setSoLuongTon(Integer soLuongTon) { this.soLuongTon = soLuongTon; }
}
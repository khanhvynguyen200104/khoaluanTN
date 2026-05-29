package com.example.playgroundapi.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "uu_dai_nguoi_dung")
public class UuDaiNguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "uu_dai_id")
    private UuDai uuDai;

    @Column(name = "ten_tai_khoan")
    private String tenTaiKhoan;

    @Column(name = "da_su_dung")
    private Boolean daSuDung = false;

    @Column(name = "ngay_luu")
    private LocalDate ngayLuu;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public UuDai getUuDai() {
        return uuDai;
    }

    public void setUuDai(UuDai uuDai) {
        this.uuDai = uuDai;
    }

    public String getTenTaiKhoan() {
        return tenTaiKhoan;
    }

    public void setTenTaiKhoan(String tenTaiKhoan) {
        this.tenTaiKhoan = tenTaiKhoan;
    }

    public Boolean getDaSuDung() {
        return daSuDung;
    }

    public void setDaSuDung(Boolean daSuDung) {
        this.daSuDung = daSuDung;
    }

    public LocalDate getNgayLuu() {
        return ngayLuu;
    }

    public void setNgayLuu(LocalDate ngayLuu) {
        this.ngayLuu = ngayLuu;
    }
}

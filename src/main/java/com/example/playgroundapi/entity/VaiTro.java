package com.example.playgroundapi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vai_tro")
public class VaiTro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String tenVaiTro;

    public VaiTro() {}

    public VaiTro(Long id, String tenVaiTro) {
        this.id = id;
        this.tenVaiTro = tenVaiTro;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTenVaiTro() { return tenVaiTro; }
    public void setTenVaiTro(String tenVaiTro) { this.tenVaiTro = tenVaiTro; }
}
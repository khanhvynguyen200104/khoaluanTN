package com.example.playgroundapi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "quyen_han")
public class QuyenHan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_quyen", unique = true, nullable = false)
    private String tenQuyen;

    @Column(name = "mo_ta")
    private String moTa;

    public QuyenHan() {}

    public QuyenHan(String tenQuyen, String moTa) {
        this.tenQuyen = tenQuyen;
        this.moTa = moTa;
    }

    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getTenQuyen() { 
        return tenQuyen; 
    }
    
    public void setTenQuyen(String tenQuyen) { 
        this.tenQuyen = tenQuyen; 
    }

    public String getMoTa() { 
        return moTa; 
    }
    
    public void setMoTa(String moTa) { 
        this.moTa = moTa; 
    }
}

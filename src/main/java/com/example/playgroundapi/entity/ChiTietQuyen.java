package com.example.playgroundapi.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "chi_tiet_quyen")
public class ChiTietQuyen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vai_tro_id", nullable = false)
    private VaiTro vaiTro;

    @ManyToOne
    @JoinColumn(name = "quyen_han_id", nullable = false)
    private QuyenHan quyenHan;

    public ChiTietQuyen() {}

    public ChiTietQuyen(VaiTro vaiTro, QuyenHan quyenHan) {
        this.vaiTro = vaiTro;
        this.quyenHan = quyenHan;
    }

    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }

    public VaiTro getVaiTro() { 
        return vaiTro; 
    }
    
    public void setVaiTro(VaiTro vaiTro) { 
        this.vaiTro = vaiTro; 
    }

    public QuyenHan getQuyenHan() { 
        return quyenHan; 
    }
    
    public void setQuyenHan(QuyenHan quyenHan) { 
        this.quyenHan = quyenHan; 
    }
}

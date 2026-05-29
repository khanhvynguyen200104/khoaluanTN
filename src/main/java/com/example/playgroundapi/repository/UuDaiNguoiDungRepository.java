package com.example.playgroundapi.repository;

import com.example.playgroundapi.entity.UuDai;
import com.example.playgroundapi.entity.UuDaiNguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UuDaiNguoiDungRepository extends JpaRepository<UuDaiNguoiDung, Integer> {
    List<UuDaiNguoiDung> findByTenTaiKhoan(String tenTaiKhoan);

    Optional<UuDaiNguoiDung> findByTenTaiKhoanAndUuDai(String tenTaiKhoan, UuDai uuDai);
}

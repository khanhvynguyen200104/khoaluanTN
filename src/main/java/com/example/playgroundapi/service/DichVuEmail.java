package com.example.playgroundapi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class DichVuEmail {

    @Autowired
    private JavaMailSender mailSender;

    public void guiEmailOTP(String emailNhan, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailNhan);
        message.setSubject("Mã Xác Nhận Khôi Phục Mật Khẩu - NewWorld");
        message.setText("Mã xác nhận (OTP) của bạn là: " + otp + "\n\nVui lòng không cung cấp mã này cho bất kỳ ai.");
        mailSender.send(message);
    }

    public void guiEmailXacNhanDatTiec(String emailNhan, Long maDon, String tenGoi, String ngayToChuc, Integer soLuongKhach) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailNhan);
        message.setSubject("Xác nhận đặt tiệc - NewWorld");

        String noiDung = "Đơn đặt tiệc của bạn đã được xác nhận.\n\n"
                + "Mã đơn: #" + maDon + "\n"
                + "Gói tiệc: " + (tenGoi != null ? tenGoi : "-") + "\n"
                + "Ngày tổ chức: " + (ngayToChuc != null ? ngayToChuc : "-") + "\n"
                + "Số lượng khách: " + (soLuongKhach != null ? soLuongKhach : 0) + "\n\n"
                + "Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của NewWorld.";

        message.setText(noiDung);
        mailSender.send(message);
    }
}
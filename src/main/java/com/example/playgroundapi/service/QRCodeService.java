package com.example.playgroundapi.service;

import org.springframework.stereotype.Service;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class QRCodeService {

    // ✅ CẤU HÌNH NGÂN HÀNG
    private static final String BANK_BIN = "970436";  // Vietcombank
    private static final String ACCOUNT_NO = "1025468639";  // Số tài khoản
    private static final String ACCOUNT_NAME = "NGUYEN KHANH VY";  // Tên chủ TK
    private static final String BANK_NAME = "Vietcombank (VCB)";
    
    // Dùng template 'compact2' (chỉ có QR và logo bank) để dễ quét nhất
    private static final String TEMPLATE = "compact2";

    /**
     * Tạo URL QR Code VietQR
     */
    public String generateQRCodeURL(Long amount, String description) {
        try {
            if (description == null) description = "";

            // Encode UTF-8 và đổi dấu cộng (+) thành %20 để app ngân hàng không bị lỗi
            String encodedDescription = URLEncoder.encode(description, StandardCharsets.UTF_8.toString())
                                                  .replace("+", "%20");
            
            String encodedAccountName = URLEncoder.encode(ACCOUNT_NAME, StandardCharsets.UTF_8.toString())
                                                  .replace("+", "%20");

            // Tạo URL VietQR (Đã sửa lỗi dấu cách ở .png)
            String qrUrl = String.format(
                "https://img.vietqr.io/image/%s-%s-%s.png?amount=%d&addInfo=%s&accountName=%s",
                BANK_BIN,
                ACCOUNT_NO,
                TEMPLATE,
                amount,
                encodedDescription,
                encodedAccountName
            );

            System.out.println("✅ Generated QR URL: " + qrUrl);
            return qrUrl;

        } catch (UnsupportedEncodingException e) {
            System.err.println("❌ Error encoding QR: " + e.getMessage());
            return null;
        }
    }

    /**
     * Tạo nội dung chuyển khoản (Ví dụ: DH001)
     */
    public String generateTransferDescription(String customerName, Integer orderId) {
        // Format: DH001
        // Nếu orderId null thì lấy ngẫu nhiên để không lỗi
        if (orderId == null) orderId = (int) (System.currentTimeMillis() % 1000);
        
        String result = String.format("DH%03d", orderId);
        
        System.out.println("📝 Transfer Description: " + result);
        return result;
    }

    /**
     * Lấy thông tin ngân hàng
     */
    public BankInfo getBankInfo() {
        return new BankInfo(BANK_NAME, ACCOUNT_NO, ACCOUNT_NAME, BANK_BIN);
    }

    // Inner class
    public static class BankInfo {
        private String bankName;
        private String accountNo;
        private String accountName;
        private String bankBin;

        public BankInfo(String bankName, String accountNo, String accountName, String bankBin) {
            this.bankName = bankName;
            this.accountNo = accountNo; // Đã sửa lỗi thừa dấu cách
            this.accountName = accountName;
            this.bankBin = bankBin;
        }

        public String getBankName() { return bankName; }
        public String getAccountNo() { return accountNo; }
        public String getAccountName() { return accountName; }
        public String getBankBin() { return bankBin; }
    }
}
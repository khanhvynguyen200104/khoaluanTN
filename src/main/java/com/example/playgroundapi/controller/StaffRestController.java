package com.example.playgroundapi.controller;

import com.example.playgroundapi.entity.NguoiDung;
import com.example.playgroundapi.entity.HoaDon;
import com.example.playgroundapi.repository.KhoNguoiDung;
import com.example.playgroundapi.repository.HoaDonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class StaffRestController {

    @Autowired
    private KhoNguoiDung khoNguoiDung;

    @Autowired
    private HoaDonRepository hoaDonRepository;

    // ==========================================
    // 1. DANH SÁCH KHÁCH HÀNG
    // ==========================================
    @GetMapping("/customers")
    public ResponseEntity<?> getAllCustomers() {
        try {
            List<NguoiDung> customers = khoNguoiDung.findAll();
            // Xóa password trước khi trả về
            customers.forEach(c -> c.setMatKhau(null));
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ==========================================
    // 2. DANH SÁCH HÓA ĐƠN
    // ==========================================
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        try {
            List<HoaDon> orders = hoaDonRepository.findAll();
            // Sắp xếp mới nhất trước
            orders.sort((a, b) -> b.getId().compareTo(a.getId()));
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ==========================================
    // 3. CẬP NHẬT HÓA ĐƠN
    // ==========================================
    @PutMapping("/orders/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable Long id, @RequestBody HoaDon orderUpdate) {
        try {
            Optional<HoaDon> orderOpt = hoaDonRepository.findById(id);
            if (!orderOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Hóa đơn không tồn tại");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            HoaDon order = orderOpt.get();
            
            if (orderUpdate.getTrangThai() != null) {
                order.setTrangThai(orderUpdate.getTrangThai());
            }

            hoaDonRepository.save(order);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Cập nhật hóa đơn thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ==========================================
    // 4. LẤY THÔNG TIN KHÁCH HÀNG
    // ==========================================
    @GetMapping("/customers/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Long id) {
        try {
            Optional<NguoiDung> customerOpt = khoNguoiDung.findById(id);
            if (!customerOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Khách hàng không tồn tại");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            NguoiDung customer = customerOpt.get();
            customer.setMatKhau(null);
            return ResponseEntity.ok(customer);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ==========================================
    // 5. CẬP NHẬT THÔNG TIN KHÁCH HÀNG
    // ==========================================
    @PutMapping("/customers/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody NguoiDung customerUpdate) {
        try {
            Optional<NguoiDung> customerOpt = khoNguoiDung.findById(id);
            if (!customerOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Khách hàng không tồn tại");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            NguoiDung customer = customerOpt.get();
            
            if (customerUpdate.getHoTen() != null) {
                customer.setHoTen(customerUpdate.getHoTen());
            }
            if (customerUpdate.getEmail() != null) {
                customer.setEmail(customerUpdate.getEmail());
            }
            if (customerUpdate.getSoDienThoai() != null) {
                customer.setSoDienThoai(customerUpdate.getSoDienThoai());
            }

            khoNguoiDung.save(customer);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Cập nhật khách hàng thành công!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ==========================================
    // 6. THỐNG KÊ NHÂN VIÊN
    // ==========================================
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalCustomers", khoNguoiDung.count());
            
            List<HoaDon> allOrders = hoaDonRepository.findAll();
            stats.put("totalOrders", allOrders.size());
            
            double totalRevenue = allOrders.stream()
                    .filter(o -> o.getTrangThai() != null && 
                           (o.getTrangThai().contains("Thành công") || o.getTrangThai().contains("Đã sử dụng")))
                    .mapToDouble(HoaDon::getTongTien)
                    .sum();
            stats.put("totalRevenue", totalRevenue);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

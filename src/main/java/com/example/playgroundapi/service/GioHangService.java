//package com.example.khuvuichoi.service;
//
//import com.example.khuvuichoi.dto.GioHangItem;
//import com.example.khuvuichoi.entity.SanPham;
//import org.springframework.stereotype.Service;
//import org.springframework.web.context.annotation.SessionScope;
//
//import java.util.Collection;
//import java.util.HashMap;
//import java.util.Map;
//
//@Service
//@SessionScope // Giỏ hàng sống theo phiên làm việc của user
//public class GioHangService {
//
//    // Key: ID sản phẩm (Integer), Value: Item giỏ hàng
//    private Map<Integer, GioHangItem> maps = new HashMap<>();
//
//    // Thêm sản phẩm vào giỏ
//    public void themSanPham(SanPham sanPham, int soLuong) {
//        GioHangItem item = maps.get(sanPham.getId());
//        
//        // Nếu chưa có trong giỏ thì tạo mới
//        if (item == null) {
//            item = new GioHangItem(sanPham, soLuong);
//            maps.put(sanPham.getId(), item);
//        } else {
//            // Nếu có rồi thì cộng dồn số lượng
//            item.setSoLuong(item.getSoLuong() + soLuong);
//        }
//    }
//
//    // Xóa sản phẩm khỏi giỏ
//    public void xoaSanPham(int id) {
//        maps.remove(id);
//    }
//
//    // Cập nhật số lượng (ví dụ khách sửa số lượng trong giỏ)
//    public GioHangItem capNhatSoLuong(int id, int soLuong) {
//        GioHangItem item = maps.get(id);
//        if(item != null) {
//            item.setSoLuong(soLuong);
//        }
//        return item;
//    }
//
//    // Xóa sạch giỏ hàng
//    public void clear() {
//        maps.clear();
//    }
//
//    // Lấy danh sách hiển thị
//    public Collection<GioHangItem> getItems() {
//        return maps.values();
//    }
//
//    // Tính tổng tiền cả giỏ hàng
//    public double getTongTien() {
//        return maps.values().stream()
//                .mapToDouble(item -> item.getThanhTien())
//                .sum();
//    }
//    
//    // Lấy tổng số lượng sản phẩm (để hiện lên icon giỏ hàng: 3, 4...)
//    public int getTongSoLuongSanPham() {
//        return maps.values().size();
//    }
//}



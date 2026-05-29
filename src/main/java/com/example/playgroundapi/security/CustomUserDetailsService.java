package com.example.playgroundapi.security;

import com.example.playgroundapi.entity.NguoiDung;
import com.example.playgroundapi.repository.KhoNguoiDung;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private KhoNguoiDung khoNguoiDung;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        NguoiDung user = khoNguoiDung.findByTenDangNhapOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Người dùng không tồn tại: " + usernameOrEmail));

        return new org.springframework.security.core.userdetails.User(
                user.getTenDangNhap(),
                user.getMatKhau(),
                getAuthorities(user)
        );
    }

    // Chuyển đổi roles thành GrantedAuthority
    private Collection<? extends GrantedAuthority> getAuthorities(NguoiDung user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        // Nếu có danhSachVaiTro (chuỗi roles)
        if (user.getDanhSachVaiTro() != null && !user.getDanhSachVaiTro().isEmpty()) {
            Arrays.stream(user.getDanhSachVaiTro().split(","))
                    .forEach(role -> authorities.add(new SimpleGrantedAuthority("ROLE_" + role.trim().toUpperCase())));
        } else {
            // Nếu không có, mặc định là USER
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }
        
        return authorities;
    }

    // Hàm lấy danh sách roles từ user
    public List<String> getUserRoles(NguoiDung user) {
        List<String> roles = new ArrayList<>();
        if (user.getDanhSachVaiTro() != null && !user.getDanhSachVaiTro().isEmpty()) {
            Arrays.stream(user.getDanhSachVaiTro().split(","))
                    .forEach(role -> roles.add(role.trim().toUpperCase()));
        } else {
            roles.add("USER");
        }
        return roles;
    }
}

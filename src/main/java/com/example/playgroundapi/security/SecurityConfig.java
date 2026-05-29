package com.example.playgroundapi.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner; 
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.playgroundapi.entity.NguoiDung; 
import com.example.playgroundapi.repository.KhoNguoiDung; 

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Unauthorized\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Access Denied\"}");
                        })
                )
                .authorizeHttpRequests(authz -> authz
                        // BỔ SUNG QUAN TRỌNG: Cho phép tất cả request OPTIONS (để React không bị lỗi CORS Preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        
                        // GOM GỌN LẠI: Mở khóa toàn bộ các API bắt đầu bằng /api/auth/
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/an-uong/danh-sach").permitAll()
                        .requestMatchers("/api/voucher/**").permitAll()
                        .requestMatchers("/api/gia-ve").permitAll()
                    .requestMatchers("/api/dat-tiec/goi-tiec").permitAll()
                    .requestMatchers("/api/dat-tiec/dat").permitAll()

                        // Phân quyền cho Admin và Staff
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/staff/**").hasAnyRole("ADMIN", "STAFF")

                        // Tất cả request khác yêu cầu authentication
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*")); // Cho phép mọi origin (React)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")); // Thêm PATCH cho chắc
        configuration.setAllowedHeaders(Arrays.asList("*")); // Cho phép mọi header
        configuration.setAllowCredentials(false); // Đã để allowedOrigins="*" thì AllowCredentials phải là false
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // =========================================================
    // TỰ ĐỘNG TẠO TÀI KHOẢN ADMIN MẶC ĐỊNH
    // =========================================================
    @Bean
    public CommandLineRunner taoTaiKhoanAdminMacDinh(KhoNguoiDung khoNguoiDung, PasswordEncoder passwordEncoder) {
        return args -> {
            if (khoNguoiDung.findByTenDangNhap("admin01").isEmpty()) {
                NguoiDung admin = new NguoiDung();
                admin.setTenDangNhap("admin01");
                admin.setMatKhau(passwordEncoder.encode("admin123")); // Mã hóa BCrypt
                admin.setEmail("admin01@gmail.com");
                admin.setHoTen("Quản trị viên hệ thống");
                
                admin.setDanhSachVaiTro("ADMIN"); 
                admin.setHangThanhVien("DIAMOND");
                admin.setTongChiTieu(0.0);

                khoNguoiDung.save(admin);
                System.out.println("🔥 Đã tạo thành công tài khoản Admin mặc định (admin01 / admin123)");
            }

            if (khoNguoiDung.findByTenDangNhap("staff01").isEmpty()) {
                NguoiDung staff = new NguoiDung();
                staff.setTenDangNhap("staff01");
                staff.setMatKhau(passwordEncoder.encode("staff123")); // Mã hóa BCrypt
                staff.setEmail("staff01@gmail.com");
                staff.setHoTen("Nhân viên bán vé");
                
                staff.setDanhSachVaiTro("STAFF");
                staff.setHangThanhVien("SILVER");
                staff.setTongChiTieu(0.0);

                khoNguoiDung.save(staff);
                System.out.println("🔥 Đã tạo thành công tài khoản Staff mặc định (staff01 / staff123)");
            }
        };
    }
}
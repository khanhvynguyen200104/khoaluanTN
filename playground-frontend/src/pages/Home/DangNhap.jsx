import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const DangNhap = () => {
    // 1. State cho Đăng Nhập
    const [taiKhoan, setTaiKhoan] = useState(''); 
    const [matKhau, setMatKhau] = useState('');
    
    // 2. State cho Quên Mật Khẩu
    const [isQuenMatKhau, setIsQuenMatKhau] = useState(false);
    const [daGuiOTP, setDaGuiOTP] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [matKhauMoi, setMatKhauMoi] = useState('');
    
    // 3. State thông báo chung
    const [baoLoi, setBaoLoi] = useState('');
    const [thongBao, setThongBao] = useState(''); 
    
    const navigate = useNavigate();

    // ==========================================
    // XỬ LÝ ĐĂNG NHẬP
    // ==========================================
    const handleLogin = async (e) => {
        e.preventDefault();
        setBaoLoi('');
        setThongBao('');

        try {
            const response = await fetch('http://localhost:8081/api/auth/dang-nhap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taiKhoan: taiKhoan.trim(), matKhau: matKhau.trim() })
            });

            const data = await response.json();

            if (response.ok) {
                // Lưu token trước để dùng cho lần đồng bộ thông tin tiếp theo
                localStorage.setItem('user', JSON.stringify(data));

                // Đồng bộ lại profile từ backend để đảm bảo tongChiTieu/hangThanhVien luôn đúng
                const profileResponse = await fetch('http://localhost:8081/api/auth/me', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${data.token}`
                    }
                });

                if (profileResponse.ok) {
                    const profile = await profileResponse.json();
                    const syncedUser = { ...data, ...profile, token: data.token };
                    localStorage.setItem('user', JSON.stringify(syncedUser));
                }

                // Phân quyền chuyển trang
                if (data.roles && data.roles.includes('ADMIN')) {
                    navigate('/admin');
                } else if (data.roles && data.roles.includes('STAFF')) {
                    navigate('/pos-nhan-vien'); // Đẩy vào POS
                } else {
                    navigate('/'); // User thường về trang chủ
                }
            } else {
                setBaoLoi(data.message || 'Đăng nhập thất bại!');
            }
        } catch (error) {
            setBaoLoi('Không thể kết nối đến máy chủ Backend!');
        }
    };

    // ==========================================
    // BƯỚC 1: YÊU CẦU GỬI OTP QUA EMAIL
    // ==========================================
    const handleYeuCauOTP = async (e) => {
        e.preventDefault();
        setBaoLoi('');
        setThongBao('');

        try {
            const response = await fetch('http://localhost:8081/api/auth/quen-mat-khau', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });

            if (response.ok) {
                setThongBao('Mã OTP đã được gửi! (Mở màn hình Spring Boot để xem mã)');
                setDaGuiOTP(true); // Đã thêm dòng này để chuyển sang màn hình nhập OTP
            } else {
                const data = await response.json();
                setBaoLoi(data.message || 'Không thể gửi OTP. Vui lòng kiểm tra lại Email!');
            }
        } catch (error) {
            setBaoLoi('Không thể kết nối đến máy chủ!');
        }
    };

    // ==========================================
    // BƯỚC 2: NHẬP OTP & ĐẶT LẠI MẬT KHẨU
    // ==========================================
    const handleDatLaiMatKhau = async (e) => {
        e.preventDefault();
        setBaoLoi('');
        setThongBao('');

        try {
            const response = await fetch('http://localhost:8081/api/auth/dat-lai-mat-khau', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email,
                    otp: otp, 
                    matKhauMoi: matKhauMoi 
                })
            });

            if (response.ok) {
                setThongBao('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
                setTimeout(() => {
                    setIsQuenMatKhau(false);
                    setDaGuiOTP(false);
                    setTaiKhoan(email);
                    setEmail('');
                    setOtp('');
                    setMatKhauMoi('');
                    setMatKhau('');
                    setThongBao('');
                }, 2000); 
            } else {
                const data = await response.json();
                setBaoLoi(data.message || 'Mã OTP không đúng!');
            }
        } catch (error) {
            setBaoLoi('Không thể kết nối đến máy chủ!');
        }
    };

    return (
        <>
            <style>
                {`
                .login-container { background: #f8f7fc; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; }
                .login-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(108, 92, 231, 0.1); width: 100%; max-width: 400px; }
                .btn-primary-custom { background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%); color: white; border: none; border-radius: 10px; padding: 12px; width: 100%; font-weight: bold; font-size: 16px; transition: 0.3s; }
                .btn-primary-custom:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(108, 92, 231, 0.3); color: white; }
                .text-brand { color: #6c5ce7; }
                .link-hover:hover { text-decoration: underline !important; }
                `}
            </style>

            <div className="login-container">
                <div className="login-card">
                    <div className="text-center mb-4">
                        <h3 className="fw-bold text-brand">NEWWORLD</h3>
                        <p className="text-muted">
                            {!isQuenMatKhau ? 'Chào mừng bạn quay lại!' : (daGuiOTP ? 'Tạo mật khẩu mới' : 'Khôi phục tài khoản')}
                        </p>
                    </div>

                    {baoLoi && (
                        <div className="alert alert-danger d-flex align-items-center" role="alert" style={{ fontSize: '14px', padding: '10px' }}>
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            <div>{baoLoi}</div>
                        </div>
                    )}

                    {thongBao && (
                        <div className="alert alert-success d-flex align-items-center" role="alert" style={{ fontSize: '14px', padding: '10px' }}>
                            <i className="bi bi-check-circle-fill me-2"></i>
                            <div>{thongBao}</div>
                        </div>
                    )}

                    {/* MÀN HÌNH 1: ĐĂNG NHẬP */}
                    {!isQuenMatKhau && (
                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary">Tên đăng nhập / Email</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-person"></i></span>
                                    <input 
                                        type="text" className="form-control border-start-0" required 
                                        placeholder="Nhập username hoặc email..."
                                        value={taiKhoan} onChange={(e) => setTaiKhoan(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary">Mật khẩu</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock"></i></span>
                                    <input 
                                        type="password" className="form-control border-start-0" required 
                                        placeholder="Nhập mật khẩu..."
                                        value={matKhau} onChange={(e) => setMatKhau(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="d-flex justify-content-end mb-4">
                                <span className="text-brand link-hover" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                                    onClick={() => { setIsQuenMatKhau(true); setDaGuiOTP(false); setBaoLoi(''); setThongBao(''); }}>
                                    Quên mật khẩu?
                                </span>
                            </div>
                            
                            <button type="submit" className="btn-primary-custom mb-3">Đăng Nhập Ngay</button>
                            
                            <div className="text-center mt-3">
                                <span className="text-muted">Chưa có tài khoản?</span> 
                                <Link to="/dang-ky" className="text-decoration-none fw-bold text-brand ms-1 link-hover">Đăng ký ngay</Link>
                            </div>
                        </form>
                    )}

                    {/* MÀN HÌNH 2: NHẬP EMAIL ĐỂ LẤY OTP */}
                    {isQuenMatKhau && !daGuiOTP && (
                        <form onSubmit={handleYeuCauOTP}>
                            <div className="mb-4">
                                <label className="form-label fw-bold text-secondary">Nhập Email đã đăng ký</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope"></i></span>
                                    <input 
                                        type="email" className="form-control border-start-0" required 
                                        placeholder="VD: nguyenvana@gmail.com"
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary-custom mb-3">Gửi mã xác nhận</button>

                            <div className="text-center mt-3">
                                <span className="text-muted link-hover" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                                    onClick={() => { setIsQuenMatKhau(false); setBaoLoi(''); setThongBao(''); }}>
                                    <i className="bi bi-arrow-left me-1"></i> Quay lại Đăng nhập
                                </span>
                            </div>
                        </form>
                    )}

                    {/* MÀN HÌNH 3: NHẬP OTP VÀ ĐỔI PASS */}
                    {isQuenMatKhau && daGuiOTP && (
                        <form onSubmit={handleDatLaiMatKhau}>
                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary">Mã OTP (6 số)</label>
                                <input 
                                    type="text" className="form-control text-center fw-bold" required maxLength="6"
                                    placeholder="------" style={{ letterSpacing: '5px', fontSize: '20px' }}
                                    value={otp} onChange={(e) => setOtp(e.target.value)}
                                />
                                <div className="form-text mt-1" style={{ fontSize: '12px' }}>
                                    Vui lòng mở Console Spring Boot để xem mã OTP giả lập được gửi vào Email.
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold text-secondary">Mật khẩu mới</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock"></i></span>
                                    <input 
                                        type="password" className="form-control border-start-0" required minLength="6"
                                        placeholder="Tạo mật khẩu mới..."
                                        value={matKhauMoi} onChange={(e) => setMatKhauMoi(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary-custom mb-3">Xác nhận đổi mật khẩu</button>

                            <div className="text-center mt-3">
                                <span className="text-muted link-hover" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                                    onClick={() => { setDaGuiOTP(false); setBaoLoi(''); setThongBao(''); setOtp(''); }}>
                                    <i className="bi bi-arrow-left me-1"></i> Nhập lại Email
                                </span>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};

export default DangNhap;
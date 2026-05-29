import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const DangKy = () => {
    const [formData, setFormData] = useState({
        tenDangNhap: '',
        matKhau: '',
        soDienThoai: '',
        email: ''
    });
    const [baoLoi, setBaoLoi] = useState('');
    const [thongBao, setThongBao] = useState('');
    const navigate = useNavigate();

    // 2. Hàm bắt sự kiện khi người dùng gõ vào ô input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // 3. Hàm xử lý khi bấm nút "Đăng Ký Ngay"
    const handleSubmit = async (e) => {
        e.preventDefault();
        setBaoLoi('');
        setThongBao('');

        try {
            // ĐÃ SỬA URL TỪ tai-khoan THÀNH auth ĐỂ KHỚP VỚI BACKEND
            const trimmedData = {
                tenDangNhap: formData.tenDangNhap.trim(),
                matKhau: formData.matKhau.trim(),
                soDienThoai: formData.soDienThoai.trim(),
                email: formData.email.trim()
            };
            await axios.post('http://localhost:8081/api/auth/dang-ky', trimmedData);
            setThongBao('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...');
            setTimeout(() => navigate('/dang-nhap'), 1200);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setBaoLoi(error.response.data.error);
            } else if (error.response && error.response.data && error.response.data.loi) {
                setBaoLoi(error.response.data.loi);
            } else {
                setBaoLoi('Có lỗi xảy ra, vui lòng thử lại sau!');
            }
        }
    };

    return (
        <>
            <style>
                {`
                .auth-container { background: #f8f7fc; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Segoe UI', sans-serif; padding: 20px; }
                .auth-card { background: white; padding: 40px 35px; border-radius: 20px; box-shadow: 0 10px 30px rgba(108, 92, 231, 0.08); width: 100%; max-width: 420px; }
                .auth-card h3 { color: #6c5ce7; font-weight: 700; }
                .auth-card p { color: #6c6c7e; }
                .auth-input-group { margin-bottom: 18px; }
                .auth-input-group .form-label { font-weight: 600; color: #5a5f7a; }
                .auth-input-group .input-group-text { background: #f1f0ff; border-right: 0; color: #6c5ce7; }
                .auth-input-group .form-control { border-left: 0; }
                .btn-auth { background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%); color: white; border: none; border-radius: 12px; width: 100%; padding: 12px; font-size: 16px; font-weight: 700; transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .btn-auth:hover { transform: translateY(-2px); box-shadow: 0 14px 25px rgba(108, 92, 231, 0.18); }
                .text-brand { color: #6c5ce7; }
                .link-hover:hover { text-decoration: underline; }
                .alert-custom { border-radius: 14px; font-size: 14px; padding: 12px 14px; }
                `}
            </style>

            <div className="auth-container">
                <div className="auth-card">
                    <div className="text-center mb-4">
                        <h3>NEWWORLD</h3>
                        <p>Đăng ký tài khoản mới để trải nghiệm dịch vụ.</p>
                    </div>

                    {baoLoi && (
                        <div className="alert alert-danger alert-custom" role="alert">
                            {baoLoi}
                        </div>
                    )}
                    {thongBao && (
                        <div className="alert alert-success alert-custom" role="alert">
                            {thongBao}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="auth-input-group">
                            <label className="form-label">Tên đăng nhập</label>
                            <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-person"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="tenDangNhap"
                                    value={formData.tenDangNhap}
                                    onChange={handleChange}
                                    required
                                    placeholder="Viết liền không dấu"
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="form-label">Mật khẩu</label>
                            <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="matKhau"
                                    value={formData.matKhau}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nhập mật khẩu"
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="form-label">Số điện thoại</label>
                            <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="soDienThoai"
                                    value={formData.soDienThoai}
                                    onChange={handleChange}
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="form-label">Email</label>
                            <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@gmail.com"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-auth mb-3">Đăng Ký Ngay</button>
                    </form>

                    <div className="text-center">
                        <span className="text-muted">Đã có tài khoản?</span>
                        <Link to="/dang-nhap" className="text-brand fw-bold ms-1 link-hover">Quay lại đăng nhập</Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DangKy;
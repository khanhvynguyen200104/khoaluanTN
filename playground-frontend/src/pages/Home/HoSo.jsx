import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const HoSo = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        id: '',
        tenDangNhap: '',
        hoTen: '',
        soDienThoai: '',
        email: '' // Bổ sung trường email
    });

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) {
            navigate('/dang-nhap');
        } else {
            setUser(loggedInUser);
        }
    }, [navigate]);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        // Kiểm tra cơ bản
        if (!user.tenDangNhap || user.tenDangNhap.trim() === '') {
            alert("Tên đăng nhập không được để trống!");
            return;
        }

        try {
            const res = await fetch('http://localhost:8081/api/ho-so/cap-nhat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                
                // QUAN TRỌNG: Lấy lại Token từ LocalStorage cũ để đắp vào User mới
                // Nếu không làm bước này, mất token khách sẽ bị văng đăng xuất ngay lập tức
                const currentUserStr = localStorage.getItem('user');
                const currentUserObj = JSON.parse(currentUserStr);
                
                const finalUserToSave = { 
                    ...updatedUser, 
                    token: currentUserObj.token || currentUserObj.accessToken || '' 
                };

                // Cập nhật lại localStorage
                localStorage.setItem('user', JSON.stringify(finalUserToSave));
                alert("Cập nhật thông tin thành công!");
                
            } else {
                const errorText = await res.text();
                alert(errorText || "Có lỗi xảy ra khi cập nhật!");
            }
        } catch (error) {
            alert("Lỗi kết nối đến máy chủ!");
        }
    };

    return (
        <div style={{ backgroundColor: '#f3f5f9', minHeight: '100vh', padding: '40px 20px' }}>
            <div className="container" style={{ maxWidth: '500px' }}>
                <div className="card shadow-sm border-0" style={{ borderRadius: '20px' }}>
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold text-primary m-0">HỒ SƠ CÁ NHÂN</h4>
                            <Link to="/" className="btn btn-outline-secondary btn-sm">Trang chủ</Link>
                        </div>
                        
                        <div className="text-center mb-4">
                            <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', fontSize: '30px' }}>
                                <i className="bi bi-person-fill"></i>
                            </div>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Tên đăng nhập</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    name="tenDangNhap"
                                    value={user.tenDangNhap || ''} 
                                    onChange={handleChange} 
                                    placeholder="Nhập tên đăng nhập..."
                                    required 
                                />
                                <small className="text-muted" style={{ fontSize: '12px' }}>* Dùng để đăng nhập hệ thống</small>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Họ và tên</label>
                                <input type="text" className="form-control" name="hoTen" value={user.hoTen || ''} onChange={handleChange} placeholder="Nhập họ tên..." />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Email (Gmail)</label>
                                <input type="email" className="form-control" name="email" value={user.email || ''} onChange={handleChange} placeholder="VD: nguyenvan@gmail.com" />
                            </div>
                            
                            <div className="mb-4">
                                <label className="form-label fw-bold">Số điện thoại</label>
                                <input type="tel" className="form-control" name="soDienThoai" value={user.soDienThoai || ''} onChange={handleChange} placeholder="Nhập số ĐT..." />
                            </div>

                            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold mb-2 rounded-pill">
                                <i className="bi bi-save me-2"></i> LƯU THAY ĐỔI
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HoSo;
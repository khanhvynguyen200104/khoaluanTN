import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LichSu = () => {
    const [lichSu, setLichSu] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedHoaDon, setSelectedHoaDon] = useState(null); 
    const [chiTiet, setChiTiet] = useState([]); 
    
    const navigate = useNavigate();

    const getToken = () => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const userObj = JSON.parse(userString);
                return userObj.token || userObj.accessToken || '';
            }
            return localStorage.getItem('token') || '';
        } catch (error) {
            return localStorage.getItem('token') || '';
        }
    };

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) {
            alert("Vui lòng đăng nhập để xem lịch sử!");
            navigate('/dang-nhap');
            return;
        }

        // Tự động rà soát tên biến để tránh bị null
        const tenTaiKhoan = loggedInUser.tenDangNhap || loggedInUser.username || loggedInUser.email || loggedInUser.hoTen;
        console.log('User từ localStorage:', loggedInUser);
        console.log('Tên tài khoản sử dụng:', tenTaiKhoan);
        if (!tenTaiKhoan) {
            console.error('Không tìm thấy thông tin tài khoản trong LocalStorage:', loggedInUser);
            alert('Thông tin tài khoản không hợp lệ. Vui lòng đăng nhập lại.');
            navigate('/dang-nhap');
            return;
        }

        // Gọi API lấy lịch sử tổng
        setIsLoading(true);
        setError('');
        const token = getToken();
        fetch('http://localhost:8081/api/lich-su', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user: tenTaiKhoan })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP ${res.status} khi lấy lịch sử`);
            }
            return res.json();
        })
        .then(data => {
            console.log('Dữ liệu lịch sử nhận được:', data);
            if (Array.isArray(data)) {
                setLichSu(data);
            } else if (Array.isArray(data?.data)) {
                setLichSu(data.data);
            } else {
                console.warn('Dữ liệu lịch sử không phải mảng:', data);
                setLichSu([]);
            }
        })
        .catch(err => {
            console.error("Lỗi fetch lịch sử:", err);
            setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.');
            setLichSu([]);
        })
        .finally(() => setIsLoading(false));
    }, [navigate]);

    // Hàm xử lý khi bấm nút "Xem chi tiết"
    const handleXemChiTiet = async (hd) => {
        setSelectedHoaDon(hd); 
        try {
            const token = getToken();
            const res = await fetch(`http://localhost:8081/api/lich-su/chi-tiet/${hd.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status} khi lấy chi tiết hóa đơn`);
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                setChiTiet(data);
            } else if (Array.isArray(data?.data)) {
                setChiTiet(data.data);
            } else {
                console.warn('Dữ liệu chi tiết hóa đơn không phải mảng:', data);
                setChiTiet([]);
            }
        } catch (error) {
            console.error("Lỗi lấy chi tiết hóa đơn:", error);
            setChiTiet([]);
        }
    };

    // Hàm đóng Modal
    const closeModal = () => {
        setSelectedHoaDon(null);
        setChiTiet([]);
    };

    return (
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px 20px' }}>
            <div className="container bg-white p-4 shadow-sm" style={{ borderRadius: '15px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <h3 className="fw-bold m-0" style={{ color: '#0d6efd' }}>
                        <i className="bi bi-clock-history me-2"></i> LỊCH SỬ GIAO DỊCH
                    </h3>
                    <Link to="/" className="btn btn-outline-secondary btn-sm">Quay lại trang chủ</Link>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-5 text-muted">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="mt-3">Đang tải lịch sử giao dịch...</p>
                    </div>
                ) : (!Array.isArray(lichSu) || lichSu.length === 0) ? (
                    <div className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                        <h5>Bạn chưa có giao dịch nào!</h5>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Mã Đơn</th>
                                    <th>Loại Giao Dịch</th>
                                    <th>Tổng Tiền</th>
                                    <th>Ngày Mua</th>
                                    <th>Trạng Thái</th>
                                    <th>Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(lichSu) && lichSu.map((hd, index) => (
                                    <tr key={index}>
                                        <td className="fw-bold text-primary">#{hd.id}</td>
                                        <td>
                                            {hd.loaiGiaoDich === 'MUA_VE' && <span className="badge bg-info text-dark"><i className="bi bi-ticket-perforated"></i> Mua Vé</span>}
                                            {/* ĐÃ SỬA CHỮ DO_AN THÀNH AN_UONG Ở DÒNG DƯỚI ĐÂY */}
                                            {hd.loaiGiaoDich === 'AN_UONG' && <span className="badge bg-warning text-dark"><i className="bi bi-cup-hot"></i> Ăn Uống</span>}
                                        </td>
                                        <td className="text-danger fw-bold">{hd.tongTien.toLocaleString()} đ</td>
                                        <td>{new Date(hd.ngayMua).toLocaleString('vi-VN')}</td>
                                        <td>
                                            {hd.trangThai === 'Thành công' ? (
                                                <span className="badge bg-success"><i className="bi bi-check-circle"></i> Thành công</span>
                                            ) : (
                                                <span className="badge bg-secondary">{hd.trangThai}</span>
                                            )}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => handleXemChiTiet(hd)}
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL HIỂN THỊ CHI TIẾT HÓA ĐƠN */}
            {selectedHoaDon && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold">
                                    Chi Tiết Đơn Hàng #{selectedHoaDon.id}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                            </div>
                            <div className="modal-body p-4">
                                {(!Array.isArray(chiTiet) || chiTiet.length === 0) ? (
                                    <p className="text-center text-muted my-4">Đang tải chi tiết...</p>
                                ) : (
                                    <ul className="list-group list-group-flush">
                                        {chiTiet.map((item, idx) => (
                                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center py-3">
                                                <div className="d-flex align-items-center">
                                                    <img 
                                                        src={item.hinhAnh || 'https://via.placeholder.com/50'} 
                                                        alt="img" 
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', marginRight: '15px' }} 
                                                    />
                                                    <div>
                                                        <h6 className="mb-1 fw-bold">{item.tenSanPham}</h6>
                                                        <small className="text-muted">Đơn giá: {item.gia.toLocaleString()} đ</small>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <span className="badge bg-secondary rounded-pill mb-1">x {item.soLuong}</span>
                                                    <div className="fw-bold text-danger">
                                                        {(item.gia * item.soLuong).toLocaleString()} đ
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="modal-footer bg-light d-flex justify-content-between">
                                <span className="fw-bold text-muted">
                                    Tổng cộng: <span className="text-danger fs-5">{selectedHoaDon.tongTien.toLocaleString()} đ</span>
                                </span>
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LichSu;
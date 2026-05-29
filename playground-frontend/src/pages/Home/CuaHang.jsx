import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Voucher.css'; // Vẫn dùng file CSS "vé xé" của bạn

const CuaHang = () => {
    const [danhSachVoucher, setDanhSachVoucher] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Kiểm tra đăng nhập từ localStorage
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        setUser(loggedInUser);

        // 2. Gọi API lấy dữ liệu từ bảng vouchers trong SQL
        fetch('http://localhost:8081/api/voucher')
            .then(res => res.json())
            .then(data => {
                setDanhSachVoucher(data); // Đổ dữ liệu từ SQL vào state
            })
            .catch(err => console.error("Lỗi kết nối SQL:", err));
    }, []);

    // 3. Hàm copy mã
    const handleCopy = (code) => {
        if (!user) {
            alert("Vui lòng đăng nhập để nhận ưu đãi!");
            navigate('/dang-nhap');
            return;
        }
        navigator.clipboard.writeText(code);
        alert(`Đã copy mã: ${code}. Dùng mã này khi mua vé nhé!`);
    };

    return (
        <div className="voucher-container">
            <h2 className="voucher-title">CỬA HÀNG VOUCHER ƯU ĐÃI</h2>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                Săn mã giảm giá trước khi vào cổng khu vui chơi
            </p>

            <div className="voucher-list">
                {danhSachVoucher.length === 0 ? (
                    <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>Đang tải voucher từ hệ thống...</p>
                ) : (
                    danhSachVoucher.map((v) => (
                        <div className="voucher-card" key={v.id}>
                            {/* VẾ TRÁI: Hiển thị số tiền giảm (Lấy từ cột discount_amount trong SQL) */}
                            <div className="voucher-left">
                                <h3>Giảm {v.discountAmount?.toLocaleString()}đ</h3>
                                <p>Đơn tối thiểu: {v.minOrderValue?.toLocaleString()}đ</p>
                            </div>
                            
                            {/* VẾ PHẢI: Hiển thị Code (Lấy từ cột code trong SQL) */}
                            <div className="voucher-right">
                                <span className="voucher-code">{v.code}</span>
                                <span className="voucher-exp">
                                    {v.isActive ? 'Đang áp dụng' : 'Hết hạn'}
                                </span>
                                <button className="copy-btn" onClick={() => handleCopy(v.code)}>
                                    Copy Mã
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CuaHang;
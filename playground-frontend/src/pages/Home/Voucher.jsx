import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Bổ sung thư viện chuyển trang

const Voucher = () => {
    const [vouchers, setVouchers] = useState([]);
    const navigate = useNavigate(); // 2. Khởi tạo hàm chuyển trang
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetch('http://localhost:8081/api/voucher/danh-sach')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status} khi lấy voucher`);
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setVouchers(data);
                } else if (Array.isArray(data?.data)) {
                    setVouchers(data.data);
                } else {
                    console.warn('Dữ liệu voucher không phải mảng:', data);
                    setVouchers([]);
                }
            })
            .catch(err => console.error("Lỗi khi lấy dữ liệu Voucher:", err));
    }, []);

    // 3. Thay hàm handleLuuMa thành handleSuDung để chuyển trang
    const handleSuDung = async (voucher) => {
        if (!user?.tenDangNhap && !user?.username) {
            alert('Vui lòng đăng nhập để sử dụng voucher!');
            navigate('/dang-nhap');
            return;
        }

        const tenTaiKhoan = user?.tenDangNhap || user?.username;
        try {
            const res = await fetch(`http://localhost:8081/api/voucher/luu-ma/${voucher.id}?tenTaiKhoan=${encodeURIComponent(tenTaiKhoan)}`, {
                method: 'POST'
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.loi || data.message || 'Không thể lưu voucher');
            }

            alert(data.thongBao || 'Đã lưu voucher vào ví của bạn!');
        } catch (err) {
            alert(err.message);
        }

        // LƯU Ý: Sửa '/mua-ve' thành đúng đường dẫn trang bán hàng của bạn (ví dụ: '/pos' hoặc '/cua-hang')
        navigate('/mua-ve', { state: { maVoucherTuDong: voucher.maCode } });
    };

    // Hàm định dạng ngày kết thúc cho đẹp
    const formatDate = (dateString) => {
        if (!dateString) return 'Không thời hạn';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="voucher-container">
            <style>
                {`
                .voucher-container { max-width: 800px; margin: 40px auto; padding: 20px; font-family: Arial, sans-serif; }
                .voucher-title { text-align: center; color: #ff424e; margin-bottom: 30px; font-weight: bold; }
                .voucher-list { display: flex; flex-direction: column; gap: 15px; }
                
                .voucher-card { display: flex; background: #fff; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: all 0.3s ease; }
                .voucher-card:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.15); transform: translateY(-2px); }
                
                .voucher-left { padding: 20px; flex: 2; border-right: 2px dashed #ccc; position: relative; background-color: #fff; }
                
                .voucher-left::before, .voucher-left::after { content: ""; position: absolute; width: 20px; height: 20px; background-color: #f0f2f5; border-radius: 50%; right: -11px; }
                .voucher-left::before { top: -10px; }
                .voucher-left::after { bottom: -10px; }
                
                .voucher-badge { background: #ffe3e6; color: #ff424e; padding: 4px 8px; font-size: 12px; border-radius: 4px; font-weight: bold; display: inline-block; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
                .voucher-left h3 { margin: 0 0 10px 0; font-size: 18px; color: #333; font-weight: 700; }
                .voucher-left p { margin: 0; font-size: 14px; color: #666; line-height: 1.5; }
                .voucher-date { display: inline-block; margin-top: 10px; font-size: 13px; color: #888; background: #f9f9f9; padding: 3px 8px; border-radius: 4px;}
                
                .voucher-right { padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #fafafa; }
                .voucher-value { font-size: 24px; font-weight: bold; color: #ff424e; margin-bottom: 15px; text-align: center; }
                
                .save-btn { background: #ff424e; color: white; border: none; padding: 8px 24px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.2s; width: 100%;}
                .save-btn:hover { background: #d82b37; }
                `}
            </style>

            <h2 className="voucher-title">🎟️ KHO VOUCHER CỦA BẠN</h2>
            <div className="voucher-list">
                
                {(!Array.isArray(vouchers) || vouchers.length === 0) ? (
                    <p style={{ textAlign: 'center', width: '100%' }}>Không có ưu đãi nào hoặc đang tải...</p>
                ) : (
                    vouchers.map((v) => (
                        <div className="voucher-card" key={v.id}>
                            <div className="voucher-left">
                                {/* Dùng maCode làm badge */}
                                <span className="voucher-badge">MÃ: {v.maCode}</span>
                                
                                {/* Tên ưu đãi */}
                                <h3>{v.tenUuDai}</h3>
                                
                                {/* Ngày kết thúc */}
                                <div className="voucher-date">
                                    <i className="bi bi-clock"></i> HSD: {formatDate(v.ngayKetThuc)}
                                </div>
                            </div>
                            
                            <div className="voucher-right">
                                {/* Phần trăm giảm */}
                                <span className="voucher-value">Giảm {v.phanTramGiam}%</span>
                                
                                {/* 4. Gọi hàm handleSuDung và truyền maCode vào */}
                                <button className="save-btn" onClick={() => handleSuDung(v)}>
                                    Sử dụng
                                </button>
                            </div>
                        </div>
                    ))
                )}

            </div>
        </div>
    );
};

export default Voucher;
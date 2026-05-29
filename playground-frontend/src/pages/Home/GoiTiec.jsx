import React from 'react';
import { useNavigate } from 'react-router-dom';

const DanhSachGoiTiec = () => {
    const navigate = useNavigate();

    // Hàm xử lý khi bấm nút Đặt
    const handleDatGoi = (tenGoiTiec) => {
        // Chuyển hướng sang trang /dat-tiec và ném kèm cái data (state) đi theo
        navigate('/dat-tiec', { state: { goiDuocChon: tenGoiTiec } });
    };

    return (
        <div style={{ padding: '40px' }}>
            <h2>Các Gói Tiệc Của Chúng Tôi</h2>
            
            {/* Thẻ Gói Tiệc Sinh Nhật */}
            <div className="card" style={{ width: '300px', padding: '20px', marginBottom: '20px' }}>
                <h3>Gói Tiệc Sinh Nhật VIP</h3>
                <p>Trang trí bóng bay, bánh kem, MC...</p>
                {/* Khi bấm, truyền tên gói vào hàm */}
                <button 
                    className="btn btn-primary" 
                    onClick={() => handleDatGoi('Gói Tiệc Sinh Nhật VIP')}
                >
                    Đặt gói này
                </button>
            </div>

            {/* Thẻ Gói Tiệc Tất Niên */}
            <div className="card" style={{ width: '300px', padding: '20px' }}>
                <h3>Gói Tất Niên Công Ty</h3>
                <p>Âm thanh, ánh sáng, menu cao cấp...</p>
                <button 
                    className="btn btn-primary" 
                    onClick={() => handleDatGoi('Gói Tất Niên Công Ty')}
                >
                    Đặt gói này
                </button>
            </div>
        </div>
    );
};

export default DanhSachGoiTiec;
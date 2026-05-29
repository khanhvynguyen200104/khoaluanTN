import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DanhSachGoiTiec = () => {
    const API_BASE = 'http://localhost:8081';
    const navigate = useNavigate();
    const [cacGoiTiec, setCacGoiTiec] = useState([]);
    const [isLoadingGoi, setIsLoadingGoi] = useState(true);

    const mauNenTheoId = ['#ff9a9e', '#a18cd1', '#fbc2eb', '#f6d365', '#84fab0', '#8fd3f4'];

    useEffect(() => {
        setIsLoadingGoi(true);
        fetch(`${API_BASE}/api/dat-tiec/goi-tiec`)
            .then(async (res) => {
                if (!res.ok) {
                    console.error('Loi API danh sach goi tiec:', res.status);
                    return [];
                }
                const data = await res.json();
                return Array.isArray(data) ? data : [];
            })
            .then((data) => setCacGoiTiec(data))
            .catch((err) => {
                console.error('Khong the lay danh sach goi tiec:', err);
                setCacGoiTiec([]);
            })
            .finally(() => {
                setIsLoadingGoi(false);
            });
    }, []);

    // Hàm xử lý khi bấm nút "Chọn gói"
    const handleChonGoi = (tenGoi) => {
        // Chuyển sang trang /dat-tiec và mang theo tên gói tiệc
        navigate('/dat-tiec', { state: { tenGoiTiec: tenGoi } });
    };

    return (
        <div style={{ backgroundColor: '#f3f5f9', minHeight: '100vh', padding: '50px 20px' }}>
            <h2 className="text-center fw-bold mb-5" style={{ color: '#0d6efd' }}>CÁC GÓI TIỆC NỔI BẬT</h2>
            
            <div className="container">
                <div className="row justify-content-center">
                    {isLoadingGoi ? (
                        <p className="text-center text-muted">Dang tai danh sach goi tiec...</p>
                    ) : null}
                    {!isLoadingGoi && cacGoiTiec.length === 0 ? (
                        <p className="text-center text-muted">Hien chua co goi tiec nao.</p>
                    ) : null}

                    {cacGoiTiec.map((goi) => (
                        <div className="col-md-4 mb-4" key={goi.id}>
                            <div className="card shadow-sm h-100" style={{ borderRadius: '15px', border: 'none' }}>
                                {/* Phần hình ảnh/Màu sắc minh họa */}
                                <div style={{ height: '150px', background: `linear-gradient(120deg, ${mauNenTheoId[(goi.id - 1) % mauNenTheoId.length]} 0%, #fdfbfb 100%)`, borderRadius: '15px 15px 0 0' }}></div>
                                
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title fw-bold text-primary">{goi.tenGoi}</h5>
                                    <h6 className="text-danger fw-bold">{Number(goi.gia || 0).toLocaleString('vi-VN')} VNĐ</h6>
                                    <p className="card-text text-muted mb-4">{goi.moTa}</p>
                                    
                                    {/* Nút Chọn Gói - Nằm ở dưới cùng */}
                                    <button 
                                        className="btn btn-primary mt-auto rounded-pill fw-bold"
                                        onClick={() => handleChonGoi(goi.tenGoi)}
                                    >
                                        👉 Chọn gói này
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DanhSachGoiTiec;
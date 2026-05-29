import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DatTiec = () => {
    const API_BASE = 'http://localhost:8081';
    const navigate = useNavigate();

    // State lưu danh sách gói lấy từ Backend
    const [danhSachGoi, setDanhSachGoi] = useState([]);
    const [isLoadingGoi, setIsLoadingGoi] = useState(true);

    // State lưu gói đã chọn
    const [goiDaChon, setGoiDaChon] = useState(null);

    // State lưu dữ liệu form
    const [formData, setFormData] = useState({
        goiTiecId: '',
        goiTiec: '', 
        hoTen: '',
        sdt: '',
        ngayDienRa: '',
        gioDen: '',
        soKhach: '',
        ghiChu: ''
    });

    // Gọi API của Spring Boot để lấy danh sách gói tiệc khi vừa vào trang
    useEffect(() => {
        setIsLoadingGoi(true);
        fetch(`${API_BASE}/api/dat-tiec/goi-tiec`)
            .then(async res => {
                if (!res.ok) {
                    console.error('Lỗi API danh sách gói tiệc:', res.status);
                    return [];
                }
                const data = await res.json();
                return Array.isArray(data) ? data : [];
            })
            .then(data => {
                setDanhSachGoi(data);
            })
            .catch(err => {
                console.log("Lỗi lấy danh sách gói tiệc:", err);
                setDanhSachGoi([]);
            })
            .finally(() => {
                setIsLoadingGoi(false);
            });
    }, []);

    // Xử lý khi khách bấm nút "Đặt gói này"
    const handleChonGoi = (goi) => {
        setGoiDaChon(goi);
        setFormData({
            ...formData,
            goiTiecId: goi.id,
            goiTiec: goi.tenGoi
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Xử lý gửi form xuống Backend
    const handleSubmit = (e) => {
        e.preventDefault();

        const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
        const tenTaiKhoan = loggedInUser.tenDangNhap || loggedInUser.username || '';
        const payload = {
            ...formData,
            tenTaiKhoan
        };
        
        fetch(`${API_BASE}/api/dat-tiec/dat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(res => res.text()) // Backend của bạn đang trả về String
        .then(data => {
            alert(`🎉 Thành công! \n${data}`);
            navigate('/'); // Đặt xong cho về trang chủ (tùy bạn chỉnh)
        })
        .catch(err => {
            alert("Có lỗi xảy ra khi đặt tiệc!");
            console.log(err);
        });
    };

    // =====================================
    // GIAO DIỆN CHỌN GÓI TIỆC
    // =====================================
    if (!goiDaChon) {
        return (
            <div style={{ backgroundColor: '#f3f5f9', minHeight: '100vh', padding: '40px 20px' }}>
                <div className="container">
                    <h2 className="text-center fw-bold mb-5" style={{ color: '#0d6efd' }}>CÁC GÓI TIỆC CỦA CHÚNG TÔI</h2>
                    <div className="row justify-content-center">
                        {isLoadingGoi ? <p className="text-center">Đang tải danh sách gói tiệc...</p> : null}
                        {!isLoadingGoi && danhSachGoi.length === 0 ? <p className="text-center text-muted">Hiện chưa có gói tiệc nào.</p> : null}
                        
                        {danhSachGoi.map((goi) => {
                            const imgSrc = goi.hinhAnh || goi.image || 'https://via.placeholder.com/400x200?text=Gói+tiệc';
                            return (
                                <div className="col-md-4 mb-4" key={goi.id}>
                                    <div className="card shadow-sm h-100" style={{ borderRadius: '15px', border: 'none', overflow: 'hidden' }}>
                                        <div style={{ width: '100%', height: '260px', overflow: 'hidden', backgroundColor: '#f2f2f2' }}>
                                            <img src={imgSrc} alt={goi.tenGoi} style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }} />
                                        </div>
                                        <div className="card-body d-flex flex-column text-center p-4">
                                            <h4 className="card-title fw-bold text-primary">{goi.tenGoi}</h4>
                                            <h5 className="text-danger fw-bold my-3">
                                                {goi.gia.toLocaleString('vi-VN')} VNĐ
                                            </h5>
                                            <p className="card-text text-muted mb-4">{goi.moTa}</p>

                                            {/* Nút này sẽ đẩy xuống dưới cùng thẻ card */}
                                            <button 
                                                className="btn btn-outline-primary mt-auto fw-bold py-2 rounded-pill" 
                                                onClick={() => handleChonGoi(goi)}
                                            >
                                                CHỌN GÓI NÀY
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // =====================================
    // GIAO DIỆN FORM ĐIỀN THÔNG TIN
    // =====================================
    return (
        <div style={{ backgroundColor: '#f3f5f9', minHeight: '100vh', padding: '40px 20px' }}>
            <div className="container" style={{ maxWidth: '600px' }}>
                
                {/* Nút Quay Lại Chọn Gói */}
                <button onClick={() => setGoiDaChon(null)} className="btn btn-link text-decoration-none fw-bold p-0 mb-3">
                    &#8592; Quay lại chọn gói khác
                </button>

                <div className="card shadow-sm" style={{ borderRadius: '20px', border: 'none' }}>
                    <div className="card-body p-4 p-md-5">
                        <h4 className="text-center fw-bold mb-4" style={{ color: '#0d6efd' }}>FORM ĐẶT TIỆC</h4>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label fw-bold text-primary">Gói tiệc bạn đang chọn:</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light text-primary fw-bold" 
                                    name="goiTiec"
                                    value={formData.goiTiec} 
                                    readOnly 
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Họ và Tên người đặt:</label>
                                <input type="text" className="form-control" name="hoTen" value={formData.hoTen} onChange={handleChange} required />
                            </div>
                            
                            <div className="mb-3">
                                <label className="form-label fw-bold">Số điện thoại liên hệ:</label>
                                <input type="tel" className="form-control" name="sdt" value={formData.sdt} onChange={handleChange} required />
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <label className="form-label fw-bold">Ngày diễn ra:</label>
                                    <input type="date" className="form-control" name="ngayDienRa" value={formData.ngayDienRa} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Giờ đến dự kiến:</label>
                                    <input type="time" className="form-control" name="gioDen" value={formData.gioDen} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Số lượng khách:</label>
                                <input type="number" min="1" className="form-control" name="soKhach" value={formData.soKhach} onChange={handleChange} required />
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">Yêu cầu đặc biệt (Ghi chú):</label>
                                <textarea className="form-control" name="ghiChu" rows="3" value={formData.ghiChu} onChange={handleChange} placeholder="Dị ứng đồ ăn, trang trí thêm nơ..."></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-pill shadow-sm">
                                XÁC NHẬN ĐẶT TIỆC
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatTiec;
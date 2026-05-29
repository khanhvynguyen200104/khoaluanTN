import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SuDung = () => {
    const [dsVe, setDsVe] = useState([]);
    const [selectedVe, setSelectedVe] = useState(null); 
    const navigate = useNavigate();

    const fetchDanhSachVe = useCallback(async () => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));

        if (!loggedInUser) {
            alert("Vui lòng đăng nhập để xem vé!");
            navigate('/dang-nhap');
            return;
        }

        try {
            const res = await fetch('http://localhost:8081/api/trang-su-dung/danh-sach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(loggedInUser.token ? { Authorization: `Bearer ${loggedInUser.token}` } : {})
                },
                body: JSON.stringify({ user: loggedInUser.tenDangNhap })
            });

            const data = await res.json();
            if (!res.ok) {
                console.error('Lỗi API danh sách vé:', data);
                setDsVe([]);
                return;
            }

            setDsVe(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi fetch vé:", err);
            setDsVe([]);
        }
    }, [navigate]);

    useEffect(() => {
        fetchDanhSachVe();
    }, [fetchDanhSachVe]);

    const handleXacNhanSuDung = async (ve) => {
        const xacNhan = window.confirm(
            ve.type === 'VE'
                ? "Xác nhận kích hoạt vé này để vào cổng?"
                : "Xác nhận đã giao đồ ăn cho khách?"
        );

        if (!xacNhan) return;

        try {
            const res = await fetch('http://localhost:8081/api/trang-su-dung/xac-nhan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: ve.id.toString(),
                    type: ve.type
                })
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                setSelectedVe(null);
                fetchDanhSachVe();
            } else {
                alert("Lỗi khi sử dụng hoặc mã đã được quét!");
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối Server!");
        }
    };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 20px' }}>
            <div className="container" style={{ maxWidth: '600px' }}>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold m-0 text-primary">🎟️ KHO VÉ & HÓA ĐƠN</h3>
                    <Link to="/" className="btn btn-outline-secondary btn-sm">Trang chủ</Link>
                </div>

                {dsVe.length === 0 ? (
                    <div className="text-center py-5 text-muted bg-white shadow-sm" style={{ borderRadius: '15px' }}>
                        <i className="bi bi-ticket-detailed fs-1 mb-3 d-block"></i>
                        <h5>Bạn chưa có dữ liệu nào.</h5>
                        <Link to="/mua-ve" className="btn btn-primary mt-3">Mua vé ngay</Link>
                    </div>
                ) : (
                    <div className="row g-3">
                        {dsVe.map((ve, index) => (
                            <div className="col-12" key={index}>
                                <div className="card shadow-sm border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                                    
                                    <div className={`p-3 d-flex justify-content-between align-items-center 
                                        ${ve.trangThai === 'Đã sử dụng'
                                            ? 'bg-secondary text-white'
                                            : (ve.type === 'FOOD' ? 'bg-warning text-dark' : 'bg-primary text-white')}`}>
                                        
                                        <h5 className="m-0 fw-bold">Mã: #{ve.displayId}</h5>

                                        <span className={`badge 
                                            ${ve.trangThai === 'Đã sử dụng'
                                                ? 'bg-light text-dark'
                                                : 'bg-danger text-white'}`}>
                                            {ve.trangThai}
                                        </span>
                                    </div>

                                    <div className="card-body">
                                        <p className="mb-2"><strong>Dịch vụ:</strong> {ve.loaiVe}</p>
                                        <p className="mb-2">
                                            <strong>Ngày:</strong>{" "}
                                            <span className="text-primary fw-bold">{ve.ngaySuDung}</span>
                                        </p>
                                        <p className="mb-3"><strong>Số lượng:</strong> {ve.soLuong}</p>
                                        
                                        {ve.trangThai === 'Thành công' ? (
                                            <button 
                                                onClick={() => setSelectedVe(ve)} 
                                                className={`btn w-100 fw-bold py-2 
                                                    ${ve.type === 'FOOD' ? 'btn-warning text-dark' : 'btn-primary'}`}>
                                                
                                                <i className="bi bi-qr-code-scan"></i>{" "}
                                                {ve.type === 'FOOD' ? 'NHẬN ĐỒ ĂN' : 'SỬ DỤNG VÉ'}
                                            </button>
                                        ) : (
                                            <button className="btn btn-secondary w-100 fw-bold py-2" disabled>
                                                <i className="bi bi-check-circle"></i> {ve.trangThai}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL */}
            {selectedVe && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ borderRadius: '20px' }}>
                            
                            <div className={`modal-header border-0 text-white 
                                ${selectedVe.type === 'FOOD' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                                
                                <h5 className="modal-title fw-bold mx-auto">
                                    {selectedVe.type === 'FOOD' ? 'MÃ NHẬN ĐỒ ĂN' : 'QUÉT MÃ VÀO CỔNG'}
                                </h5>

                                <button
                                    type="button"
                                    className="btn-close position-absolute end-0 me-3"
                                    onClick={() => setSelectedVe(null)}
                                ></button>
                            </div>

                            <div className="modal-body text-center p-4">
                                {/* ĐÃ SỬA: Cho data QR là mã vé (displayId) */}
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedVe.displayId}`} 
                                    alt="QR" 
                                />
                                
                                {/* ĐÃ SỬA: Hiển thị mã vé to, loại vé nhỏ ở dưới */}
                                <h3 className="mt-4 text-primary fw-bold">
                                    #{selectedVe.displayId}
                                </h3>
                                <p className="text-muted fs-5 mb-0">
                                    {selectedVe.loaiVe}
                                </p>
                            </div>

                            {/* ĐÃ SỬA: Căn giữa nút Đóng, xóa nút Xác nhận */}
                            <div className="modal-footer border-0 d-flex justify-content-center pb-4">
                                <button className="btn btn-secondary px-5 py-2 fw-bold" onClick={() => setSelectedVe(null)} style={{ borderRadius: '10px' }}>
                                    Đóng
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuDung;
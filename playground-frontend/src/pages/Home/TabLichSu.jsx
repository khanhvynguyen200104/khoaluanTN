import React, { useState, useEffect } from 'react';

const TabLichSu = ({ lichSuBanHang }) => {
    const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
    const [donHangChiTiet, setDonHangChiTiet] = useState(null);

    // ✅ Thêm: Bấm ESC để đóng modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setDonHangChiTiet(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const lichSuDaLoc = lichSuBanHang.filter(hd => 
        (hd.maVe && hd.maVe.toLowerCase().includes(tuKhoaTimKiem.toLowerCase())) ||
        (hd.soDienThoaiKhach && hd.soDienThoaiKhach.includes(tuKhoaTimKiem)) ||
        (hd.maVongTay && hd.maVongTay.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()))
    );

    return (
        <div className="bg-white p-4 rounded shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0">Lịch Sử Bán Hàng</h4>
                <div className="input-group" style={{ maxWidth: '350px' }}>
                    <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
                    <input type="text" className="form-control" placeholder="Tìm mã vé, vòng tay, SĐT..." value={tuKhoaTimKiem} onChange={(e) => setTuKhoaTimKiem(e.target.value)} />
                </div>
            </div>
            
            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Mã GD</th><th>Ngày Mua</th><th>Khách Hàng</th><th>Loại Dịch Vụ</th><th>Phương Thức</th><th>Tổng Tiền</th><th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lichSuDaLoc && lichSuDaLoc.length > 0 ? lichSuDaLoc.map((donHang) => (
                            <tr key={donHang.id}>
                                <td>#{donHang.id}</td>
                                <td>{donHang.ngayMua ? new Date(donHang.ngayMua).toLocaleString('vi-VN') : 'Vừa xong'}</td>
                                <td className="fw-bold">{donHang.soDienThoaiKhach || donHang.nguoiMua || 'Khách lẻ'}</td>
                                <td>
                                    {donHang.loaiGiaoDich === 'MUA_VE' ? <span className="badge bg-primary">Mua Vé</span> : donHang.loaiGiaoDich === 'MUA_VE + AN_UONG' ? <span className="badge bg-info text-dark">Vé & Đồ ăn</span> : <span className="badge bg-warning text-dark">Ăn Uống</span>}
                                </td>
                                <td>{donHang.phuongThucThanhToan === 'CHUYEN_KHOAN' ? <span className="badge bg-info text-dark">Chuyển khoản</span> : <span className="badge bg-success">Tiền mặt</span>}</td>
                                <td className="text-danger fw-bold">{donHang.tongTien ? donHang.tongTien.toLocaleString() : '0'} đ</td>
                                <td><button className="btn btn-sm btn-info text-white fw-bold shadow-sm" onClick={() => setDonHangChiTiet(donHang)}>Chi tiết</button></td>
                            </tr>
                        )) : (<tr><td colSpan="7" className="text-center text-muted py-4">Không tìm thấy giao dịch nào!</td></tr>)}
                    </tbody>
                </table>
            </div>

            {/* --- POPUP MODAL CHI TIẾT --- */}
            {donHangChiTiet && (
                <div 
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    onClick={() => setDonHangChiTiet(null)}
                >
                    <div 
                        className="bg-white p-4 rounded-4 shadow-lg" 
                        style={{ width: '450px', maxHeight: '90vh', overflowY: 'auto' }} // ✅ Thêm scroll nếu nội dung dài
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ✅ Thêm nút X để đóng */}
                        <button 
                            className="btn-close float-end mb-2" 
                            onClick={() => setDonHangChiTiet(null)}
                            aria-label="Close"
                        ></button>

                        <h4 className="fw-bold text-primary mb-3 text-center border-bottom pb-2">Chi Tiết Giao Dịch #{donHangChiTiet.id}</h4>
                        
                        <div className="mb-2 d-flex justify-content-between"><span className="text-muted">Khách hàng:</span><span className="fw-bold">{donHangChiTiet.soDienThoaiKhach || donHangChiTiet.nguoiMua || 'Khách vãng lai'}</span></div>
                        <div className="mb-2 d-flex justify-content-between"><span className="text-muted">Ngày giao dịch:</span><span>{donHangChiTiet.ngayMua ? new Date(donHangChiTiet.ngayMua).toLocaleString('vi-VN') : ''}</span></div>
                        <div className="mb-2 d-flex justify-content-between"><span className="text-muted">Phương thức:</span><span>{donHangChiTiet.phuongThucThanhToan === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'Tiền mặt'}</span></div>
                        
                        {(donHangChiTiet.loaiGiaoDich === 'MUA_VE' || donHangChiTiet.loaiGiaoDich === 'MUA_VE + AN_UONG' || donHangChiTiet.loaiVe) && (
                            <div className="bg-light p-3 rounded mt-3 mb-3 border">
                                <div className="mb-2"><strong>Loại vé:</strong> {donHangChiTiet.loaiVe || 'N/A'}</div>
                                {donHangChiTiet.maVe && (
                                    <div className="mb-2"><strong>Mã vé:</strong> <span className="text-danger fw-bold">{donHangChiTiet.maVe}</span></div>
                                )}
                                <div className="mb-2">
                                    <strong>Số lượng vé:</strong> <span className="badge bg-success fs-6 ms-2">{donHangChiTiet.soLuong || 0} vé</span>
                                </div>
                                {donHangChiTiet.maVongTay && (
                                    <div className="mb-1 mt-3 pt-2 border-top text-primary">
                                        <strong>Mã vòng tay:</strong> <span className="fw-bold ms-1">{donHangChiTiet.maVongTay}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                            <span className="fw-bold fs-5">Tổng thanh toán:</span><span className="fw-bold fs-4 text-danger">{donHangChiTiet.tongTien ? donHangChiTiet.tongTien.toLocaleString() : '0'} VNĐ</span>
                        </div>
                        <button className="btn btn-secondary w-100 py-2 mt-4 fw-bold" onClick={() => setDonHangChiTiet(null)}>Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default TabLichSu;
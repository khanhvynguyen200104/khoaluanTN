import React, { useState, useEffect } from 'react';

const HoaDonTab = () => {
    const [danhSachHoaDon, setDanhSachHoaDon] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHoaDon, setSelectedHoaDon] = useState(null);
    const [hoaDonLoading, setHoaDonLoading] = useState(true);
    const [hoaDonError, setHoaDonError] = useState('');
    const [showHuyModal, setShowHuyModal] = useState(false);
    const [hoaDonToCancel, setHoaDonToCancel] = useState(null);
    const [lyDoHuy, setLyDoHuy] = useState('');

    // Hàm hỗ trợ lấy Token chuẩn xác từ localStorage
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
        fetchHoaDon();
    }, []);

    const fetchHoaDon = () => {
        setHoaDonLoading(true);
        // 1. Lấy token bằng hàm helper
        const token = getToken(); 

        fetch('http://localhost:8081/api/admin/hoa-don', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // 2. Đính kèm token vào request
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
                return res.json();
            })
            .then(data => {
                // 3. Kiểm tra phải là mảng mới set State
                if (Array.isArray(data)) {
                    setDanhSachHoaDon(data);
                } else {
                    console.error("Dữ liệu trả về không phải mảng:", data);
                    setDanhSachHoaDon([]);
                    setHoaDonError('Dữ liệu từ máy chủ không hợp lệ.');
                }
            })
            .catch(err => { 
                console.error(err); 
                setHoaDonError('Không thể tải dữ liệu hóa đơn hoặc bạn chưa được cấp quyền.'); 
                setDanhSachHoaDon([]); // Chống sập trang khi có lỗi mạng/quyền
            })
            .finally(() => setHoaDonLoading(false));
    };

    // 4. Bảo vệ hàm filter, đảm bảo danhSachHoaDon luôn là mảng
    const filteredHoaDon = (Array.isArray(danhSachHoaDon) ? danhSachHoaDon : []).filter(hd => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (hd.maVe || `HD-${hd.id}`).toLowerCase().includes(q)
            || (hd.nguoiMua || '').toLowerCase().includes(q)
            || (hd.loaiGiaoDich || '').toLowerCase().includes(q)
            || (hd.trangThai || '').toLowerCase().includes(q)
            || String(hd.id).includes(q);
    });

    const openHuyHoaDonModal = (hoaDon) => {
        setHoaDonToCancel(hoaDon);
        setLyDoHuy('');
        setShowHuyModal(true);
    };

    const handleConfirmHuyHoaDon = async () => {
        if (!hoaDonToCancel || !lyDoHuy.trim()) return alert('Vui lòng nhập lý do hủy hóa đơn.');
        try {
            const token = getToken(); // Đã đổi sang dùng hàm lấy Token
            
            const res = await fetch(`http://localhost:8081/api/admin/hoa-don/${hoaDonToCancel.id}/huy`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ lyDo: lyDoHuy.trim() })
            });
            const data = await res.json().catch(() => ({ loi: `Lỗi server status ${res.status}` }));
            if (res.ok) {
                alert(data.message || 'Hủy hóa đơn thành công');
                setDanhSachHoaDon(prev => prev.map(item => item.id === hoaDonToCancel.id ? { ...item, trangThai: 'Đã hủy' } : item));
                setShowHuyModal(false);
            } else {
                alert(data.loi || 'Hủy thất bại');
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    return (
        <div className="card shadow mb-4">
            <div className="card-header bg-primary text-white py-3">
                <h6 className="m-0 fw-bold">Danh sách tất cả giao dịch (Web & Quầy POS)</h6>
            </div>
            <div className="card-body">
                <div className="mb-3 d-flex gap-2 align-items-center">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm hóa đơn theo mã, người mua, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>Xóa</button>
                </div>
                
                {hoaDonLoading ? (
                    <div className="text-center py-5">Đang tải hóa đơn...</div>
                ) : hoaDonError ? (
                    <div className="alert alert-danger">{hoaDonError}</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Mã GD</th><th>Loại GD</th><th>Người Mua</th><th>Giờ Vào</th><th>Giờ Ra</th><th>Tổng Tiền</th><th>Trạng Thái</th><th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHoaDon.map(hd => (
                                    <tr key={hd.id}>
                                        <td className="fw-bold">{hd.maVe || `HD-${hd.id}`}</td>
                                        <td><span className={`badge ${hd.loaiGiaoDich === 'AN_UONG' ? 'bg-warning text-dark' : 'bg-info'}`}>{hd.loaiGiaoDich || 'CHƯA RÕ'}</span></td>
                                        <td>{hd.nguoiMua || 'Khách vãng lai'}</td>
                                        <td>{hd.ngayMua ? new Date(hd.ngayMua).toLocaleTimeString('vi-VN') : 'Chưa rõ'}</td>
                                        <td>{hd.gioKhachVe ? new Date(hd.gioKhachVe).toLocaleTimeString('vi-VN') : '—'}</td>
                                        <td className="text-danger fw-bold">{hd.tongTien?.toLocaleString()} đ</td>
                                        <td><span className={`badge ${hd.trangThai?.includes('Thành công') ? 'bg-success' : 'bg-secondary'}`}>{hd.trangThai}</span></td>
                                        <td>
                                            <button className="btn btn-sm btn-primary me-2" onClick={() => setSelectedHoaDon(hd)}>Xem</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => openHuyHoaDonModal(hd)} disabled={hd.trangThai?.toLowerCase().includes('hủy')}>Hủy</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Xem Chi Tiết Hóa Đơn */}
            {selectedHoaDon && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chi tiết hóa đơn #{selectedHoaDon.id}</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedHoaDon(null)} />
                            </div>
                            <div className="modal-body row">
                                <div className="col-md-6 mb-3"><b>Người mua:</b> {selectedHoaDon.nguoiMua}</div>
                                <div className="col-md-6 mb-3"><b>Số tiền:</b> <span className="text-danger">{selectedHoaDon.tongTien?.toLocaleString()} đ</span></div>
                                <div className="col-md-6 mb-3"><b>Trạng thái:</b> {selectedHoaDon.trangThai}</div>
                                <div className="col-md-6 mb-3"><b>Giờ Vào:</b> {selectedHoaDon.ngayMua ? new Date(selectedHoaDon.ngayMua).toLocaleTimeString('vi-VN') : 'Chưa rõ'}</div>
                                <div className="col-md-6 mb-3"><b>Giờ Ra:</b> {selectedHoaDon.gioKhachVe ? new Date(selectedHoaDon.gioKhachVe).toLocaleTimeString('vi-VN') : '—'}</div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setSelectedHoaDon(null)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Hủy Hóa Đơn */}
            {showHuyModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Xác nhận hủy hóa đơn #{hoaDonToCancel?.id}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowHuyModal(false)} />
                            </div>
                            <div className="modal-body">
                                <textarea className="form-control" rows={3} value={lyDoHuy} onChange={(e) => setLyDoHuy(e.target.value)} placeholder="Nhập lý do hủy..." />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowHuyModal(false)}>Hủy</button>
                                <button className="btn btn-danger" onClick={handleConfirmHuyHoaDon}>Xác nhận hủy</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HoaDonTab;
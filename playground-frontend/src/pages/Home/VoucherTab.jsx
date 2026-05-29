import React, { useState, useEffect } from 'react';

const VoucherTab = () => {
    const [vouchers, setVouchers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        maCode: '',
        tenUuDai: '',
        phanTramGiam: 0,
        ngayKetThuc: '',
        trangThai: 'DANG_HOAT_DONG'
    });

    // --- HÀM LẤY TOKEN TỪ LOCALSTORAGE ---
    const getToken = () => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const userObj = JSON.parse(userString);
                return userObj.token || userObj.accessToken || userObj.jwt || '';
            }
            return '';
        } catch (error) {
            return '';
        }
    };

    useEffect(() => {
        loadVouchers();
    }, []);

    const loadVouchers = async () => {
        setIsLoading(true);
        setErrorMessage('');
        const token = getToken(); // Lấy token

        try {
            const res = await fetch('http://localhost:8081/api/admin/voucher', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Gắn token vào request
                }
            });
            
            if (!res.ok) {
                throw new Error('Không lấy được voucher admin');
            }
            
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setVouchers(data);
                return;
            }

            // Nếu admin endpoint trả về rỗng, thử fallback lấy từ trang khách
            const fallbackRes = await fetch('http://localhost:8081/api/voucher/danh-sach');
            if (!fallbackRes.ok) {
                throw new Error('Không lấy được voucher từ endpoint public');
            }
            const fallbackData = await fallbackRes.json();
            setVouchers(fallbackData);
            setErrorMessage('Đã tải voucher từ endpoint công khai vì admin chưa trả về dữ liệu.');
        } catch (err) {
            console.error(err);
            setErrorMessage('Lỗi tải voucher: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const openAddModal = () => {
        setSelectedVoucher(null);
        setFormData({
            maCode: '',
            tenUuDai: '',
            phanTramGiam: 0,
            ngayKetThuc: '',
            trangThai: 'DANG_HOAT_DONG'
        });
        setShowModal(true);
    };

    const openEditModal = (voucher) => {
        setSelectedVoucher(voucher);
        setFormData({
            maCode: voucher.maCode || '',
            tenUuDai: voucher.tenUuDai || '',
            phanTramGiam: voucher.phanTramGiam || 0,
            ngayKetThuc: voucher.ngayKetThuc ? voucher.ngayKetThuc.substring(0, 10) : '',
            trangThai: voucher.trangThai || 'DANG_HOAT_DONG'
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const token = getToken(); // Lấy token
        const method = selectedVoucher ? 'PUT' : 'POST';
        const url = selectedVoucher 
            ? `http://localhost:8081/api/admin/voucher/${selectedVoucher.id}` 
            : 'http://localhost:8081/api/admin/voucher';

        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Gắn token vào request lưu/sửa
                },
                body: JSON.stringify(formData)
            });
            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || 'Lỗi lưu voucher');
            }
            loadVouchers();
            setShowModal(false);
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) return;
        const token = getToken(); // Lấy token

        try {
            const res = await fetch(`http://localhost:8081/api/admin/voucher/${id}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // Gắn token vào request xóa
                }
            });
            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || 'Lỗi xóa voucher');
            }
            loadVouchers();
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    return (
        <div className="card shadow mb-4">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h6 className="m-0 fw-bold">🎟️ Quản Lý Voucher</h6>
                <button className="btn btn-light fw-bold" onClick={openAddModal}>➕ Thêm Voucher</button>
            </div>
            <div className="card-body">
                {errorMessage && (
                    <div className="alert alert-warning py-2 mb-3" role="alert">
                        {errorMessage}
                    </div>
                )}
                {isLoading ? (
                    <div className="text-center py-5">Đang tải voucher...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Mã</th>
                                    <th>Tên ưu đãi</th>
                                    <th>Giảm (%)</th>
                                    <th>HSD</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vouchers.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center">Không có voucher</td></tr>
                                ) : vouchers.map(voucher => (
                                    <tr key={voucher.id}>
                                        <td>{voucher.maCode}</td>
                                        <td>{voucher.tenUuDai}</td>
                                        <td>{voucher.phanTramGiam}%</td>
                                        <td>{voucher.ngayKetThuc ? new Date(voucher.ngayKetThuc).toLocaleDateString('vi-VN') : 'Không hạn'}</td>
                                        <td>{voucher.trangThai}</td>
                                        <td>
                                            <button className="btn btn-sm btn-primary me-2" onClick={() => openEditModal(voucher)}>Sửa</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(voucher.id)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedVoucher ? 'Sửa Voucher' : 'Thêm Voucher mới'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Mã voucher</label>
                                        <input
                                            className="form-control"
                                            value={formData.maCode}
                                            onChange={e => setFormData({ ...formData, maCode: e.target.value.toUpperCase() })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Tên ưu đãi</label>
                                        <input
                                            className="form-control"
                                            value={formData.tenUuDai}
                                            onChange={e => setFormData({ ...formData, tenUuDai: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3 row">
                                        <div className="col-6">
                                            <label className="form-label">Phần trăm giảm</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.phanTramGiam}
                                                onChange={e => setFormData({ ...formData, phanTramGiam: parseInt(e.target.value, 10) || 0 })}
                                                min="0"
                                                max="100"
                                                required
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label">Ngày hết hạn</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.ngayKetThuc}
                                                onChange={e => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Trạng thái</label>
                                        <select
                                            className="form-select"
                                            value={formData.trangThai}
                                            onChange={e => setFormData({ ...formData, trangThai: e.target.value })}
                                        >
                                            <option value="DANG_HOAT_DONG">Đang hoạt động</option>
                                            <option value="DA_SU_DUNG">Đã sử dụng</option>
                                            <option value="HET_HAN">Hết hạn</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="btn btn-success">Lưu</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherTab;
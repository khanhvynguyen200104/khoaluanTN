import React, { useState, useEffect } from 'react';

const TRANG_THAI_DON_DAT = [
    { value: 'CHO_XU_LY', label: 'Đang chờ xử lý' },
    { value: 'DA_XAC_NHAN', label: 'Đã xác nhận' },
    { value: 'HOAN_THANH', label: 'Hoàn thành' },
    { value: 'DA_HUY', label: 'Đã hủy' }
];

const chuanHoaTrangThai = (trangThai) => {
    const giaTri = (trangThai || '').trim();
    const thuong = giaTri.toUpperCase();

    switch (thuong) {
        case 'CHO_XU_LY':
        case 'ĐANG CHỜ XỬ LÝ':
            return 'CHO_XU_LY';
        case 'DA_XAC_NHAN':
        case 'ĐÃ XÁC NHẬN':
            return 'DA_XAC_NHAN';
        case 'HOAN_THANH':
        case 'HOÀN THÀNH':
            return 'HOAN_THANH';
        case 'DA_HUY':
        case 'ĐÃ HỦY':
        case 'ĐÃ HUỶ':
            return 'DA_HUY';
        default:
            return giaTri;
    }
};

const chuyenTrangThaiSangNhan = (trangThai) => {
    const trangThaiTimThay = TRANG_THAI_DON_DAT.find((item) => item.value === chuanHoaTrangThai(trangThai) || item.label === trangThai);
    return trangThaiTimThay ? trangThaiTimThay.label : (trangThai || '');
};

const QuanLyTiecTab = () => {
    const API_BASE = 'http://localhost:8081';
    const [activeTab, setActiveTab] = useState('GOI_TIEC'); // 'GOI_TIEC' hoặc 'DON_DAT'
    
    // State cho Gói Tiệc
    const [goiTiecs, setGoiTiecs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedGoi, setSelectedGoi] = useState(null);
    const [formData, setFormData] = useState({ tenGoi: '', gia: 0, moTa: '' });

    // State cho Đơn Đặt
    const [donDats, setDonDats] = useState([]);

    const getToken = () => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const userObj = JSON.parse(userString);
                return userObj.token || userObj.accessToken || userObj.jwt || localStorage.getItem('token') || '';
            }
            return localStorage.getItem('token') || '';
        } catch (error) { return localStorage.getItem('token') || ''; }
    };

    const getErrorMessage = async (res, fallback) => {
        try {
            const data = await res.json();
            return data.loi || data.error || data.message || fallback;
        } catch (_) {
            return fallback;
        }
    };

    // Load dữ liệu khi chuyển tab
    useEffect(() => {
        if (activeTab === 'GOI_TIEC') loadGoiTiecs();
        else loadDonDats();
    }, [activeTab]);

    // ==========================================
    // API GÓI TIỆC
    // ==========================================
    const loadGoiTiecs = async () => {
        try {
            const token = getToken();
            if (!token) {
                alert('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
                return;
            }
            const res = await fetch(`${API_BASE}/api/admin/tiec/goi-tiec`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setGoiTiecs(await res.json());
                return;
            }

            const msg = await getErrorMessage(res, 'Không tải được danh sách gói tiệc');
            alert(msg);
        } catch (err) { console.error("Lỗi tải gói tiệc", err); }
    };

    const handleSaveGoi = async (e) => {
        e.preventDefault();
        const token = getToken();
        if (!token) {
            alert('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
            return;
        }

        const payload = {
            ...formData,
            tenGoi: (formData.tenGoi || '').trim(),
            moTa: (formData.moTa || '').trim(),
            gia: Number(formData.gia)
        };

        if (!payload.tenGoi) {
            alert('Tên gói không được để trống');
            return;
        }
        if (!Number.isFinite(payload.gia) || payload.gia < 0) {
            alert('Giá gói không hợp lệ');
            return;
        }

        const method = selectedGoi ? 'PUT' : 'POST';
        const url = selectedGoi 
            ? `${API_BASE}/api/admin/tiec/goi-tiec/${selectedGoi.id}`
            : `${API_BASE}/api/admin/tiec/goi-tiec`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                loadGoiTiecs();
                setShowModal(false);
            } else {
                const msg = await getErrorMessage(res, 'Lỗi lưu gói tiệc');
                alert(msg);
            }
        } catch (err) { alert("Lỗi kết nối!"); }
    };

    const handleDeleteGoi = async (id) => {
        if (!window.confirm("Xóa gói tiệc này?")) return;
        try {
            const res = await fetch(`${API_BASE}/api/admin/tiec/goi-tiec/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) loadGoiTiecs();
        } catch (err) { alert("Lỗi xóa!"); }
    };

    const openModal = (goi = null) => {
        setSelectedGoi(goi);
        setFormData(goi ? { ...goi } : { tenGoi: '', gia: 0, moTa: '' });
        setShowModal(true);
    };

    // ==========================================
    // API ĐƠN ĐẶT TIỆC
    // ==========================================
    const loadDonDats = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/tiec/don-dat`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (res.ok) setDonDats(await res.json());
        } catch (err) { console.error("Lỗi tải đơn đặt", err); }
    };

    const handleChangeTrangThai = async (id, trangThaiMoi) => {
        const trangThaiDaChuanHoa = chuanHoaTrangThai(trangThaiMoi);
        if (!window.confirm(`Chuyển đơn này sang: ${chuyenTrangThaiSangNhan(trangThaiDaChuanHoa)}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/admin/tiec/don-dat/${id}/trang-thai`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ trangThai: trangThaiDaChuanHoa })
            });
            if (res.ok) {
                loadDonDats();
            } else {
                const msg = await getErrorMessage(res, 'Lỗi cập nhật trạng thái!');
                alert(msg);
                console.error('Cập nhật trạng thái lỗi:', msg, await res.text().catch(() => ''));
            }
        } catch (err) { alert("Lỗi kết nối!"); }
    };

    return (
        <div className="card shadow mb-4">
            <div className="card-header bg-primary text-white d-flex align-items-center gap-3">
                <h6 className="m-0 fw-bold me-auto">🎉 Quản Lý Đặt Tiệc</h6>
                
                {/* NÚT CHUYỂN TAB */}
                <div className="btn-group bg-white rounded p-1">
                    <button 
                        className={`btn btn-sm ${activeTab === 'GOI_TIEC' ? 'btn-primary fw-bold' : 'btn-light'}`}
                        onClick={() => setActiveTab('GOI_TIEC')}
                    >Gói Tiệc</button>
                    <button 
                        className={`btn btn-sm ${activeTab === 'DON_DAT' ? 'btn-primary fw-bold' : 'btn-light'}`}
                        onClick={() => setActiveTab('DON_DAT')}
                    >Đơn Đặt Khách</button>
                </div>

                {activeTab === 'GOI_TIEC' && (
                    <button className="btn btn-warning btn-sm fw-bold ms-3" onClick={() => openModal()}>
                        ➕ Thêm Gói
                    </button>
                )}
            </div>

            <div className="card-body">
                {/* ---------- MÀN HÌNH GÓI TIỆC ---------- */}
                {activeTab === 'GOI_TIEC' && (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Tên Gói</th>
                                    <th>Giá (VNĐ)</th>
                                    <th style={{ width: '40%' }}>Mô tả</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {goiTiecs.length === 0 ? <tr><td colSpan="4" className="text-center">Chưa có gói tiệc nào</td></tr> : null}
                                {goiTiecs.map(goi => (
                                    <tr key={goi.id}>
                                        <td className="fw-bold text-primary">{goi.tenGoi}</td>
                                        <td className="text-danger fw-bold">{goi.gia.toLocaleString()} đ</td>
                                        <td>{goi.moTa}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openModal(goi)}>Sửa</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteGoi(goi.id)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ---------- MÀN HÌNH ĐƠN ĐẶT TIỆC ---------- */}
                {activeTab === 'DON_DAT' && (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover align-middle" style={{ fontSize: '14px' }}>
                            <thead className="table-light">
                                <tr>
                                    <th>Khách hàng</th>
                                    <th>SĐT</th>
                                    <th>Gói chọn</th>
                                    <th>Thời gian tổ chức</th>
                                    <th>Số lượng</th>
                                    <th>Ghi chú</th>
                                    <th>Ngày tạo đơn</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donDats.length === 0 ? <tr><td colSpan="8" className="text-center">Chưa có đơn đặt nào</td></tr> : null}
                                {donDats.map(don => (
                                    <tr key={don.id}>
                                        <td className="fw-bold">{don.tenTaiKhoan}</td>
                                        <td>{don.soDienThoai}</td>
                                        <td className="text-primary fw-bold">{don.trungTam}</td>
                                        <td>{don.ngayToChuc}</td>
                                        <td className="text-center">{don.soLuongKhach} bé</td>
                                        <td className="text-muted fst-italic">{don.yeuCauThem}</td>
                                        <td>{don.ngayDat}</td>
                                        <td>
                                            {/* Dropdown đổi trạng thái cực nhanh */}
                                            {(() => {
                                                const trangThaiHienTai = chuanHoaTrangThai(don.trangThai);
                                                const classNameTrangThai =
                                                    trangThaiHienTai === 'DA_XAC_NHAN' ? 'text-success border-success' :
                                                    trangThaiHienTai === 'HOAN_THANH' ? 'text-primary border-primary' :
                                                    trangThaiHienTai === 'DA_HUY' ? 'text-danger border-danger' :
                                                    'text-warning border-warning';

                                                return (
                                            <select 
                                                className={`form-select form-select-sm fw-bold ${classNameTrangThai}`}
                                                value={trangThaiHienTai}
                                                onChange={(e) => handleChangeTrangThai(don.id, e.target.value)}
                                            >
                                                {TRANG_THAI_DON_DAT.map((item) => (
                                                    <option key={item.value} value={item.value}>{item.label}</option>
                                                ))}
                                            </select>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ---------- MODAL THÊM/SỬA GÓI TIỆC ---------- */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold text-primary">{selectedGoi ? 'Sửa Gói Tiệc' : 'Thêm Gói Mới'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                            </div>
                            <form onSubmit={handleSaveGoi}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Tên gói tiệc</label>
                                        <input className="form-control" required value={formData.tenGoi}
                                            onChange={e => setFormData({ ...formData, tenGoi: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Giá tiền (VNĐ)</label>
                                        <input type="number" className="form-control" required min="0" value={formData.gia}
                                            onChange={e => setFormData({ ...formData, gia: Number(e.target.value) })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Mô tả chi tiết</label>
                                        <textarea className="form-control" rows="4" required value={formData.moTa}
                                            onChange={e => setFormData({ ...formData, moTa: e.target.value })}></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="btn btn-primary">Lưu Lại</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuanLyTiecTab;
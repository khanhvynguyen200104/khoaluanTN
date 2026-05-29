import React, { useState, useEffect } from 'react';

const NguoiDungTab = () => {
    const [danhSachNguoiDung, setDanhSachNguoiDung] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [nguoiDungLoading, setNguoiDungLoading] = useState(true);
    const [nguoiDungError, setNguoiDungError] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedNguoiDung, setSelectedNguoiDung] = useState(null);
    const [editForm, setEditForm] = useState({
        hoTen: '',
        email: '',
        soDienThoai: '',
        danhSachVaiTro: '',
        hangThanhVien: ''
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        tenDangNhap: '',
        matKhau: '',
        hoTen: '',
        email: '',
        soDienThoai: '',
        danhSachVaiTro: 'USER',
        hangThanhVien: 'Thường'
    });

    // Hàm hỗ trợ lấy Token chuẩn xác từ localStorage
    const getToken = () => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const userObj = JSON.parse(userString);
                // Hỗ trợ cả trường hợp token lưu là 'token' hoặc 'accessToken'
                return userObj.token || userObj.accessToken || ''; 
            }
            return localStorage.getItem('token') || '';
        } catch (error) {
            return localStorage.getItem('token') || '';
        }
    };

    useEffect(() => {
        loadNguoiDung();
    }, []);

    const loadNguoiDung = () => {
        setNguoiDungLoading(true);
        setNguoiDungError('');
        const token = getToken(); // Đã sửa lại cách lấy token

        fetch('http://localhost:8081/api/admin/nguoi-dung', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setDanhSachNguoiDung(data);
                } else {
                    console.error("Dữ liệu trả về không phải là mảng:", data);
                    setDanhSachNguoiDung([]);
                    setNguoiDungError('Dữ liệu từ máy chủ không hợp lệ.');
                }
            })
            .catch(err => {
                console.error(err);
                setNguoiDungError('Không thể tải dữ liệu người dùng hoặc bạn không có quyền.');
                setDanhSachNguoiDung([]); 
            })
            .finally(() => setNguoiDungLoading(false));
    };

    const filteredNguoiDung = (Array.isArray(danhSachNguoiDung) ? danhSachNguoiDung : []).filter(nd => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (nd.tenDangNhap || '').toLowerCase().includes(q)
            || (nd.hoTen || '').toLowerCase().includes(q)
            || (nd.email || '').toLowerCase().includes(q)
            || (nd.soDienThoai || '').toLowerCase().includes(q)
            || String(nd.maNguoiDung).includes(q);
    });

    const handleEditNguoiDung = async (e) => {
        e.preventDefault();
        if (!selectedNguoiDung) return;

        try {
            const token = getToken(); // Đã sửa lại cách lấy token
            const res = await fetch(`http://localhost:8081/api/admin/nguoi-dung/${selectedNguoiDung.maNguoiDung}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(editForm)
            });
            const data = await res.json();

            if (res.ok) {
                alert(data.message || 'Cập nhật người dùng thành công');
                loadNguoiDung();
                setShowEditModal(false);
                setSelectedNguoiDung(null);
            } else {
                alert(data.loi || 'Lỗi khi cập nhật người dùng');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi: ' + error.message);
        }
    };

    const handleAddNguoiDung = async (e) => {
        e.preventDefault();

        if (!addForm.tenDangNhap.trim()) {
            alert('Vui lòng nhập tên đăng nhập');
            return;
        }
        if (!addForm.matKhau.trim()) {
            alert('Vui lòng nhập mật khẩu');
            return;
        }

        try {
            const token = getToken(); // Đã sửa lại cách lấy token
            const res = await fetch('http://localhost:8081/api/admin/nguoi-dung', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(addForm)
            });
            const data = await res.json();

            if (res.ok) {
                alert(data.message || 'Thêm người dùng thành công');
                loadNguoiDung();
                setShowAddModal(false);
                setAddForm({
                    tenDangNhap: '',
                    matKhau: '',
                    hoTen: '',
                    email: '',
                    soDienThoai: '',
                    danhSachVaiTro: 'USER',
                    hangThanhVien: 'Thường'
                });
            } else {
                alert(data.loi || 'Lỗi khi thêm người dùng: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi: ' + error.message);
        }
    };

    const handleDeleteNguoiDung = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa người dùng này?')) return;

        try {
            const token = getToken(); // Đã sửa lại cách lấy token
            const res = await fetch(`http://localhost:8081/api/admin/nguoi-dung/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            const data = await res.json();

            if (res.ok) {
                alert(data.message || 'Xóa người dùng thành công');
                loadNguoiDung();
            } else {
                alert(data.loi || 'Lỗi khi xóa người dùng');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi: ' + error.message);
        }
    };

    const openEditModal = (nguoiDung) => {
        setSelectedNguoiDung(nguoiDung);
        setEditForm({
            hoTen: nguoiDung.hoTen || '',
            email: nguoiDung.email || '',
            soDienThoai: nguoiDung.soDienThoai || '',
            danhSachVaiTro: nguoiDung.danhSachVaiTro || '',
            hangThanhVien: nguoiDung.hangThanhVien || ''
        });
        setShowEditModal(true);
    };

    return (
        <div className="card shadow mb-4">
            <div className="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
                <h6 className="m-0 fw-bold">👥 Quản lý người dùng</h6>
                <button 
                    type="button" 
                    className="btn btn-light btn-sm"
                    onClick={() => setShowAddModal(true)}
                >
                    ➕ Thêm người dùng mới
                </button>
            </div>
            <div className="card-body">
                <div className="mb-3 d-flex gap-2 flex-column flex-md-row align-items-center">
                    <div className="flex-grow-1">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm người dùng theo tên đăng nhập, họ tên, email hoặc SĐT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                        Xóa tìm kiếm
                    </button>
                </div>

                {nguoiDungLoading ? (
                    <div className="text-center py-5 text-muted">Đang tải người dùng...</div>
                ) : nguoiDungError ? (
                    <div className="alert alert-danger">{nguoiDungError}</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Tên đăng nhập</th>
                                    <th>Họ tên</th>
                                    <th>Email</th>
                                    <th>SĐT</th>
                                    <th>Vai trò</th>
                                    <th>Hạng thành viên</th>
                                    <th>Tổng chi tiêu</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredNguoiDung.length === 0 ? (
                                    <tr><td colSpan="9" className="text-center">Không tìm thấy người dùng phù hợp.</td></tr>
                                ) : (
                                    filteredNguoiDung.map(nd => (
                                        <tr key={nd.maNguoiDung}>
                                            <td className="fw-bold">#{nd.maNguoiDung}</td>
                                            <td>{nd.tenDangNhap}</td>
                                            <td>{nd.hoTen || 'Chưa cập nhật'}</td>
                                            <td>{nd.email || 'Chưa cập nhật'}</td>
                                            <td>{nd.soDienThoai || 'Chưa cập nhật'}</td>
                                            <td>
                                                <span className={`badge ${nd.danhSachVaiTro?.includes('ADMIN') ? 'bg-danger' : 'bg-info'}`}>
                                                    {nd.danhSachVaiTro || 'USER'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${nd.hangThanhVien === 'VIP' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                    {nd.hangThanhVien || 'Thường'}
                                                </span>
                                            </td>
                                            <td className="text-danger fw-bold">
                                                {nd.tongChiTieu ? nd.tongChiTieu.toLocaleString() + ' đ' : '0 đ'}
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => openEditModal(nd)}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteNguoiDung(nd.maNguoiDung)}
                                                        disabled={nd.danhSachVaiTro?.includes('ADMIN')}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL CHỈNH SỬA NGƯỜI DÙNG */}
            {showEditModal && selectedNguoiDung && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chỉnh sửa người dùng #{selectedNguoiDung.maNguoiDung}</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowEditModal(false)} />
                            </div>
                            <form onSubmit={handleEditNguoiDung}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Tên đăng nhập</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={selectedNguoiDung.tenDangNhap}
                                                disabled
                                            />
                                            <small className="text-muted">Không thể thay đổi tên đăng nhập</small>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Họ tên</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editForm.hoTen}
                                                onChange={(e) => setEditForm({ ...editForm, hoTen: e.target.value })}
                                                placeholder="Nhập họ tên"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                placeholder="Nhập email"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Số điện thoại</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={editForm.soDienThoai}
                                                onChange={(e) => setEditForm({ ...editForm, soDienThoai: e.target.value })}
                                                placeholder="Nhập số điện thoại"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Vai trò</label>
                                            <select
                                                className="form-control"
                                                value={editForm.danhSachVaiTro}
                                                onChange={(e) => setEditForm({ ...editForm, danhSachVaiTro: e.target.value })}
                                            >
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="STAFF">STAFF</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Hạng thành viên</label>
                                            <select
                                                className="form-control"
                                                value={editForm.hangThanhVien}
                                                onChange={(e) => setEditForm({ ...editForm, hangThanhVien: e.target.value })}
                                            >
                                                <option value="Thường">Thường</option>
                                                <option value="VIP">VIP</option>
                                                <option value="Premium">Premium</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL THÊM NGƯỜI DÙNG MỚI */}
            {showAddModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">➕ Thêm người dùng mới</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowAddModal(false)} />
                            </div>
                            <form onSubmit={handleAddNguoiDung}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Tên đăng nhập <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={addForm.tenDangNhap}
                                                onChange={(e) => setAddForm({ ...addForm, tenDangNhap: e.target.value })}
                                                placeholder="Nhập tên đăng nhập"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Mật khẩu <span className="text-danger">*</span></label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={addForm.matKhau}
                                                onChange={(e) => setAddForm({ ...addForm, matKhau: e.target.value })}
                                                placeholder="Nhập mật khẩu"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Họ tên</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={addForm.hoTen}
                                                onChange={(e) => setAddForm({ ...addForm, hoTen: e.target.value })}
                                                placeholder="Nhập họ tên"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={addForm.email}
                                                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                                placeholder="Nhập email"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Số điện thoại</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={addForm.soDienThoai}
                                                onChange={(e) => setAddForm({ ...addForm, soDienThoai: e.target.value })}
                                                placeholder="Nhập số điện thoại"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Vai trò</label>
                                            <select
                                                className="form-control"
                                                value={addForm.danhSachVaiTro}
                                                onChange={(e) => setAddForm({ ...addForm, danhSachVaiTro: e.target.value })}
                                            >
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="STAFF">STAFF</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-bold">Hạng thành viên</label>
                                            <select
                                                className="form-control"
                                                value={addForm.hangThanhVien}
                                                onChange={(e) => setAddForm({ ...addForm, hangThanhVien: e.target.value })}
                                            >
                                                <option value="Thường">Thường</option>
                                                <option value="VIP">VIP</option>
                                                <option value="Premium">Premium</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-success">
                                        ➕ Thêm người dùng
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NguoiDungTab;
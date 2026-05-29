import React, { useState, useEffect } from 'react';

const SanPhamTab = () => {
    const [danhSachMonAn, setDanhSachMonAn] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedMonAn, setSelectedMonAn] = useState(null);
    const [isUploading, setIsUploading] = useState(false); // State báo hiệu đang tải ảnh
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [restockMonAn, setRestockMonAn] = useState(null);
    const [restockAmount, setRestockAmount] = useState(0);
    
    const [newMonAn, setNewMonAn] = useState({ tenMon: '', gia: '', hinhAnh: '', moTa: '', loai: 'DO_AN', soLuongTon: 0 });
    const API_BASE = 'http://localhost:8081/api/admin';

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
        fetchMonAn();
    }, []);

    const fetchMonAn = () => {
        setIsLoading(true);
        const token = getToken(); // 1. Lấy token

        fetch(`${API_BASE}/mon-an`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // 2. Gửi token
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
                return res.json();
            })
            .then(data => {
                setDanhSachMonAn(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error(err);
                setDanhSachMonAn([]);
            })
            .finally(() => setIsLoading(false));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const url = selectedMonAn ? `${API_BASE}/mon-an/${selectedMonAn.id}` : `${API_BASE}/mon-an`;
        const method = selectedMonAn ? 'PUT' : 'POST';
        const token = getToken();

        try {
            const res = await fetch(url, { 
                method, 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Đính kèm token khi lưu
                }, 
                body: JSON.stringify(newMonAn) 
            });
            if (res.ok) {
                alert('Lưu món ăn thành công');
                fetchMonAn();
                setShowModal(false);
            } else {
                alert('Lỗi khi lưu món ăn');
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa món này?')) return;
        const token = getToken();

        try {
            const res = await fetch(`${API_BASE}/mon-an/${id}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // Đính kèm token khi xóa
                }
            });
            if (res.ok) {
                alert('Xóa thành công');
                fetchMonAn();
            } else {
                alert('Xóa thất bại. Món này có thể đang nằm trong lịch sử hóa đơn.');
            }
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleRestockOpen = (mon) => {
        setRestockMonAn(mon);
        setRestockAmount(0);
        setShowRestockModal(true);
    };

    const handleRestockSubmit = async (e) => {
        e.preventDefault();
        if (!restockMonAn) return;
        const quantity = parseInt(restockAmount, 10);
        if (isNaN(quantity) || quantity <= 0) {
            alert('Vui lòng nhập số lượng hợp lệ lớn hơn 0');
            return;
        }

        const updatedMonAn = {
            ...restockMonAn,
            soLuongTon: (restockMonAn.soLuongTon || 0) + quantity,
        };

        const token = getToken();

        try {
            const res = await fetch(`${API_BASE}/mon-an/${restockMonAn.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Đính kèm token khi cập nhật tồn kho
                },
                body: JSON.stringify(updatedMonAn),
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message || 'Nhập thêm tồn kho thành công');
                fetchMonAn();
                setShowRestockModal(false);
                setRestockMonAn(null);
            } else {
                alert(data.loi || 'Lỗi khi nhập thêm tồn kho');
            }
        } catch (error) {
            console.error(error);
            alert('Lỗi: ' + error.message);
        }
    };

    // HÀM UPLOAD ẢNH LÊN CLOUDINARY
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 🛑 BẠN PHẢI THAY 2 BIẾN NÀY BẰNG THÔNG TIN CỦA BẠN 🛑
        const cloudName = 'dz9mrpnpj'; // Ví dụ: dxyz123ab
        const uploadPreset = 'do_an_nuoc_uong'; // Ví dụ: ban_do_an

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        setIsUploading(true);
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            
            if (data.secure_url) {
                // Upload thành công, lưu link ảnh vào state
                setNewMonAn({ ...newMonAn, hinhAnh: data.secure_url });
            } else {
                alert("Lỗi upload: " + data.error.message);
            }
        } catch (error) {
            console.error("Lỗi khi upload ảnh:", error);
            alert("Không thể kết nối đến máy chủ upload ảnh!");
        } finally {
            setIsUploading(false);
        }
    };

    const openEditModal = (mon) => {
        setSelectedMonAn(mon);
        setNewMonAn({ 
            tenMon: mon.tenMon || mon.ten || '', 
            gia: mon.gia || mon.donGia || '', 
            hinhAnh: mon.hinhAnh || mon.anh || '', 
            moTa: mon.moTa || mon.chiTiet || '',
            loai: mon.loai || 'DO_AN',
            soLuongTon: mon.soLuongTon || mon.soLuong || 0
        });
        setShowModal(true);
    };

    const openAddModal = () => {
        setSelectedMonAn(null);
        setNewMonAn({ tenMon: '', gia: '', hinhAnh: '', moTa: '', loai: 'DO_AN', soLuongTon: 0 });
        setShowModal(true);
    };

    return (
        <div className="card shadow mb-4">
            <div className="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
                <h6 className="m-0 fw-bold">🍔 Quản lý Đồ Ăn / Nước Uống</h6>
                <button className="btn btn-light fw-bold" onClick={openAddModal}>➕ Thêm Món</button>
            </div>
            <div className="card-body">
                <div className="mb-4">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Nhập tên món ăn cần tìm..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                
                {isLoading ? <div className="text-center py-5">Đang tải thực đơn...</div> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                        {(Array.isArray(danhSachMonAn) ? danhSachMonAn : []).filter(mon => {
                            const ten = mon.tenMon || mon.ten || '';
                            return ten.toLowerCase().includes(searchTerm.toLowerCase());
                        }).map(mon => {
                            const tenMon = mon.tenMon || mon.ten || 'Chưa có tên';
                            const giaMon = mon.gia || mon.donGia || 0;
                            const hinhAnhMon = mon.hinhAnh || mon.anh || 'https://via.placeholder.com/150?text=No+Image';

                            return (
                                <div key={mon.id} className="card shadow-sm h-100 overflow-hidden">
                                    <img src={hinhAnhMon} alt={tenMon} style={{ height: '180px', objectFit: 'cover' }} 
                                         onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Lỗi+Ảnh'}/>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h6 className="card-title fw-bold text-truncate mb-0" style={{maxWidth: '70%'}}>{tenMon}</h6>
                                            <span className={`badge ${mon.loai === 'NUOC_UONG' ? 'bg-info' : 'bg-warning text-dark'}`}>
                                                {mon.loai === 'NUOC_UONG' ? 'Nước' : 'Đồ ăn'}
                                            </span>
                                        </div>
                                        <div className="fw-bold text-danger mb-2">{Number(giaMon).toLocaleString()} đ</div>
                                        <div className="mb-3">
                                            <span className="badge bg-secondary me-2">Tồn kho: {mon.soLuongTon ?? mon.soLuong ?? 0}</span>
                                            {(mon.soLuongTon ?? mon.soLuong ?? 0) <= 5 && (
                                                <span className="badge bg-danger">Sắp hết</span>
                                            )}
                                        </div>
                                        <div className="d-flex gap-2 mt-auto">
                                            <button className="btn btn-sm btn-primary flex-grow-1 fw-bold" onClick={() => openEditModal(mon)}>Sửa</button>
                                            <button className="btn btn-sm btn-outline-success fw-bold" onClick={() => handleRestockOpen(mon)}>
                                                Nhập thêm
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger fw-bold" onClick={() => handleDelete(mon.id)}>Xóa</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Thêm/Sửa */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold">{selectedMonAn ? 'Sửa thông tin món' : 'Thêm món mới'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="modal-body">
                                    <label className="form-label fw-bold small">Tên món ăn <span className="text-danger">*</span></label>
                                    <input className="form-control mb-3" value={newMonAn.tenMon} onChange={e => setNewMonAn({...newMonAn, tenMon: e.target.value})} required />
                                    
                                    <label className="form-label fw-bold small">Giá bán (VNĐ) <span className="text-danger">*</span></label>
                                    <input type="number" className="form-control mb-3" value={newMonAn.gia} onChange={e => setNewMonAn({...newMonAn, gia: e.target.value})} required />
                                    
                                    <label className="form-label fw-bold small">Phân loại <span className="text-danger">*</span></label>
                                    <select className="form-select mb-3" value={newMonAn.loai} onChange={e => setNewMonAn({...newMonAn, loai: e.target.value})}>
                                        <option value="DO_AN">Đồ ăn</option>
                                        <option value="NUOC_UONG">Nước uống</option>
                                    </select>

                                    <label className="form-label fw-bold small">Số lượng tồn kho</label>
                                    <input
                                        type="number"
                                        className="form-control mb-3"
                                        value={newMonAn.soLuongTon}
                                        onChange={e => setNewMonAn({...newMonAn, soLuongTon: parseInt(e.target.value, 10) || 0})}
                                        min="0"
                                    />

                                    {/* KHU VỰC UPLOAD ẢNH */}
                                    <label className="form-label fw-bold small">Hình ảnh món ăn</label>
                                    <div className="mb-3">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="form-control" 
                                            onChange={handleImageUpload} 
                                            disabled={isUploading}
                                        />
                                        {isUploading && <small className="text-info fw-bold d-block mt-1">⏳ Đang tải ảnh lên Cloudinary...</small>}
                                        
                                        {/* Hiển thị ảnh xem trước nếu đã có link */}
                                        {newMonAn.hinhAnh && !isUploading && (
                                            <div className="mt-2 text-center bg-light p-2 rounded border">
                                                <img 
                                                    src={newMonAn.hinhAnh} 
                                                    alt="Preview" 
                                                    style={{ height: '120px', objectFit: 'contain', borderRadius: '5px' }} 
                                                />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <label className="form-label fw-bold small">Mô tả thêm</label>
                                    <textarea className="form-control" rows="2" value={newMonAn.moTa} onChange={e => setNewMonAn({...newMonAn, moTa: e.target.value})} />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    {/* Khóa nút lưu nếu ảnh đang được upload */}
                                    <button type="submit" className="btn btn-primary fw-bold" disabled={isUploading}>Lưu Thông Tin</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showRestockModal && restockMonAn && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold">Nhập thêm tồn kho cho {restockMonAn.tenMon || restockMonAn.ten}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowRestockModal(false)} />
                            </div>
                            <form onSubmit={handleRestockSubmit}>
                                <div className="modal-body">
                                    <p>Hiện có: <strong>{restockMonAn.soLuongTon ?? restockMonAn.soLuong ?? 0}</strong> sản phẩm</p>
                                    <label className="form-label fw-bold">Số lượng thêm</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={restockAmount}
                                        min="1"
                                        onChange={(e) => setRestockAmount(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowRestockModal(false)}>Hủy</button>
                                    <button type="submit" className="btn btn-success">Nhập thêm</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SanPhamTab;
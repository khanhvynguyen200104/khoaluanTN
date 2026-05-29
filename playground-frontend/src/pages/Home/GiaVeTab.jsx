import React, { useEffect, useState } from 'react';

const GiaVeTab = () => {
    const API_BASE = 'http://localhost:8081';
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        giaCombo: 100000,
        phuThuComboCuoiTuan: 20000,
        giaNguoiLon: 20000
    });

    const getToken = () => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const userObj = JSON.parse(userString);
                return userObj.token || userObj.accessToken || userObj.jwt || localStorage.getItem('token') || '';
            }
            return localStorage.getItem('token') || '';
        } catch (error) {
            return localStorage.getItem('token') || '';
        }
    };

    useEffect(() => {
        loadGiaVe();
    }, []);

    const loadGiaVe = async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const res = await fetch(`${API_BASE}/api/admin/gia-ve`, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || 'Không lấy được giá vé');
            }

            const data = await res.json();
            setFormData({
                giaCombo: Number(data.giaCombo) || 100000,
                phuThuComboCuoiTuan: Number(data.phuThuComboCuoiTuan) || 20000,
                giaNguoiLon: Number(data.giaNguoiLon) || 20000
            });
        } catch (err) {
            console.error(err);
            setErrorMessage('Lỗi tải giá vé: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const payload = {
            giaCombo: Number(formData.giaCombo) || 0,
            phuThuComboCuoiTuan: Number(formData.phuThuComboCuoiTuan) || 0,
            giaNguoiLon: Number(formData.giaNguoiLon) || 0
        };

        if (payload.giaCombo <= 0) {
            alert('Giá combo phải lớn hơn 0');
            setIsSaving(false);
            return;
        }
        if (payload.giaNguoiLon <= 0) {
            alert('Giá vé người lớn phải lớn hơn 0');
            setIsSaving(false);
            return;
        }
        if (payload.phuThuComboCuoiTuan < 0) {
            alert('Phụ thu cuối tuần không hợp lệ');
            setIsSaving(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/admin/gia-ve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || 'Lỗi lưu giá vé');
            }

            alert('Đã cập nhật giá vé thành công');
            await loadGiaVe();
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="card shadow mb-4">
            <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                <h6 className="m-0 fw-bold">💲 Quản Lý Giá Vé</h6>
                <button className="btn btn-dark fw-bold" onClick={loadGiaVe} disabled={isLoading}>Tải lại</button>
            </div>
            <div className="card-body">
                {errorMessage && (
                    <div className="alert alert-warning py-2 mb-3" role="alert">
                        {errorMessage}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-5">Đang tải giá vé...</div>
                ) : (
                    <form onSubmit={handleSave} className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Giá vé Combo</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.giaCombo}
                                onChange={(e) => setFormData({ ...formData, giaCombo: e.target.value })}
                                min="0"
                                required
                            />
                            <small className="text-muted d-block mt-1">Giá áp dụng cho vé combo 1 bé + 1 phụ huynh.</small>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Phụ thu Combo cuối tuần</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.phuThuComboCuoiTuan}
                                onChange={(e) => setFormData({ ...formData, phuThuComboCuoiTuan: e.target.value })}
                                min="0"
                                required
                            />
                            <small className="text-muted d-block mt-1">Cộng thêm vào giá combo vào thứ 7/CN.</small>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Giá vé Người lớn</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.giaNguoiLon}
                                onChange={(e) => setFormData({ ...formData, giaNguoiLon: e.target.value })}
                                min="0"
                                required
                            />
                            <small className="text-muted d-block mt-1">Giá áp dụng cho vé người lớn/phụ huynh.</small>
                        </div>
                        <div className="col-12 d-flex justify-content-end">
                            <button type="submit" className="btn btn-primary fw-bold" disabled={isSaving}>
                                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default GiaVeTab;

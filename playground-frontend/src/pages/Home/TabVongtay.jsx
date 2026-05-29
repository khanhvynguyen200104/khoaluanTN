import React, { useState } from 'react';

const TabVongTay = ({ lichSuBanHang, onCheckoutDone }) => {
    const [tuKhoaVongTay, setTuKhoaVongTay] = useState('');
    const [ketQuaVongTay, setKetQuaVongTay] = useState(null);
    const [maVongTayMoi, setMaVongTayMoi] = useState(''); // State lưu mã vòng tay chuẩn bị cập nhật
    const [dangCheckout, setDangCheckout] = useState(false);

    const getToken = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.token || localStorage.getItem('token');
            } catch {
                return localStorage.getItem('token');
            }
        }
        return localStorage.getItem('token');
    };

    const buildHeaders = (includeJson = false) => {
        const headers = {};
        const token = getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        if (includeJson) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    };

    const handleTimKiem = () => {
        const tuKhoa = tuKhoaVongTay.trim();

        if (!tuKhoa) {
            setKetQuaVongTay(null);
            return;
        }

        // Tìm bằng mã vé hoặc mã vòng tay
        const found = lichSuBanHang.find(don => don.maVe === tuKhoa || don.maVongTay === tuKhoa);
        setKetQuaVongTay(found || 'KHONG_TIM_THAY');
        setMaVongTayMoi(''); // Reset ô nhập mỗi lần tìm kiếm mới
    };

    // Hàm gọi API cập nhật mã vòng tay
    const handleCapNhatVongTay = async () => {
        if (!maVongTayMoi.trim()) {
            alert("Vui lòng nhập hoặc quét mã vòng tay trước khi cập nhật!");
            return;
        }

        try {
            const response = await fetch('http://localhost:8081/api/pos/cap-nhat-vong-tay', {
                method: 'POST',
                headers: buildHeaders(true),
                body: JSON.stringify({
                    maVe: ketQuaVongTay.maVe, // Gửi mã vé đi để tìm đúng đơn
                    maVongTay: maVongTayMoi.trim() // Mã vòng tay mới
                })
            });

            if (response.ok) {
                alert("Đã phát vòng tay và cập nhật thành công!");
                // Cập nhật lại giao diện ngay lập tức không cần tải lại trang
                setKetQuaVongTay({ ...ketQuaVongTay, maVongTay: maVongTayMoi.trim() });
                setMaVongTayMoi('');
            } else {
                const errorData = await response.json();
                alert("Lỗi: " + (errorData.loi || "Không thể cập nhật"));
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật vòng tay:", error);
            alert("Lỗi kết nối đến server!");
        }
    };

    // Hàm checkout - lưu giờ ra khách
    const handleCheckout = async () => {
        if (!ketQuaVongTay || !ketQuaVongTay.maVe) {
            alert("Vui lòng tìm kiếm giao dịch trước!");
            return;
        }

        if (dangCheckout) {
            return;
        }

        try {
            setDangCheckout(true);
            const response = await fetch('http://localhost:8081/api/pos/checkout', {
                method: 'POST',
                headers: buildHeaders(true),
                body: JSON.stringify({ maVe: ketQuaVongTay.maVe })
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message || "Checkout thành công!");
                // Cập nhật lại giao diện để hiển thị giờ ra
                const gioKhachVe = new Date().toISOString();
                setKetQuaVongTay({ ...ketQuaVongTay, gioKhachVe });
                if (typeof onCheckoutDone === 'function') {
                    await onCheckoutDone();
                }
                setTuKhoaVongTay('');
            } else {
                const errorData = await response.json();
                alert("Lỗi: " + (errorData.loi || "Không thể checkout"));
            }
        } catch (error) {
            console.error("Lỗi khi checkout:", error);
            alert("Lỗi kết nối đến server!");
        } finally {
            setDangCheckout(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded shadow-sm">
            <h4 className="fw-bold mb-4">Tra Cứu / Phát Vòng Tay Cho Khách</h4>
            <div className="d-flex gap-2 mb-4" style={{ maxWidth: '600px' }}>
                <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Nhập mã vé Online (VE-...) hoặc mã vòng tay (VT-...)" 
                    value={tuKhoaVongTay} 
                    onChange={(e) => setTuKhoaVongTay(e.target.value)} 
                />
                <button className="btn btn-primary px-4 fw-bold" onClick={handleTimKiem}>Tìm Kiếm</button>
            </div>

            {ketQuaVongTay === 'KHONG_TIM_THAY' && <div className="alert alert-danger">Không tìm thấy giao dịch nào khớp với mã này!</div>}

            {ketQuaVongTay && ketQuaVongTay !== 'KHONG_TIM_THAY' && (
                <div className="card border-primary">
                    <div className="card-header bg-primary text-white fw-bold d-flex justify-content-between align-items-center gap-2">
                        <span>Thông tin vé: {ketQuaVongTay.maVe}</span>
                        <div className="d-flex align-items-center gap-2">
                            {ketQuaVongTay.trangThai && <span className="badge bg-light text-primary">{ketQuaVongTay.trangThai}</span>}
                            {!ketQuaVongTay.gioKhachVe && (
                                <button className="btn btn-light btn-sm fw-bold text-danger" onClick={handleCheckout} disabled={dangCheckout}>
                                    {dangCheckout ? 'Đang lưu...' : '🚪 Checkout'}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="card-body">
                        <p className="mb-2">
                            <strong>Mã vòng tay:</strong> {' '}
                            {ketQuaVongTay.maVongTay ? (
                                <span className="text-success fw-bold fs-5">{ketQuaVongTay.maVongTay}</span>
                            ) : (
                                <span className="text-danger fw-bold">Chưa phát vòng tay</span>
                            )}
                        </p>
                        
                        <p className="mb-2"><strong>Thời gian vào:</strong> {ketQuaVongTay.ngayMua ? new Date(ketQuaVongTay.ngayMua).toLocaleString('vi-VN') : 'Vừa xong'}</p>
                        
                        <p className="mb-2">
                            <strong>Thời gian ra:</strong> {' '}
                            {ketQuaVongTay.gioKhachVe ? (
                                <span className="text-danger fw-bold">{new Date(ketQuaVongTay.gioKhachVe).toLocaleString('vi-VN')}</span>
                            ) : (
                                <span className="text-muted">(Chưa checkout)</span>
                            )}
                        </p>
                        
                        <p className="mb-2"><strong>Loại vé:</strong> {ketQuaVongTay.loaiVe || 'Combo / Cả ngày'}</p>
                        
                        <p className="mb-3">
                            <strong>Số lượng vé mua:</strong> <span className="badge bg-success fs-6 ms-2">{ketQuaVongTay.soLuong || 0} vé</span>
                        </p>
                        
                        <div className="p-3 bg-light rounded border border-danger mb-4">
                            <p className="text-danger fw-bold fs-5 m-0">📞 SĐT Phụ Huynh: {ketQuaVongTay.soDienThoaiKhach || 'Không có dữ liệu'}</p>
                        </div>

                        {/* KHU VỰC CẬP NHẬT VÒNG TAY CHO KHÁCH ONLINE */}
                        {!ketQuaVongTay.maVongTay && (
                            <div className="bg-warning bg-opacity-10 p-3 rounded border border-warning">
                                <label className="fw-bold mb-2">🎟️ Phát vòng tay cho khách:</label>
                                <div className="d-flex gap-2">
                                    <input 
                                        type="text" 
                                        className="form-control border-warning" 
                                        placeholder="Quét hoặc nhập mã vòng tay vật lý..." 
                                        value={maVongTayMoi} 
                                        onChange={(e) => setMaVongTayMoi(e.target.value)} 
                                    />
                                    <button className="btn btn-warning fw-bold text-dark" onClick={handleCapNhatVongTay}>
                                        Lưu & Phát
                                    </button>
                                </div>
                                <small className="text-muted mt-1 d-block">Lưu ý: Đưa vòng tay cho khách sau khi bấm lưu thành công.</small>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default TabVongTay;
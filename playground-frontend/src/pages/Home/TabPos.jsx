import React, { useState, useEffect } from 'react';

const TabPos = ({ nhanVien, onSaleSuccess }) => {
    const [giaVe, setGiaVe] = useState({
        giaCombo: 100000,
        phuThuComboCuoiTuan: 20000,
        giaNguoiLon: 20000
    });
    const [tuKhoaSanPham, setTuKhoaSanPham] = useState('');
    const [menu, setMenu] = useState([]);
    const [maGiamGia, setMaGiamGia] = useState('');
    const [phanTramGiamVoucher, setPhanTramGiamVoucher] = useState(0);
    const [thongBaoVoucher, setThongBaoVoucher] = useState({ text: '', type: '' });
    
    const [soDienThoai, setSoDienThoai] = useState('');
    const [khachHang, setKhachHang] = useState(null); 
    const [thongBaoKhach, setThongBaoKhach] = useState({ text: '', type: '' });
    
    const [showThanhToanModal, setShowThanhToanModal] = useState(false);
    const [phuongThucThanhToan, setPhuongThucThanhToan] = useState('TIEN_MAT');
    
    const [showQRModal, setShowQRModal] = useState(false);
    const [linkQR, setLinkQR] = useState(''); 
    
    const [showVongTayModal, setShowVongTayModal] = useState(false);
    const [maVongTayMoi, setMaVongTayMoi] = useState('');
    const [sdtPhuHuynh, setSdtPhuHuynh] = useState('');
    const [onlineTicketMode, setOnlineTicketMode] = useState(false);
    
    const [maVeOnline, setMaVeOnline] = useState('');
    const [thongTinVeOnline, setThongTinVeOnline] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false); // Prevent double-click
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const getToken = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return localStorage.getItem('token') || '';
            const userObj = JSON.parse(userStr);
            return userObj.token || userObj.accessToken || localStorage.getItem('token') || '';
        } catch {
            return localStorage.getItem('token') || '';
        }
    };

    const buildHeaders = (includeJson = false) => {
        const token = getToken();
        return {
            ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    };

    useEffect(() => {
        fetchMonAn();
        fetchGiaVe();
    }, []);

    useEffect(() => {
        const onFocus = () => fetchGiaVe();
        window.addEventListener('focus', onFocus);
        const id = setInterval(fetchGiaVe, 10000);
        return () => { window.removeEventListener('focus', onFocus); clearInterval(id); };
    }, []);

    // Auto-search customer when phone number reaches 10 digits
    useEffect(() => {
        if (soDienThoai && soDienThoai.length === 10) {
            const timKhachAuto = async () => {
                try {
                    const res = await fetch(`http://localhost:8081/api/auth/tim-sdt?sdt=${soDienThoai}`);
                    if (res.ok) {
                        const data = await res.json();
                        const p = data.hangThanhVien === 'SILVER' ? 15 : (data.hangThanhVien === 'GOLD' ? 20 : (data.hangThanhVien === 'DIAMOND' ? 25 : 0));
                        setKhachHang({ ...data, phanTramGiam: p });
                        const ten = data.hoTen || data.tenDangNhap || "Khách";
                        setThongBaoKhach({ text: `✓ Khách hàng: ${ten} - Hạng: ${data.hangThanhVien}`, type: 'success' });
                        setSdtPhuHuynh(soDienThoai);
                    } else {
                        setKhachHang(null);
                        setThongBaoKhach({ text: 'Khách hàng mới (chưa có thẻ)', type: 'error' });
                    }
                } catch (error) {
                    setThongBaoKhach({ text: 'Lỗi máy chủ', type: 'error' });
                }
            };
            timKhachAuto();
        }
    }, [soDienThoai]);

    const fetchGiaVe = async () => {
        try {
            const res = await fetch('http://localhost:8081/api/gia-ve');
            if (res.ok) {
                const data = await res.json();
                const giaVeMoi = {
                    giaCombo: Number(data.giaCombo) || 100000,
                    phuThuComboCuoiTuan: Number(data.phuThuComboCuoiTuan) || 20000,
                    giaNguoiLon: Number(data.giaNguoiLon) || 20000
                };
                setGiaVe(giaVeMoi);
                setMenu(prev => {
                    const doAnHienTai = prev.filter(item => item.loai === 'DO_AN');
                    return [
                        { id: 've_combo', ten: 'Vé Combo', icon: '👨‍👩‍👦', gia: giaVeMoi.giaCombo, loai: 'VE', soLuong: 0 },
                        { id: 've_nguoilon', ten: 'Vé Phụ huynh', icon: '🚶‍♂️', gia: giaVeMoi.giaNguoiLon, loai: 'VE', soLuong: 0 },
                        ...doAnHienTai
                    ];
                });
            }
        } catch (error) {
            console.error('Không tải được giá vé:', error);
            setMenu(prev => {
                if (prev.length > 0) return prev;
                return [
                    { id: 've_combo', ten: 'Vé Combo', icon: '👨‍👩‍👦', gia: 100000, loai: 'VE', soLuong: 0 },
                    { id: 've_nguoilon', ten: 'Vé Phụ huynh', icon: '🚶‍♂️', gia: 20000, loai: 'VE', soLuong: 0 }
                ];
            });
        }
    };

    const fetchMonAn = async () => {
        try {
            const res = await fetch('http://localhost:8081/api/pos/mon-an', {
                headers: buildHeaders()
            }); 
            if (res.ok) {
                const data = await res.json();
                const doAnTuSQL = data.map(mon => ({
                    id: mon.id, ten: mon.tenMon, gia: mon.gia, icon: '🍔', loai: 'DO_AN', soLuong: 0
                }));
                setMenu(prev => {
                    const veHienTai = prev.filter(p => p.loai === 'VE');
                    if (veHienTai.length > 0) {
                        return [...veHienTai, ...doAnTuSQL];
                    }

                    return [
                        { id: 've_combo', ten: 'Vé Combo', icon: '👨‍👩‍👦', gia: giaVe.giaCombo, loai: 'VE', soLuong: 0 },
                        { id: 've_nguoilon', ten: 'Vé Phụ huynh', icon: '🚶‍♂️', gia: giaVe.giaNguoiLon, loai: 'VE', soLuong: 0 },
                        ...doAnTuSQL
                    ];
                });
            }
        } catch (error) { console.error("Lỗi:", error); }
    };

    // Tăng, Giảm, XÓA MÓN
    const handleTang = (id) => setMenu(prev => prev.map(item => item.id === id ? { ...item, soLuong: item.soLuong + 1 } : item));
    const handleGiam = (id) => setMenu(prev => prev.map(item => item.id === id ? { ...item, soLuong: Math.max(0, item.soLuong - 1) } : item));
    const handleXoaMon = (id) => setMenu(prev => prev.map(item => item.id === id ? { ...item, soLuong: 0 } : item));

    const tongGoc = menu.reduce((sum, item) => sum + (item.soLuong * item.gia), 0);
    const phanTramGiamThanhVien = khachHang ? khachHang.phanTramGiam : 0;
    const tongPhanTramGiam = Math.min(phanTramGiamVoucher + phanTramGiamThanhVien, 100); 
    const soTienGiam = (tongGoc * tongPhanTramGiam) / 100;
    const tongThanhToan = tongGoc - soTienGiam;

    const handleTimKhach = async () => {
        if (!soDienThoai || soDienThoai.length < 9) return setThongBaoKhach({ text: 'SĐT không hợp lệ!', type: 'error' });
        try {
            const res = await fetch(`http://localhost:8081/api/auth/tim-sdt?sdt=${soDienThoai}`);
            if (res.ok) {
                const data = await res.json();
                
                // % GIẢM GIÁ: Bạc 15%, Vàng 20%, Kim cương 25%
                let p = data.hangThanhVien === 'SILVER' ? 15 : (data.hangThanhVien === 'GOLD' ? 20 : (data.hangThanhVien === 'DIAMOND' ? 25 : 0));
                
                setKhachHang({ ...data, phanTramGiam: p });
                
                // HIỂN THỊ TÊN KHÁCH HÀNG
                const ten = data.hoTen || data.tenDangNhap || "Khách";
                setThongBaoKhach({ text: `Khách hàng: ${ten} - Hạng: ${data.hangThanhVien}`, type: 'success' });
                
                // Tự động điền luôn SĐT vào ô SĐT Phụ Huynh để lát cấp vòng tay không phải gõ lại
                setSdtPhuHuynh(soDienThoai);
                
            } else { 
                setKhachHang(null); 
                setThongBaoKhach({ text: 'Khách hàng mới (chưa có thẻ)', type: 'error' }); 
            }
        } catch (error) { 
            setThongBaoKhach({ text: 'Lỗi máy chủ', type: 'error' }); 
        }
    };

    // ================================================
    // LUỒNG THANH TOÁN (ĐÃ SỬA THEO THỰC TẾ)
    // ================================================

    // BƯỚC 1: Bấm Nút Thanh Toán -> Chọn Phương Thức
    const handleMoModalThanhToan = () => {
        if (tongThanhToan === 0) return alert("Giỏ hàng đang trống!");
        setShowThanhToanModal(true); 
    };

    // BƯỚC 2: Khi bấm "Tiếp tục" ở Popup Phương Thức
    const handleXacNhanPhuongThucThanhToan = () => {
        if (isProcessing) return; // Prevent double-click
        setIsProcessing(true);
        
        setShowThanhToanModal(false); // Tắt popup chọn

        if (phuongThucThanhToan === 'CHUYEN_KHOAN') {
            // NẾU CHUYỂN KHOẢN -> Bật Mã QR Lên Lập Tức Cho Khách Quét
            const qrLink = `https://img.vietqr.io/image/970422-0987654321-compact2.jpg?amount=${tongThanhToan}&addInfo=ThanhToanVe`;
            setLinkQR(qrLink);
            setShowQRModal(true);
            setTimeout(() => setIsProcessing(false), 300); // Reset flag
            return;
        }

        // Nếu là TIỀN MẶT: chỉ hiện modal cấp vòng tay khi có vé trong giỏ hàng hoặc đang ở chế độ xuất vé online
        const tongVeTraCuu = menu.filter(sp => sp.loai === 'VE').reduce((sum, sp) => sum + sp.soLuong, 0);
        if (tongVeTraCuu > 0 || onlineTicketMode) {
            setMaVongTayMoi("VT-" + Math.random().toString(36).substring(2, 6).toUpperCase());
            setShowVongTayModal(true);
            setTimeout(() => setIsProcessing(false), 300); // Reset flag
        } else {
            // Nếu không có vé (chỉ bán đồ ăn/uống), hoàn tất hóa đơn ngay mà không hiện mã vòng tay
            handleXuatHoaDonCuoiCung();
        }
    };

    // BƯỚC 3 (Dành cho Chuyển Khoản): Nhân viên thấy tiền "Ting ting" rồi bấm Xác Nhận
    const handleHoanTatQuetQR = () => {
        if (isProcessing) return; // Prevent double-click
        setIsProcessing(true);
        
        setShowQRModal(false); // Tắt mã QR đi
        // Bắt đầu cấp vòng tay và SĐT
        setMaVongTayMoi("VT-" + Math.random().toString(36).substring(2, 6).toUpperCase());
        setShowVongTayModal(true);
        setTimeout(() => setIsProcessing(false), 300); // Reset flag
    };

    // BƯỚC 4: Điền SĐT xong -> Bấm "Hoàn Tất" -> Gọi API Lưu Database
    const handleXuatHoaDonCuoiCung = async () => {
        if (isProcessing) return; // Prevent double-click
        setIsProcessing(true);

        try {
            // Tính tổng số lượng vé 
            const tongVeTraCuu = menu.filter(sp => sp.loai === 'VE').reduce((sum, sp) => sum + sp.soLuong, 0);

            // Nếu có vé hoặc đang xuất vé online thì bắt buộc phải có SĐT phụ huynh
            if ((onlineTicketMode || tongVeTraCuu > 0) && !sdtPhuHuynh) {
                alert("Vui lòng nhập số điện thoại phụ huynh!");
                setIsProcessing(false);
                return;
            }

            if (onlineTicketMode) {
                setSuccessMessage(`✓ Đã cấp vòng tay ${maVongTayMoi} cho vé ${thongTinVeOnline?.maVe || ''}!`);
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 3000);
                setShowVongTayModal(false);
                setOnlineTicketMode(false);
                setMaVongTayMoi('');
                setSdtPhuHuynh('');
                setMaVeOnline('');
                setThongTinVeOnline(null);
                setIsProcessing(false);
                return;
            }

            const payload = {
                veCombo: menu.find(i => i.id === 've_combo')?.soLuong || 0,
                veNguoiLon: menu.find(i => i.id === 've_nguoilon')?.soLuong || 0,
                tongSoVe: tongVeTraCuu, 
                
                // Bao vây 2 trường hợp tên biến giá tiền mà Backend có thể cần
                chiTietHoaDon: menu.filter(item => item.soLuong > 0).map(item => ({ 
                    id: item.id, 
                    ten: item.ten, 
                    gia: item.gia, 
                    donGia: item.gia, // Thêm backup
                    soLuong: item.soLuong, 
                    loai: item.loai 
                })), 
                
                // Bao vây 2 trường hợp tên biến tổng tiền mà Backend có thể cần
                tongTienGoc: tongGoc,
                tongTien: tongThanhToan,       // Nếu Backend mong đợi 'tongTien'
                tongThanhToan: tongThanhToan,  // Nếu Backend mong đợi 'tongThanhToan'
                thanhTien: tongThanhToan,      // Backup thêm cho chắc chắn
                
                maGiamGia: maGiamGia, 
                nhanVienThuNgan: nhanVien.ten,
                soDienThoaiKhach: sdtPhuHuynh || (khachHang ? khachHang.soDienThoai : soDienThoai) || null,
                phuongThucThanhToan: phuongThucThanhToan,
                maVongTay: maVongTayMoi || null
            };

            const res = await fetch('http://localhost:8081/api/pos/thanh-toan', {
                method: 'POST',
                headers: buildHeaders(true),
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.ok) {
                setShowVongTayModal(false); // Đóng Modal
                setSuccessMessage("Giao dịch thành công! Đã lưu vào lịch sử hệ thống.");
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 3000);
                await hoanTatVaReset();
            } else {
                alert("Lỗi khi lưu hóa đơn: " + (data.loi || data.error || 'Yêu cầu bị từ chối'));
            }
        } catch (error) { 
            console.error("Lỗi:", error); 
            alert("Không thể kết nối máy chủ khi lưu hóa đơn.");
        } finally {
            setIsProcessing(false);
        }
    };

    const hoanTatVaReset = async () => {
        setSdtPhuHuynh('');
        setMenu(prev => prev.map(item => ({ ...item, soLuong: 0 }))); // Reset giỏ hàng
        setSoDienThoai('');
        setKhachHang(null);
        if (typeof onSaleSuccess === 'function') {
            try {
                await onSaleSuccess(); // Load lại lịch sử ở tab bên kia
            } catch (e) {
                console.error('onSaleSuccess callback error', e);
            }
        }
    };

    // Đổi vé online
    // Đổi vé online
    const handleTimVeOnline = async () => {
        if (!maVeOnline || maVeOnline.trim() === '') {
            return alert("Vui lòng nhập mã vé để tìm kiếm!");
        }

        const maVeChuoi = maVeOnline.trim().replace(/^#+/, '').toUpperCase();

        try {
            // Gọi API sang Backend để tìm mã vé
            const res = await fetch(`http://localhost:8081/api/pos/ve-online?maVe=${encodeURIComponent(maVeChuoi)}`, {
                headers: buildHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                setThongTinVeOnline(data); // Đưa dữ liệu vé lên màn hình
            } else {
                const errorData = await res.json();
                alert("Lỗi: " + (errorData.loi || "Không tìm thấy mã vé này!"));
                setThongTinVeOnline(null);
            }
        } catch (error) {
            console.error("Lỗi tìm vé:", error);
            alert("Không thể kết nối đến máy chủ!");
        }
    };

    const handleXuatVeOnline = async () => {
        if (isProcessing || !thongTinVeOnline) return; // Prevent double-click
        setIsProcessing(true);

        try {
            const res = await fetch('http://localhost:8081/api/pos/xuat-ve-online', {
                method: 'POST',
                headers: buildHeaders(true),
                body: JSON.stringify({
                    maVe: thongTinVeOnline.maVe,
                    maVongTay: maVongTayMoi
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.loi || 'Không thể xuất vé online!');
                setIsProcessing(false);
                return;
            }

            alert(data.message || `Đã xuất vé ${thongTinVeOnline.maVe}.`);
            setSuccessMessage(`Đã xuất vé ${thongTinVeOnline.maVe}. Chúc khách hàng chơi vui vẻ!`);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
            setShowVongTayModal(false);
            setOnlineTicketMode(false);
            setMaVongTayMoi('');
            setSdtPhuHuynh('');
            setMaVeOnline('');
            setThongTinVeOnline(null);
            if (typeof onSaleSuccess === 'function') {
                try {
                    await onSaleSuccess();
                } catch (e) {
                    console.error('onSaleSuccess callback error', e);
                }
            }
        } catch (error) {
            console.error('Lỗi xuất vé online:', error);
            alert('Không thể kết nối đến máy chủ!');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInVeOnline = () => { 
        if (!thongTinVeOnline) return;
        const maMoi = "VT-" + Math.random().toString(36).substring(2, 6).toUpperCase();
        setMaVongTayMoi(maMoi);
        setSdtPhuHuynh(thongTinVeOnline.soDienThoaiKhach || '');
        setOnlineTicketMode(true);
        setShowVongTayModal(true);
    };

    const sanPhamDaLoc = menu.filter(sp => sp.ten.toLowerCase().includes(tuKhoaSanPham.toLowerCase()));
    const nhomVe = sanPhamDaLoc.filter(sp => sp.loai === 'VE');
    const nhomDoAn = sanPhamDaLoc.filter(sp => sp.loai === 'DO_AN');

    const ProductCard = ({ sp }) => (
        <div className="col-sm-6 mb-3">
            <div className="p-3 border rounded text-center bg-light h-100 d-flex flex-column" style={{ cursor: 'pointer' }} onClick={() => handleTang(sp.id)}>
                <h2 className="mb-0">{sp.icon}</h2>
                <h5 className="fw-bold mt-2">{sp.ten}</h5>
                <p className="text-danger fw-bold mb-2">{sp.gia.toLocaleString()} đ</p>
                <div className="d-flex justify-content-center align-items-center gap-3 mt-auto" onClick={e => e.stopPropagation()}>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleGiam(sp.id)}>-</button>
                    <span className="fw-bold fs-5">{sp.soLuong}</span>
                    <button className="btn btn-outline-success btn-sm" onClick={() => handleTang(sp.id)}>+</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="row">
            {/* THÔNG BÁO THÀNH CÔNG */}
            {showSuccessMessage && (
                <div className="col-12 mb-3">
                    <div className="alert alert-success shadow-lg d-flex align-items-center" role="alert" style={{ borderRadius: '10px', border: 'none' }}>
                        <i className="bi bi-check-circle-fill me-3" style={{ fontSize: '1.5rem' }}></i>
                        <div className="flex-grow-1">
                            <h5 className="mb-0 fw-bold">✓ {successMessage}</h5>
                        </div>
                        <button type="button" className="btn-close" onClick={() => setShowSuccessMessage(false)}></button>
                    </div>
                </div>
            )}

            {/* CỘT 1: SẢN PHẨM */}
            <div className="col-md-7">
                <div className="card shadow-sm border-0 mb-3 h-100">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center border-bottom-0 pt-3">
                        <span className="fw-bold fs-5 text-primary">CHỌN VÉ VÀ DỊCH VỤ</span>
                    </div>
                    <div className="card-body pt-0">
                        <div className="input-group mb-4 shadow-sm">
                            <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                            <input type="text" className="form-control border-start-0 py-2" placeholder="Tìm vé, đồ ăn, nước uống..." value={tuKhoaSanPham} onChange={(e) => setTuKhoaSanPham(e.target.value)} style={{ boxShadow: 'none' }} />
                            {tuKhoaSanPham && <button className="btn btn-light border border-start-0" onClick={() => setTuKhoaSanPham('')}>✖</button>}
                        </div>
                        {sanPhamDaLoc.length === 0 ? (
                            <div className="text-center text-muted py-5"><h4>😕</h4> Không tìm thấy món nào tên "{tuKhoaSanPham}"</div>
                        ) : (
                            <div className="scroll-container" style={{ maxHeight: '600px', overflowY: 'auto', overflowX: 'hidden' }}>
                                {nhomVe.length > 0 && (<><h6 className="fw-bold text-secondary mb-3"><i className="bi bi-ticket-perforated me-2"></i>VÉ VÀO CỔNG</h6><div className="row mb-3">{nhomVe.map(sp => <ProductCard key={sp.id} sp={sp} />)}</div></>)}
                                {nhomDoAn.length > 0 && (<><h6 className="fw-bold text-secondary mb-3 mt-2"><i className="bi bi-cup-straw me-2"></i>ĐỒ ĂN & NƯỚC UỐNG</h6><div className="row mb-3">{nhomDoAn.map(sp => <ProductCard key={sp.id} sp={sp} />)}</div></>)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CỘT 2: GIỎ HÀNG */}
            <div className="col-md-5">
                <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-white fw-bold fs-5 border-bottom">HÓA ĐƠN & KHÁCH HÀNG</div>
                    <div className="card-body d-flex flex-column p-3">
                        
                        {/* ĐỔI VÉ ONLINE */}
                        <div className="mb-3 p-3 bg-light rounded border border-info">
                            <label className="form-label fw-semibold text-info mb-1"><i className="bi bi-cloud-download me-2"></i>Đổi vé mua Online</label>
                            <div className="input-group">
                                <input type="text" className="form-control text-uppercase" placeholder="Nhập mã vé (VD: VE-ABCDE)..." value={maVeOnline} onChange={(e) => { setMaVeOnline(e.target.value); setThongTinVeOnline(null); }} />
                                <button className="btn btn-info text-white fw-bold" onClick={handleTimVeOnline}>Tìm vé</button>
                            </div>
                            {thongTinVeOnline && (
                                <div className="mt-3 p-3 bg-white border border-info rounded shadow-sm">
                                    <h6 className="fw-bold text-dark mb-1">Mã: {thongTinVeOnline.maVe}</h6>
                                    <div className="d-flex justify-content-between"><span className="text-muted small">SĐT: {thongTinVeOnline.soDienThoaiKhach || 'Không có'}</span><span className="text-danger fw-bold">{thongTinVeOnline.tongTien?.toLocaleString()} đ</span></div>
                                    <button className="btn btn-warning w-100 mt-3 fw-bold shadow-sm" onClick={handleInVeOnline}>🖨️ XUẤT VÉ & HIỂN THỊ MÃ VÒNG TAY</button>
                                </div>
                            )}
                        </div>

                        {/* TÌM KHÁCH HÀNG */}
                        <div className="mb-3 p-3 bg-light rounded border">
                            <label className="form-label fw-semibold text-secondary mb-1">Khách hàng thành viên</label>
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="Nhập SĐT khách..." value={soDienThoai} maxLength="11" onChange={(e) => { setSoDienThoai(e.target.value); setKhachHang(null); setThongBaoKhach({text:'', type:''}); }} />
                                <button className="btn btn-primary" onClick={handleTimKhach}>Kiểm tra</button>
                            </div>
                            {thongBaoKhach.text && <small className={`mt-1 d-block fw-bold ${thongBaoKhach.type === 'success' ? 'text-success' : 'text-danger'}`}>{thongBaoKhach.text}</small>}
                        </div>

                        {/* GIỎ HÀNG */}
                        <div className="flex-grow-1 mb-3" style={{ minHeight: '150px' }}>
                            {tongGoc === 0 && ( <div className="text-center text-muted mt-3">Chưa có sản phẩm nào...</div> )}
                            {menu.filter(sp => sp.soLuong > 0).map((sp) => (
                                <div key={`cart-${sp.id}`} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                    <div><span className="fw-semibold">{sp.ten}</span> x {sp.soLuong}</div>
                                    <div className="d-flex align-items-center gap-3">
                                        <span className="fw-bold">{(sp.soLuong * sp.gia).toLocaleString()} đ</span>
                                        <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleXoaMon(sp.id)} title="Xóa món này">
                                            <i className="bi bi-trash-fill"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* TỔNG TIỀN */}
                        <div className="bg-light p-3 rounded mb-3">
                            <div className="d-flex justify-content-between mb-1 text-muted"><span>Tạm tính:</span><span>{tongGoc.toLocaleString()} đ</span></div>
                            <hr className="my-2"/>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fs-5 fw-bold">KHÁCH TRẢ:</span>
                                <span className="fs-3 fw-bold text-danger">{tongThanhToan.toLocaleString()} đ</span>
                            </div>
                        </div>

                        <button className="btn btn-success w-100 py-3 fs-5 fw-bold rounded-3 shadow-sm" onClick={handleMoModalThanhToan}>💵 THANH TOÁN</button>
                    </div>
                </div>
            </div>

            {/* ================= CÁC POPUP (MODALS) ================= */}

            {/* MODAL 1: CHỌN PHƯƠNG THỨC THANH TOÁN */}
            {showThanhToanModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9998, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="bg-white p-4 rounded-4 shadow-lg" style={{ width: '450px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                            <h4 className="fw-bold text-dark m-0">Xác nhận thanh toán</h4>
                            <button className="btn btn-light btn-sm border-0 fs-5" onClick={() => setShowThanhToanModal(false)}>✖</button>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-4"><span className="fs-5 text-muted">Tổng thanh toán:</span><span className="fs-3 fw-bold text-danger">{tongThanhToan.toLocaleString()} VNĐ</span></div>
                        
                        <h6 className="fw-semibold mb-3">Chọn phương thức:</h6>
                        <div className={`border rounded p-3 mb-2 ${phuongThucThanhToan === 'TIEN_MAT' ? 'border-primary bg-light' : ''}`} onClick={() => setPhuongThucThanhToan('TIEN_MAT')} style={{ cursor: 'pointer' }}>
                            <div className="form-check m-0"><input className="form-check-input" type="radio" checked={phuongThucThanhToan === 'TIEN_MAT'} readOnly style={{ cursor: 'pointer' }} /><label className="form-check-label fw-bold ms-2" style={{ cursor: 'pointer' }}>💵 Tiền mặt</label></div>
                        </div>
                        <div className={`border rounded p-3 mb-4 ${phuongThucThanhToan === 'CHUYEN_KHOAN' ? 'border-primary bg-light' : ''}`} onClick={() => setPhuongThucThanhToan('CHUYEN_KHOAN')} style={{ cursor: 'pointer' }}>
                            <div className="form-check m-0"><input className="form-check-input" type="radio" checked={phuongThucThanhToan === 'CHUYEN_KHOAN'} readOnly style={{ cursor: 'pointer' }} /><label className="form-check-label fw-bold ms-2" style={{ cursor: 'pointer' }}>🏦 Chuyển khoản (Quét mã QR)</label></div>
                        </div>
                        
                        <div className="d-flex gap-2">
                            <button className="btn btn-secondary w-50 py-2 fw-bold" onClick={() => setShowThanhToanModal(false)}><i className="bi bi-arrow-left me-1"></i> Quay lại sửa</button>
                            <button className="btn btn-success w-50 py-2 fw-bold" onClick={handleXacNhanPhuongThucThanhToan} disabled={isProcessing}>Tiếp tục <i className="bi bi-arrow-right ms-1"></i></button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: MÃ QR (CHỈ HIỆN KHI CHỌN CHUYỂN KHOẢN) */}
            {showQRModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="bg-white p-4 rounded-4 shadow-lg text-center" style={{ width: '400px' }}>
                        <h4 className="fw-bold text-primary mb-3">Quét Mã Chuyển Khoản</h4>
                        <div className="border rounded p-2 mb-3 bg-light d-flex justify-content-center">
                            <img src={linkQR} alt="Mã QR" className="img-fluid rounded" style={{ minHeight: '300px', objectFit: 'contain' }} />
                        </div>
                        <h3 className="text-danger fw-bold mb-3">{tongThanhToan.toLocaleString()} VNĐ</h3>
                        <p className="small text-muted">Vui lòng yêu cầu khách quét mã này trước khi phát vé.</p>
                        
                        {/* NÚT XÁC NHẬN NHẬN TIỀN */}
                        <button className="btn btn-success w-100 py-3 mt-2 fw-bold fs-5 shadow-sm" onClick={handleHoanTatQuetQR} disabled={isProcessing}>
                            ✅ Xác Nhận Đã Nhận Tiền
                        </button>
                        <button className="btn btn-outline-secondary w-100 py-2 mt-2" onClick={() => setShowQRModal(false)}>Đóng / Hủy</button>
                    </div>
                </div>
            )}

            {/* MODAL 3: CẤP VÒNG TAY VÀ LẤY SĐT KHÁCH */}
            {showVongTayModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="bg-white p-4 rounded-4 shadow-lg" style={{ width: '400px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="fw-bold text-primary m-0">Cấp Vòng Tay</h4>
                            <button className="btn btn-light btn-sm border-0 fs-5" onClick={() => { setShowVongTayModal(false); setOnlineTicketMode(false); }}>✖</button>
                        </div>
                        {onlineTicketMode && (
                            <div className="alert alert-success text-center mb-3">Đang cấp vòng tay cho vé online.</div>
                        )}
                        <div className="alert alert-warning text-center">Mã vòng tay:<br/><span className="fs-2 fw-bold text-danger">{maVongTayMoi}</span></div>
                        <div className="mb-4">
                            <label className="form-label fw-bold">Số điện thoại phụ huynh (Bắt buộc):</label>
                            <input type="tel" className="form-control form-control-lg" placeholder="Nhập SĐT..." value={sdtPhuHuynh} onChange={(e) => setSdtPhuHuynh(e.target.value)} autoFocus />
                        </div>
                        
                        {/* NÚT CHỐT ĐƠN CUỐI CÙNG */}
                        <button className="btn btn-success w-100 py-2 fw-bold fs-5" onClick={onlineTicketMode ? handleXuatVeOnline : handleXuatHoaDonCuoiCung} disabled={isProcessing}>
                            {onlineTicketMode ? 'Xuất Vé & Ghi Nhận Đã Sử Dụng 🖨️' : 'Hoàn Tất Đơn & Lấy Mã 🖨️'}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TabPos;
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MuaVe = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [step, setStep] = useState(1); 
    
    // State cho Form
    const [formData, setFormData] = useState({
        ngaySuDung: new Date().toISOString().split('T')[0],
        slCombo: 0,
        slNguoiLon: 0,
        slBe: 0,
        maGiamGia: ''
    });

    // --- STATE ĐỂ QUẢN LÝ VOUCHER ---
    const [phanTramGiamVoucher, setPhanTramGiamVoucher] = useState(0);
    const [thongBaoVoucher, setThongBaoVoucher] = useState({ text: '', type: '' });

    const [invoiceData, setInvoiceData] = useState(null);
    const [giaVe, setGiaVe] = useState({
        giaCombo: 100000,
        phuThuComboCuoiTuan: 20000,
        giaNguoiLon: 20000
    });

    // Thêm State để quản lý hiệu ứng dấu tick xanh và Custom Popup
    const [isSuccess, setIsSuccess] = useState(false);
    const [showCustomAlert, setShowCustomAlert] = useState(false); // <--- BỔ SUNG STATE NÀY

    // --- Cải thiện hàm lấy Token ---
    const getToken = () => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const userObj = JSON.parse(userString);
                // Bao quát các trường hợp đặt tên biến token
                return userObj.token || userObj.accessToken || userObj.jwt || '';
            }
            return localStorage.getItem('token') || '';
        } catch (error) {
            console.error("Lỗi đọc token từ LocalStorage:", error);
            return '';
        }
    };

    // 3. TỰ ĐỘNG ĐIỀN VÀ ÁP DỤNG MÃ NẾU CÓ TRUYỀN SANG
    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (!userString) {
            alert("Vui lòng đăng nhập để mua vé!");
            navigate('/dang-nhap');
            return;
        }
        try {
            const userObj = JSON.parse(userString);
            setUser(userObj);
        } catch (error) {
            alert("Thông tin đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
            navigate('/dang-nhap');
        }

        if (location.state && location.state.maVoucherTuDong) {
            const maTuDong = location.state.maVoucherTuDong;
            setFormData(prev => ({ ...prev, maGiamGia: maTuDong }));
            
            const tuDongApDung = async (ma) => {
                try {
                    const token = getToken();
                    const res = await fetch('http://localhost:8081/api/voucher/kiem-tra', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ maCode: ma })
                    });
        
                    const data = await res.json();
        
                    if (res.ok) {
                        setPhanTramGiamVoucher(data.phanTramGiam);
                        setThongBaoVoucher({ text: `🎉 Áp dụng thành công! Mã giảm ${data.phanTramGiam}%`, type: 'success' });
                    } else {
                        setPhanTramGiamVoucher(0);
                        setThongBaoVoucher({ text: `❌ ${data.loi}`, type: 'error' });
                    }
                } catch (error) {
                    console.error("Lỗi tự áp dụng mã:", error);
                }
            };
            
            tuDongApDung(maTuDong);
            window.history.replaceState({}, document.title)
        }
    }, [location, navigate]);

    const loadGiaVe = async () => {
        try {
            const res = await fetch(`http://localhost:8081/api/gia-ve?t=${new Date().getTime()}`);
            if (res.ok) {
                const data = await res.json();
                setGiaVe({
                    giaCombo: Number(data.giaCombo) || 100000,
                    phuThuComboCuoiTuan: Number(data.phuThuComboCuoiTuan) || 20000,
                    giaNguoiLon: Number(data.giaNguoiLon) || 20000
                });
            }
        } catch (error) {
            console.error('Không tải được giá vé:', error);
        }
    };

    useEffect(() => {
        loadGiaVe();
        const onFocus = () => loadGiaVe();
        window.addEventListener('focus', onFocus);
        const id = setInterval(loadGiaVe, 10000);
        return () => { window.removeEventListener('focus', onFocus); clearInterval(id); };
    }, []);

    // ==============================================================
    // HIỆU ỨNG GIẢ LẬP NGÂN HÀNG TRẢ VỀ KẾT QUẢ THÀNH CÔNG SAU 8 GIÂY
    // ==============================================================
    useEffect(() => {
        let timer;
        if (step === 2 && !isSuccess) {
            timer = setTimeout(() => {
                handlePaymentComplete();
            }, 8000); // 8 giây sau sẽ tự động gọi hàm thanh toán
        }
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, isSuccess]);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        
        if (e.target.name === 'maGiamGia') {
            setPhanTramGiamVoucher(0);
            setThongBaoVoucher({ text: '', type: '' });
        }
    };

    const handleApDungMa = async () => {
        if (!formData.maGiamGia) {
            setThongBaoVoucher({ text: 'Vui lòng nhập mã giảm giá!', type: 'error' });
            return;
        }

        try {
            const token = getToken();
            const res = await fetch('http://localhost:8081/api/voucher/kiem-tra', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ maCode: formData.maGiamGia.toUpperCase().trim() })
            });

            const data = await res.json();

            if (res.ok) {
                setPhanTramGiamVoucher(data.phanTramGiam);
                setThongBaoVoucher({ text: `🎉 Áp dụng thành công! Mã giảm ${data.phanTramGiam}%`, type: 'success' });
            } else {
                setPhanTramGiamVoucher(0);
                setThongBaoVoucher({ text: `❌ ${data.loi}`, type: 'error' });
            }
        } catch (error) {
            console.error("Lỗi:", error);
            setThongBaoVoucher({ text: '❌ Lỗi kết nối đến máy chủ!', type: 'error' });
        }
    };

    // --- LOGIC TÍNH TIỀN REAL-TIME ---
    const checkCuoiTuan = () => {
        const day = new Date(formData.ngaySuDung).getDay();
        return day === 0 || day === 6; 
    };

    const isCuoiTuan = checkCuoiTuan();
    const giaComboBase = giaVe.giaCombo;
    const phuThuCombo = isCuoiTuan ? giaVe.phuThuComboCuoiTuan : 0;
    const giaNguoiLon = giaVe.giaNguoiLon;

    const tienCombo = Number(formData.slCombo || 0) * (giaComboBase + phuThuCombo);
    const tienNguoiLon = Number(formData.slNguoiLon || 0) * giaNguoiLon;
    const tamTinhGoc = tienCombo + tienNguoiLon; 

    const hangThanhVien = user?.hangThanhVien || 'SILVER';
    let tyLeGiamHang = 0;
    if (hangThanhVien === 'GOLD') tyLeGiamHang = 0.2;       
    if (hangThanhVien === 'DIAMOND') tyLeGiamHang = 0.3;    

    const giamGiaHang = tamTinhGoc * tyLeGiamHang;
    const tamTinhSauHang = tamTinhGoc - giamGiaHang;
    const giamGiaVoucher = (tamTinhGoc * phanTramGiamVoucher) / 100;
    const tongTienHienThi = tamTinhSauHang - giamGiaVoucher > 0 ? tamTinhSauHang - giamGiaVoucher : 0;

    const handleCalculate = async (e) => {
        e.preventDefault();
        if (formData.slCombo === 0 && formData.slNguoiLon === 0 && formData.slBe === 0) {
            alert("Vui lòng chọn ít nhất 1 vé!"); return;
        }

        const payload = {
            ...formData,
            hangThanhVien: hangThanhVien,
            tongTienKhachPhaiTra: tongTienHienThi 
        };

        try {
            const token = getToken();
            const res = await fetch('http://localhost:8081/api/ve/xac-nhan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            
            // Xử lý lỗi Unauthorized ngay từ bước xác nhận
            if (res.status === 401 || res.status === 403) {
                alert("Phiên đăng nhập hết hạn hoặc Token không hợp lệ. Vui lòng đăng nhập lại!");
                navigate('/dang-nhap');
                return;
            }

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || data.message || 'Lỗi khi xác nhận thanh toán.');
                return;
            }
            setInvoiceData(data);
            setStep(2); 
            setIsSuccess(false); // Đảm bảo step 2 bắt đầu với vòng xoay
        } catch (error) {
            alert("Lỗi kết nối Server!");
            console.error(error);
        }
    };

    const handlePaymentComplete = async () => {
        const token = getToken();

        if (!token) {
            alert("Không tìm thấy Token xác thực. Vui lòng đăng nhập lại!");
            navigate('/dang-nhap');
            return;
        }

        const soDienThoaiKhach = user?.soDienThoai || user?.phone || user?.dienThoai || user?.sdt || '';
        
        const payload = {
            ...formData, 
            ...invoiceData,
            nguoiMua: user?.tenDangNhap || user?.username || "KhachHang",
            soDienThoaiKhach: soDienThoaiKhach
        };

        try {
            const res = await fetch('http://localhost:8081/api/ve/hoan-tat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (res.status === 401 || res.status === 403) {
                alert("Lỗi xác thực (Unauthorized): Server từ chối Token của bạn. Hãy đăng nhập lại!");
                navigate('/dang-nhap');
                return;
            }

            if (res.ok) {
                if (formData.maGiamGia && phanTramGiamVoucher > 0) {
                    try {
                        await fetch('http://localhost:8081/api/voucher/su-dung', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ maCode: formData.maGiamGia.toUpperCase().trim() })
                        });
                    } catch (err) {
                        console.error("Lỗi khi gọi API sử dụng voucher:", err);
                    }
                }

                const tongTienMoi = Number(user?.tongChiTieu || 0) + Number(invoiceData?.tongTien || 0);
                let hangMoi = 'SILVER';
                if (tongTienMoi >= 4000000) hangMoi = 'DIAMOND';
                else if (tongTienMoi >= 1000000) hangMoi = 'GOLD';

                const updatedUser = { ...user, tongChiTieu: tongTienMoi, hangThanhVien: hangMoi };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // CHUYỂN SANG DẤU TICK XANH
                setIsSuccess(true);

                // --- ĐÃ SỬA: Hiển thị Custom Popup thay vì alert() phèn ---
                setTimeout(() => {
                    setShowCustomAlert(true);
                }, 500);

            } else {
                const errorData = await res.json();
                console.error("Chi tiết lỗi từ Backend:", errorData);
                alert(`Lỗi lưu vé: ${errorData.message || errorData.error || "Server từ chối yêu cầu."}`);
            }
        } catch (error) {
            console.error("Lỗi kết nối:", error);
            alert("Không thể kết nối đến máy chủ. Hãy đảm bảo Backend (8081) đang chạy!");
        }
    };

    return (
        <div style={{ backgroundColor: '#f3f5f9', minHeight: '100vh', position: 'relative' }}>
            <div className="bg-primary text-white p-3 d-flex align-items-center shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
                <button 
                    onClick={() => navigate(-1)} 
                    className="btn btn-link text-white text-decoration-none fw-bold p-0 d-flex align-items-center"
                    style={{ minWidth: '100px' }}
                >
                    <span className="fs-4 me-2">&#8592;</span> Quay lại
                </button>
                <h5 className="m-0 fw-bold flex-grow-1 text-center pe-5">
                    KHU VUI CHƠI PLAYGROUND
                </h5>
            </div>

            <div style={{ padding: '40px 20px' }}>
                {step === 1 && (
                    <div className="card mx-auto shadow-sm" style={{ maxWidth: '600px', borderRadius: '20px' }}>
                        <div className="card-body p-4">
                            <h4 className="text-center fw-bold mb-2" style={{ color: '#0d6efd' }}>ĐẶT VÉ VUI CHƠI</h4>
                            <p className="text-center text-muted mb-4">
                                Hạng của bạn: <strong className="text-warning">{hangThanhVien}</strong>
                            </p>
                            <form onSubmit={handleCalculate}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Ngày đi chơi:</label>
                                    <input type="date" name="ngaySuDung" className="form-control" value={formData.ngaySuDung} onChange={handleChange} required />
                                    {isCuoiTuan && <small className="text-danger mt-1 d-block">* Ngày cuối tuần: Phụ thu Combo +20k/vé</small>}
                                </div>
                                
                                <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded border">
                                    <div><h6 className="mb-0 fw-bold">Vé Combo (Trẻ em + Người lớn)</h6><small>{giaComboBase.toLocaleString('vi-VN')}đ {giaVe.phuThuComboCuoiTuan > 0 ? `(Phụ thu T7, CN +${giaVe.phuThuComboCuoiTuan.toLocaleString('vi-VN')}đ)` : ''}</small></div>
                                    <input type="number" name="slCombo" className="form-control w-25" min="0" value={formData.slCombo} onChange={handleChange} />
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded border">
                                    <div><h6 className="mb-0 fw-bold">Vé Phụ huynh đi kèm</h6><small>{giaNguoiLon.toLocaleString('vi-VN')}đ / người</small></div>
                                    <input type="number" name="slNguoiLon" className="form-control w-25" min="0" value={formData.slNguoiLon} onChange={handleChange} />
                                </div>

                                {/* Ô NHẬP MÃ */}
                                <div className="mb-4">
                                    <label className="form-label fw-bold">Mã giảm giá:</label>
                                    <div className="d-flex gap-2">
                                        <input 
                                            type="text" 
                                            name="maGiamGia" 
                                            className="form-control text-uppercase" 
                                            value={formData.maGiamGia} 
                                            onChange={handleChange} 
                                            placeholder="Nhập mã ưu đãi..." 
                                        />
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-primary fw-bold" 
                                            onClick={handleApDungMa}
                                            style={{ minWidth: '100px' }}
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                    {/* Dòng thông báo */}
                                    {thongBaoVoucher.text && (
                                        <small className={`d-block mt-2 fw-semibold ${thongBaoVoucher.type === 'success' ? 'text-success' : 'text-danger'}`}>
                                            {thongBaoVoucher.text}
                                        </small>
                                    )}
                                </div>

                                {/* BẢNG TÍNH TIỀN */}
                                {(tamTinhGoc > 0) && (
                                    <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#e9ecef' }}>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Tổng gốc:</span>
                                            <span className="fw-semibold">{tamTinhGoc.toLocaleString()} đ</span>
                                        </div>
                                        
                                        {giamGiaHang > 0 && (
                                            <div className="d-flex justify-content-between mb-2 text-primary">
                                                <span>Ưu đãi hạng ({hangThanhVien}):</span>
                                                <span className="fw-semibold">- {giamGiaHang.toLocaleString()} đ</span>
                                            </div>
                                        )}
                                        
                                        {giamGiaVoucher > 0 && (
                                            <div className="d-flex justify-content-between mb-2 text-success">
                                                <span>Voucher giảm giá ({phanTramGiamVoucher}%):</span>
                                                <span className="fw-semibold">- {giamGiaVoucher.toLocaleString()} đ</span>
                                            </div>
                                        )}
                                        <hr className="my-2" />
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="fw-bold fs-5">Cần thanh toán:</span>
                                            <span className="fw-bold fs-4 text-danger">{tongTienHienThi.toLocaleString()} đ</span>
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-pill shadow-sm">
                                    XÁC NHẬN & THANH TOÁN
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Phần Step 2 */}
                {step === 2 && invoiceData && (
                    <div className="card mx-auto shadow" style={{ maxWidth: '400px', borderRadius: '20px' }}>
                        <div className="card-header text-center bg-primary text-white p-3" style={{ borderRadius: '20px 20px 0 0' }}>
                            <h4 className="m-0">HÓA ĐƠN THANH TOÁN</h4>
                        </div>
                        <div className="card-body text-center p-4">
                            <p className="text-muted small">Quét mã QR bằng App Ngân Hàng</p>
                            <img src={invoiceData.qrUrl} alt="QR Code" className="img-fluid border rounded p-1 mb-3" style={{ maxWidth: '250px' }} />
                            
                            <h4 className="text-danger fw-bold">{(invoiceData.tongTien || 0).toLocaleString()} đ</h4>
                            
                            <div className="text-start mt-3 p-3 bg-light rounded border" style={{ fontSize: '15px' }}>
                                <p className="mb-1"><strong>Loại vé:</strong> {invoiceData.loaiVe}</p>
                                <p className="mb-1"><strong>Ngày đi:</strong> {invoiceData.ngaySuDung}</p>
                                
                                {invoiceData.soTienGiamHang > 0 && (
                                    <p className="mb-1 text-primary"><strong>Ưu đãi hạng VIP:</strong> -{(invoiceData.soTienGiamHang || 0).toLocaleString()} đ</p>
                                )}

                                {invoiceData.soTienGiam > 0 && (
                                    <p className="mb-1 text-success"><strong>Voucher:</strong> -{(invoiceData.soTienGiam || 0).toLocaleString()} đ ({invoiceData.thongBaoVoucher})</p>
                                )}
                            </div>

                            {/* HIỆU ỨNG LOADING ẢO DIỆU HOẶC TICK XANH KHI XONG */}
                            <div className="mt-4">
                                {!isSuccess ? (
                                    <>
                                        <div className="spinner-border text-primary" role="status" style={{ width: '1.5rem', height: '1.5rem' }}></div>
                                        <div className="fw-bold text-primary mt-2">Đang chờ ngân hàng xác nhận...</div>
                                        <p className="text-muted small mt-1">Hệ thống sẽ tự động xuất vé khi nhận được tiền.</p>
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2.5rem' }}></i>
                                        <div className="fw-bold text-success mt-2 fs-5">Giao dịch thành công!</div>
                                        <p className="text-muted small mt-1">Hệ thống đang lưu vé của bạn...</p>
                                    </>
                                )}
                            </div>
                            
                            {/* Ẩn nút hủy đi khi đang load trạng thái thành công */}
                            {!isSuccess && (
                                <button onClick={() => setStep(1)} className="btn btn-link mt-2 text-decoration-none text-muted">
                                    Hủy & Quay lại
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* =========================================================
                CUSTOM POPUP XỊN XÒ THAY THẾ CHO ALERT BỊ LỖI
            ========================================================= */}
            {showCustomAlert && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="bg-white p-4 rounded-4 shadow-lg text-center" style={{ width: '90%', maxWidth: '400px' }}>
                        <i className="bi bi-check2-circle text-success" style={{ fontSize: '4rem' }}></i>
                        <h4 className="fw-bold mt-2 text-dark">Thanh Toán Thành Công!</h4>
                        <p className="text-muted mt-2 mb-4">Vé của bạn đã được lưu thành công.</p>
                        
                        <button 
                            className="btn btn-success w-100 py-3 fw-bold rounded-pill fs-6"
                            onClick={() => {
                                setShowCustomAlert(false);
                                navigate('/'); // Nhấn OK xong mới đẩy về trang chủ
                            }}
                        >
                            Quay Về Trang Chủ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MuaVe;
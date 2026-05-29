import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AnUong = () => {
    const [menu, setMenu] = useState([]);
    const [user, setUser] = useState(null);
    const [quantities, setQuantities] = useState({});
    
    // State cho Giỏ Hàng & Modal Thanh toán
    const [cartData, setCartData] = useState({ gioHang: [], tongTien: 0, qrUrl: '' });
    const [showCart, setShowCart] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'pay'
    const [invoiceId, setInvoiceId] = useState(null);

    // THÊM STATE QUẢN LÝ HIỆU ỨNG & POPUP
    const [isSuccess, setIsSuccess] = useState(false);
    const [showCustomAlert, setShowCustomAlert] = useState(false);
    
    const navigate = useNavigate();

    // ==========================================
    // HÀM LẤY TOKEN BẢO MẬT
    // ==========================================
    const getToken = () => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const userObj = JSON.parse(userString);
                return userObj.token || userObj.accessToken || userObj.jwt || '';
            }
            return localStorage.getItem('token') || '';
        } catch (error) {
            return '';
        }
    };

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        setUser(loggedInUser);
        fetchMenu();
        if (loggedInUser) {
            fetchCart();
        }
    }, []);

    const fetchMenu = async () => {
        try {
            const res = await fetch('http://localhost:8081/api/an-uong/danh-sach');
            const data = await res.json();
            if (Array.isArray(data)) {
                setMenu(data);
            } else {
                setMenu([]);
            }
        } catch (err) { 
            console.error("Lỗi fetch menu:", err); 
            setMenu([]); 
        }
    };

    const fetchCart = async () => {
        const cartFromStorage = localStorage.getItem('gioHangAnUong');
        if (cartFromStorage) {
            try {
                const cart = JSON.parse(cartFromStorage);
                const tongTien = cart.reduce((total, item) => total + (item.gia * item.soLuong), 0);
                setCartData({ gioHang: cart, tongTien, qrUrl: tongTien > 0 ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Thanh%20toan%20${tongTien}%20d` : '' });
            } catch (err) {
                console.error('Lỗi parse giỏ từ localStorage:', err);
                setCartData({ gioHang: [], tongTien: 0, qrUrl: '' });
            }
        } else {
            setCartData({ gioHang: [], tongTien: 0, qrUrl: '' });
        }
    };

    // ==============================================================
    // HIỆU ỨNG GIẢ LẬP NGÂN HÀNG TRẢ VỀ KẾT QUẢ THÀNH CÔNG SAU 8 GIÂY
    // ==============================================================
    useEffect(() => {
        let timer;
        if (checkoutStep === 'pay' && !isSuccess) {
            timer = setTimeout(() => {
                handleThanhToanDB(); 
            }, 8000); 
        }
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkoutStep, isSuccess]);


    const handleQtyChange = (id, delta) => {
        setQuantities(prev => {
            const current = prev[id] || 1;
            const next = current + delta;
            return { ...prev, [id]: next > 0 ? next : 1 };
        });
    };

    const handleAddToCart = async (mon) => {
        if (!user) {
            alert("Vui lòng đăng nhập để gọi món!");
            navigate('/dang-nhap'); 
            return;
        }

        const soLuong = quantities[mon.id] || 1;
        const newItem = { id: mon.id, tenSp: mon.tenMon, gia: mon.gia, hinhAnh: mon.hinhAnh, soLuong };

        const cartFromStorage = localStorage.getItem('gioHangAnUong');
        let cart = [];
        if (cartFromStorage) {
            try {
                cart = JSON.parse(cartFromStorage);
            } catch (err) {
                cart = [];
            }
        }

        const existingIndex = cart.findIndex(item => item.id === mon.id);
        if (existingIndex >= 0) {
            cart[existingIndex].soLuong += soLuong;
        } else {
            cart.push(newItem);
        }

        localStorage.setItem('gioHangAnUong', JSON.stringify(cart));
        
        // ĐÃ XÓA DÒNG ALERT Ở ĐÂY ĐỂ TRẢI NGHIỆM ĐƯỢC MƯỢT MÀ HƠN
        
        fetchCart(); 
    };

    const handleRemoveFromCart = async (id) => {
        const cartFromStorage = localStorage.getItem('gioHangAnUong');
        if (cartFromStorage) {
            try {
                let cart = JSON.parse(cartFromStorage);
                cart = cart.filter(item => item.id !== id);
                localStorage.setItem('gioHangAnUong', JSON.stringify(cart));
                fetchCart();
            } catch (err) {}
        }
    };

    // ==========================================
    // GẮN TOKEN VÀO API THANH TOÁN
    // ==========================================
    const handleThanhToanDB = async () => {
        if (!user) {
            alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
            navigate('/dang-nhap');
            return;
        }

        const cartFromStorage = localStorage.getItem('gioHangAnUong');
        if (!cartFromStorage) return;

        let cart;
        try {
            cart = JSON.parse(cartFromStorage);
            if (!Array.isArray(cart) || cart.length === 0) return;
        } catch (err) {
            alert("Lỗi giỏ hàng!");
            return;
        }

        const payload = { 
            nguoiMua: user?.tenDangNhap || user?.username || "Khách vãng lai",
            gioHang: cart
        };

        try {
            const token = getToken(); // Gọi lấy Token
            
            const res = await fetch('http://localhost:8081/api/an-uong/gio-hang/thanh-toan', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Bơm token vào để Server mở cửa
                },
                body: JSON.stringify(payload)
            });
            
            // Xử lý nếu Token hết hạn bị Server đá ra
            if (res.status === 401 || res.status === 403) {
                alert("Lỗi bảo mật: Phiên đăng nhập hết hạn hoặc bạn không có quyền. Vui lòng đăng nhập lại!");
                navigate('/dang-nhap');
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setInvoiceId(data.hoaDonId || data.id); 
                
                localStorage.removeItem('gioHangAnUong');
                
                // Cộng điểm VIP
                const tongTienMoi = Number(user?.tongChiTieu || 0) + Number(cartData.tongTien || 0);
                let hangMoi = 'SILVER';
                if (tongTienMoi >= 4000000) hangMoi = 'DIAMOND';
                else if (tongTienMoi >= 1000000) hangMoi = 'GOLD';

                const updatedUser = { ...user, tongChiTieu: tongTienMoi, hangThanhVien: hangMoi };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser); 

                fetchCart(); // Cập nhật state giỏ trống

                // CHUYỂN SANG DẤU TICK XANH
                setIsSuccess(true);

                // Hiện Custom Popup sau 0.5s
                setTimeout(() => {
                    setShowCustomAlert(true);
                }, 500);

            } else {
                const errorData = await res.json();
                alert("Lỗi thanh toán: " + (errorData.message || "Có lỗi xảy ra khi thanh toán!"));
            }
        } catch(err) {
            console.error("Lỗi thanh toán:", err);
            alert("Không thể kết nối đến máy chủ thanh toán.");
        }
    };

    return (
        <div style={{ backgroundColor: '#f8f8fa', minHeight: '100vh', paddingBottom: '80px', position: 'relative' }}>
            
            {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG */}
            <div className="bg-white shadow-sm sticky-top mb-4" style={{ zIndex: 999 }}>
                <div className="container py-3 d-flex align-items-center justify-content-between">
                    <button 
                        onClick={() => navigate('/')} 
                        className="btn btn-outline-primary d-flex align-items-center gap-2 fw-bold"
                        style={{ borderRadius: '12px', transition: '0.3s' }}
                    >
                        <i className="bi bi-arrow-left"></i> 
                    </button>
                    <h2 className="fw-bold m-0 d-none d-md-block" style={{ color: '#ff7675' }}>
                        🍔 KHU ẨM THỰC
                    </h2>
                    <div style={{ width: '115px' }} className="d-none d-md-block"></div>
                </div>
            </div>

            {/* Nút Giỏ Hàng Nổi Góc Phải */}
            <button 
                onClick={() => { setCheckoutStep('cart'); setIsSuccess(false); setShowCart(true); }}
                className="btn shadow-lg position-fixed d-flex justify-content-center align-items-center" 
                style={{ bottom: '30px', right: '30px', width: '65px', height: '65px', borderRadius: '50%', backgroundColor: '#ff7675', color: '#fff', zIndex: 1000, border: '3px solid #fff' }}>
                <i className="bi bi-cart3 fs-3"></i>
                {cartData.gioHang && cartData.gioHang.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light" style={{ fontSize: '0.85rem' }}>
                        {cartData.gioHang.reduce((total, item) => total + item.soLuong, 0)}
                    </span>
                )}
            </button>

            <div className="container">
                <div className="text-center mb-5 mt-2">
                    <h4 className="fw-bold text-dark" style={{ letterSpacing: '1px' }}>NẠP NĂNG LƯỢNG TỨC THÌ!</h4>
                    <p className="text-muted fs-6">Khám phá menu đa dạng để tiếp sức vui chơi không giới hạn</p>
                </div>

                {/* DANH SÁCH MÓN ĂN */}
                <div className="row g-4">
                    {menu.map((mon, index) => (
                        <div className="col-md-3 col-6" key={index}>
                            <div className="card h-100 shadow-sm border-0 d-flex flex-column" style={{ borderRadius: '18px', overflow: 'hidden' }}>
                                <img src={mon.hinhAnh || 'https://via.placeholder.com/150'} className="card-img-top" alt={mon.tenMon} style={{ height: '200px', objectFit: 'cover' }} />
                                
                                <div className="card-body text-center d-flex flex-column">
                                    <h6 className="fw-bold text-dark mb-1">{mon.tenMon}</h6>
                                    <p className="text-danger fw-bold fs-5 mb-auto">{mon.gia ? mon.gia.toLocaleString() : 0} đ</p>
                                    
                                    <div className="d-flex justify-content-center align-items-center my-3 bg-light rounded-pill p-1 mx-auto" style={{ width: 'fit-content' }}>
                                        <button className="btn btn-sm btn-white rounded-circle border text-dark fw-bold" onClick={() => handleQtyChange(mon.id, -1)} style={{ width: '32px', height: '32px' }}>-</button>
                                        <span className="mx-3 fw-bold fs-6">{quantities[mon.id] || 1}</span>
                                        <button className="btn btn-sm btn-white rounded-circle border text-dark fw-bold" onClick={() => handleQtyChange(mon.id, 1)} style={{ width: '32px', height: '32px' }}>+</button>
                                    </div>

                                    <button 
                                        className="btn w-100 fw-bold text-white shadow-sm mt-2" 
                                        style={{ backgroundColor: '#0984e3', borderRadius: '12px', padding: '10px' }}
                                        onClick={() => handleAddToCart(mon)}>
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* POPUP GIỎ HÀNG / THANH TOÁN */}
            {showCart && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(3px)' }}>
                    <div className="bg-white p-4 shadow-lg" style={{ borderRadius: '24px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        {/* BƯỚC 1: XEM GIỎ HÀNG */}
                        {checkoutStep === 'cart' && (
                            <>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-bold m-0">🛒 Giỏ Hàng</h4>
                                    <button className="btn-close" onClick={() => setShowCart(false)}></button>
                                </div>
                                
                                {!cartData.gioHang || cartData.gioHang.length === 0 ? (
                                    <div className="text-center py-5">
                                        <i className="bi bi-cart-x text-muted" style={{ fontSize: '4rem' }}></i>
                                        <p className="text-muted mt-3 fs-5">Giỏ hàng đang trống.</p>
                                    </div>
                                ) : (
                                    <div>
                                        {cartData.gioHang.map(item => (
                                            <div key={item.id} className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                                                <div>
                                                    <h6 className="mb-1 fw-bold text-dark">{item.tenSp}</h6>
                                                    <small className="text-muted">{item.gia.toLocaleString()}đ x {item.soLuong}</small>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <span className="fw-bold text-danger me-3 fs-6">{(item.gia * item.soLuong).toLocaleString()}đ</span>
                                                    <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: '8px' }} onClick={() => handleRemoveFromCart(item.id)}>
                                                        <i className="bi bi-trash3"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="d-flex justify-content-between mt-4 p-3 bg-light rounded-3">
                                            <span className="fs-5 fw-bold text-secondary">Tổng cộng:</span>
                                            <span className="fs-4 fw-bold text-danger">{cartData.tongTien.toLocaleString()} đ</span>
                                        </div>
                                    </div>
                                )}
                                <div className="d-flex gap-2 mt-4">
                                    <button className="btn btn-light border w-50 fw-bold" style={{ borderRadius: '12px', padding: '12px' }} onClick={() => setShowCart(false)}>Tiếp tục mua</button>
                                    <button 
                                        className="btn btn-success w-50 fw-bold" 
                                        style={{ borderRadius: '12px', padding: '12px' }}
                                        disabled={!cartData.gioHang || cartData.gioHang.length === 0}
                                        onClick={() => setCheckoutStep('pay')}>
                                        Thanh Toán
                                    </button>
                                </div>
                            </>
                        )}

                        {/* BƯỚC 2: QUÉT QR NGÂN HÀNG */}
                        {checkoutStep === 'pay' && (
                            <div className="text-center">
                                <h4 className="fw-bold mb-3 text-dark">📱 Quét Mã Thanh Toán</h4>
                                <p className="text-muted fs-5 mb-4">Tổng cần thanh toán: <strong className="text-danger">{cartData.tongTien.toLocaleString()} đ</strong></p>
                                
                                <div className="p-3 d-inline-block bg-white border rounded-4 shadow-sm mb-4">
                                    <img 
                                        src={`https://img.vietqr.io/image/970436-1025468639-compact2.png?amount=${cartData.tongTien}&addInfo=Thanh%20toan%20hoa%20don%20am%20thuc&accountName=NGUYEN%20KHANH%20VY`} 
                                        alt="Mã QR Thanh Toán" 
                                        style={{ width: '250px', height: '250px', objectFit: 'contain' }} 
                                    />
                                </div>
                                
                                {/* HIỆU ỨNG LOADING HOẶC DẤU TICK XANH */}
                                <div className="mt-2">
                                    {!isSuccess ? (
                                        <>
                                            <div className="spinner-border text-primary" role="status" style={{ width: '1.5rem', height: '1.5rem' }}></div>
                                            <div className="fw-bold text-primary mt-2">Đang chờ ngân hàng xác nhận...</div>
                                            <p className="text-muted small mt-1">Hệ thống sẽ tự động chốt đơn khi nhận được tiền.</p>
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2.5rem' }}></i>
                                            <div className="fw-bold text-success mt-2 fs-5">Giao dịch thành công!</div>
                                            <p className="text-muted small mt-1">Hệ thống đang lưu đơn hàng...</p>
                                        </>
                                    )}
                                </div>

                                {!isSuccess && (
                                    <button className="btn btn-light border w-100 fw-bold mt-3" style={{ borderRadius: '12px', padding: '12px' }} onClick={() => setCheckoutStep('cart')}>
                                        Hủy & Quay lại
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* =========================================================
                CUSTOM POPUP XỊN XÒ THAY THẾ CHO ALERT BỊ LỖI
            ========================================================= */}
            {showCustomAlert && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="bg-white p-4 rounded-4 shadow-lg text-center" style={{ width: '90%', maxWidth: '400px' }}>
                        <i className="bi bi-check2-circle text-success" style={{ fontSize: '4rem' }}></i>
                        <h4 className="fw-bold mt-2 text-dark">Thanh Toán Thành Công!</h4>
                        <p className="text-muted mt-2 mb-4">
                            Đơn hàng {invoiceId ? <strong className="text-primary">#{invoiceId}</strong> : ''} của bạn đã được ghi nhận. 
                            <br/>Vui lòng vào mục Kho Vé & Hóa Đơn để xuất trình mã cho nhân viên nhận món nhé!
                        </p>
                        
                        <button 
                            className="btn btn-success w-100 py-3 fw-bold rounded-pill fs-6"
                            onClick={() => {
                                setShowCustomAlert(false);
                                setShowCart(false);
                                navigate('/trang-su-dung'); 
                            }}
                        >
                            Đi đến Kho Vé & Hóa Đơn
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnUong;
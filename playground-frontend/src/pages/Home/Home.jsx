import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

// Dữ liệu danh sách các khu trò chơi
const GAME_LIST = [
  { id: 1, img: '/images/1.jpg', title: 'Nhà banh khổng lồ' },
  { id: 2, img: '/images/2.jpg', title: 'Hồ cát sứ' },
  { id: 3, img: '/images/5.jpg', title: 'Khu vận động liên hoàn' },
  { id: 4, img: '/images/3.jpg', title: 'Khu vực nấu ăn' },
  { id: 5, img: '/images/4.jpg', title: 'Khu bạt nhún Trampoline' },
  { id: 6, img: '/images/6.jpg', title: 'Khu xếp hình Lego' },
  { id: 7, img: '/images/7.jpg', title: 'Khu leo núi' },
  { id: 8, img: '/images/8.jpg', title: 'Khu tô tượng & Tranh cát' }
];

const Home = () => {
  const [user, setUser] = useState(null);
  
  // Ref dùng để điều khiển thanh trượt trò chơi
  const scrollRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.token) {
      fetch('http://localhost:8081/api/auth/me', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedUser.token}`,
        },
      })
        .then(res => {
          if (!res.ok) throw new Error('Không thể đồng bộ user từ backend');
          return res.json();
        })
        .then(data => {
          const syncedUser = { ...storedUser, ...data, token: storedUser.token };
          localStorage.setItem('user', JSON.stringify(syncedUser));
          setUser(syncedUser);
        })
        .catch(() => {
          if (storedUser) setUser(storedUser);
        });
    } else if (storedUser) {
      setUser(storedUser);
    }

    fetch('http://localhost:8081/api/trang-chu')
      .then(res => res.json())
      .catch(err => console.error("Lỗi fetch dữ liệu: ", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Hàm xử lý khi bấm mũi tên trái/phải
  const scrollGames = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Mỗi lần bấm sẽ trượt 300px
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const hienThiHuyHieuHang = (hang) => {
    switch (hang) {
        case 'DIAMOND':
            return <span className="badge" style={{ backgroundColor: '#00cec9', color: 'white', padding: '6px 10px', fontSize: '12px' }}><i className="bi bi-gem me-1"></i>Kim Cương</span>;
        case 'GOLD':
            return <span className="badge" style={{ backgroundColor: '#fdcb6e', color: 'black', padding: '6px 10px', fontSize: '12px' }}><i className="bi bi-star-fill me-1"></i>Vàng</span>;
        case 'SILVER':
        default:
            return <span className="badge" style={{ backgroundColor: '#b2bec3', color: 'black', padding: '6px 10px', fontSize: '12px' }}><i className="bi bi-award me-1"></i>Bạc</span>;
    }
  };

  const formatTien = (tien) => {
    if (!tien) return '0 đ';
    return tien.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="home-container">
      {/* Ẩn thanh cuộn xấu xí của trình duyệt đi để nhìn cho giống App */}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
          .game-scroll-card {
            transition: transform 0.2s;
          }
          .game-scroll-card:hover {
            transform: translateY(-5px);
          }
          /* Hiệu ứng mượt cho 2 nút mũi tên */
          .scroll-btn {
            transition: all 0.2s;
            background-color: white;
            opacity: 0.9;
          }
          .scroll-btn:hover {
            background-color: #f8f9fa;
            opacity: 1;
            transform: translateY(-50%) scale(1.1) !important;
          }
        `}
      </style>

      {/* HEADER */}
      <div className="pc-header">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="text-decoration-none text-white">
              <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-1px' }}>
                NEW<span style={{ color: '#FFDE59' }}>WORLD</span>
              </div>
            </Link>
            <nav className="d-none d-md-flex gap-2 ms-4">
              <Link to="/" className="nav-link-custom active">Trang chủ</Link>
              <Link to="/trang-su-dung" className="nav-link-custom">Vé của tôi</Link>
              <Link to="/lich-su" className="nav-link-custom">Lịch sử mua</Link>
            </nav>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Xin chào,</div>
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                {user ? user.hoTen || user.tenDangNhap : "Khách hàng"}
              </div>
            </div>
            
            <Link to="/ho-so" className="text-decoration-none">
              <div className="header-avatar"><i className="bi bi-person-fill"></i></div>
            </Link>

            {user && (
              <button onClick={handleLogout} className="btn text-white ms-2" title="Đăng xuất" style={{ border: 'none', background: 'transparent' }}>
                <i className="bi bi-box-arrow-right" style={{ fontSize: '20px' }}></i>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container">

        {/* MENU BOX */}
        <div className="row mb-5">
          <div className="col-md-3 col-6 mb-3">
            <Link to="/mua-ve" className="text-decoration-none text-dark">
              <div className="menu-box">
                <div className="icon-wrapper bg-pink"><i className="bi bi-ticket-perforated-fill"></i></div>
                <h5>Mua Vé</h5>
                <small className="text-muted">Đặt vé trực tuyến</small>
              </div>
            </Link>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <Link to="/dat-tiec" className="text-decoration-none text-dark">
              <div className="menu-box">
                <div className="icon-wrapper bg-orange"><i className="bi bi-cake2-fill"></i></div>
                <h5>Đặt Tiệc</h5>
                <small className="text-muted">Sinh nhật trọn gói</small>
              </div>
            </Link>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <Link to="/an-uong" className="text-decoration-none text-dark">
              <div className="menu-box">
                <div className="icon-wrapper bg-blue"><i className="bi bi-cup-hot-fill"></i></div>
                <h5>Ăn Uống</h5>
                <small className="text-muted">Menu đa dạng</small>
              </div>
            </Link>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <Link to="/voucher" className="text-decoration-none text-dark">
              <div className="menu-box">
                <div className="icon-wrapper bg-green"><i className="bi bi-robot"></i></div>
                <h5>Ưu đãi</h5>
                <small className="text-muted">Quà tặng bé yêu</small>
              </div>
            </Link>
          </div>
        </div>

        {/* THẺ THÔNG TIN THÀNH VIÊN */}
        {user && (
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card shadow-sm border-0" style={{ borderRadius: '16px', background: 'white', padding: '20px' }}>
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                            <div>
                                <h5 className="fw-bold mb-1">Thẻ thành viên của bạn</h5>
                                <div className="text-muted" style={{ fontSize: '14px' }}>Tích lũy chi tiêu để nhận nhiều ưu đãi hơn từ NewWorld!</div>
                            </div>
                            <div className="d-flex gap-3 text-center">
                                <div className="bg-light p-2 rounded-3" style={{ minWidth: '120px' }}>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Hạng hiện tại</div>
                                    <div className="mt-1">{hienThiHuyHieuHang(user.hangThanhVien)}</div>
                                </div>
                                <div className="bg-light p-2 rounded-3" style={{ minWidth: '120px' }}>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Tổng chi tiêu</div>
                                    <div className="fw-bold mt-1" style={{ color: '#0093E9' }}>{formatTien(user.tongChiTieu)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Thanh tiến trình lên hạng */}
                        {user.hangThanhVien !== 'DIAMOND' && (
                            <div className="mt-3 pt-3" style={{ borderTop: '1px dashed #eee' }}>
                                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '12px' }}>
                                    <span className="text-muted">
                                        {user.hangThanhVien === 'SILVER' 
                                            ? `Chỉ còn ${formatTien(1000000 - (user.tongChiTieu || 0))} nữa để thăng hạng Vàng`
                                            : `Chỉ còn ${formatTien(4000000 - (user.tongChiTieu || 0))} nữa để thăng hạng Kim Cương`}
                                    </span>
                                    <span className="fw-bold" style={{ color: '#0093E9' }}>
                                        {user.hangThanhVien === 'SILVER' ? '1.000.000 đ' : '4.000.000 đ'}
                                    </span>
                                </div>
                                <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                                    <div 
                                        className="progress-bar progress-bar-striped progress-bar-animated" 
                                        style={{ 
                                            background: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)', 
                                            width: user.hangThanhVien === 'SILVER' 
                                                ? `${(user.tongChiTieu / 1000000) * 100}%` 
                                                : `${(user.tongChiTieu / 4000000) * 100}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* CAROUSEL */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="section-title">Nổi bật nhất tuần <span style={{ fontSize: '24px' }}>🔥</span></div>
            <div id="bannerCarousel" className="carousel slide carousel-container" data-bs-ride="carousel">
              <div className="carousel-indicators">
                <button type="button" data-bs-target="#bannerCarousel" data-bs-slide-to="0" className="active"></button>
                <button type="button" data-bs-target="#bannerCarousel" data-bs-slide-to="1"></button>
                <button type="button" data-bs-target="#bannerCarousel" data-bs-slide-to="2"></button>
              </div>
              <div className="carousel-inner">
                <div className="carousel-item carousel-item-custom active">
                  <img src="/images/banner2.jpg" className="d-block" alt="Banner 1" />
                </div>
                <div className="carousel-item carousel-item-custom">
                  <img src="/images/banner1.jpg" className="d-block" alt="Banner 2" />
                </div>
                <div className="carousel-item carousel-item-custom">
                  <img src="/images/banner3.jpg" className="d-block" alt="Banner 3" />
                </div>
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
              </button>
            </div>
          </div>
        </div>

        {/* ==============================================================
            TRÒ CHƠI (CÓ MŨI TÊN 2 BÊN MÉP)
        ============================================================== */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="section-title mb-0">Khám phá trò chơi</div>
            </div>
            
            {/* Box chứa danh sách trò chơi (Position Relative để gắn mũi tên) */}
            <div className="position-relative">
              
              {/* NÚT MŨI TÊN TRÁI */}
              <button 
                className="scroll-btn shadow rounded-circle d-flex justify-content-center align-items-center position-absolute top-50 translate-middle-y border-0" 
                style={{ width: '45px', height: '45px', left: '-15px', zIndex: 10 }}
                onClick={() => scrollGames('left')}
              >
                <i className="bi bi-chevron-left text-primary fw-bold fs-5"></i>
              </button>

              {/* Thanh chứa danh sách trượt ngang */}
              <div 
                className="d-flex gap-3 hide-scrollbar" 
                ref={scrollRef}
                style={{ 
                  overflowX: 'auto', 
                  scrollBehavior: 'smooth', 
                  paddingBottom: '15px',
                  paddingTop: '5px'
                }}
              >
                {GAME_LIST.map((game) => (
                  <div key={game.id} className="game-scroll-card" style={{ flex: '0 0 auto', width: '220px' }}>
                    <div className="game-card h-100 shadow-sm border-0 bg-white" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                      <img 
                        src={game.img} 
                        alt={game.title} 
                        style={{ width: '100%', height: '160px', objectFit: 'cover' }} 
                        onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Khu+Vui+Choi'}
                      />
                      <div className="p-3 text-center">
                        <div className="game-title fw-bold text-dark">{game.title}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* NÚT MŨI TÊN PHẢI */}
              <button 
                className="scroll-btn shadow rounded-circle d-flex justify-content-center align-items-center position-absolute top-50 translate-middle-y border-0" 
                style={{ width: '45px', height: '45px', right: '-15px', zIndex: 10 }}
                onClick={() => scrollGames('right')}
              >
                <i className="bi bi-chevron-right text-primary fw-bold fs-5"></i>
              </button>

            </div>
          </div>
        </div>

        {/* TIỆN ÍCH */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="section-title">Tiện ích & Dịch vụ</div>
            <div className="row g-3"> 
              <div className="col-lg-3 col-6">
                <Link to="/trang-su-dung" className="util-card-pc">
                  <div className="util-icon"><i className="bi bi-qr-code-scan"></i></div>
                  <div>
                    <div className="fw-bold">Vé vào cổng</div>
                    <small className="text-muted">Mã QR của bạn</small>
                  </div>
                </Link>
              </div>
              
              <div className="col-lg-3 col-6">
                <Link to="/lich-su" className="util-card-pc">
                  <div className="util-icon" style={{ background: '#e0fcf3', color: '#00b894' }}><i className="bi bi-clock-history"></i></div>
                  <div>
                    <div className="fw-bold">Lịch sử giao dịch</div>
                    <small className="text-muted">Đơn hàng đã mua</small>
                  </div>
                </Link>
              </div>

              <div className="col-lg-3 col-6">
                <Link to="/voucher" className="util-card-pc">
                  <div className="util-icon" style={{ background: '#fff4e6', color: '#ff922b' }}><i className="bi bi-ticket-detailed"></i></div>
                  <div>
                    <div className="fw-bold">Voucher của tôi</div>
                    <small className="text-muted">Ưu đãi đang có</small>
                  </div>
                </Link>
              </div>

              <div className="col-lg-3 col-6">
                <Link to="/ho-so" className="util-card-pc">
                  <div className="util-icon" style={{ background: '#f3f0ff', color: '#7950f2' }}><i className="bi bi-person-gear"></i></div>
                  <div>
                    <div className="fw-bold">Hồ sơ cá nhân</div>
                    <small className="text-muted">Cập nhật thông tin</small>
                  </div>
                </Link>
              </div>

              <div className="col-lg-3 col-6">
                <Link to="/danh-gia" className="util-card-pc">
                  <div className="util-icon" style={{ background: '#fff9db', color: '#fcc419' }}><i className="bi bi-star-fill"></i></div>
                  <div>
                    <div className="fw-bold">Đánh giá</div>
                    <small className="text-muted">Phản hồi dịch vụ</small>
                  </div>
                </Link>
              </div>

              <div className="col-lg-3 col-6">
                <Link to="/quyen-loi" className="util-card-pc">
                  <div className="util-icon" style={{ background: '#fff0f6', color: '#f06595' }}><i className="bi bi-shield-check"></i></div>
                  <div>
                    <div className="fw-bold">Quyền lợi</div>
                    <small className="text-muted">Hạng thành viên</small>
                  </div>
                </Link>
              </div>

              <div className="col-lg-3 col-6">
                <Link to="/lien-he" className="util-card-pc">
                  <div className="util-icon" style={{ background: '#e3fafc', color: '#15aabf' }}><i className="bi bi-headset"></i></div>
                  <div>
                    <div className="fw-bold">Liên hệ & Hỗ trợ</div>
                    <small className="text-muted">Chăm sóc khách hàng</small>
                  </div>
                </Link>
              </div>

              <div className="col-lg-3 col-6">
                <Link to="/tro-giup-ai" className="util-card-pc">
                  <div className="util-icon" style={{ background: '#f8f0fc', color: '#be4bdb' }}><i className="bi bi-robot"></i></div>
                  <div>
                    <div className="fw-bold">Trợ giúp AI</div>
                    <small className="text-muted">Nhắn tin tự động</small>
                  </div>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default Home;
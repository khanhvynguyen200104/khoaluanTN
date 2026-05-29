import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const QuyenLoiThanhVien = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin user để hiển thị hạng hiện tại (nếu đã đăng nhập)
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  // Định nghĩa danh sách các hạng thành viên NewWorld
  const tiers = [
    {
      id: 'SILVER',
      name: 'Thành Viên Silver',
      condition: 'Hạng cơ bản',
      icon: 'bi-award',
      color: '#2196F3', // Xanh dương
      benefits: [
        '💰 Giảm 15% giá vé mỗi lần mua',
        '🎁 Ưu tiên nhận voucher khuyến mãi',
        '🎉 Quà tặng đặc biệt vào sinh nhật',
        '📱 Hỗ trợ khách hàng ưu tiên'
      ]
    },
    {
      id: 'GOLD',
      name: 'Thành Viên Gold',
      condition: 'Hạng cao cấp',
      icon: 'bi-trophy',
      color: '#4CAF50', // Xanh lá
      benefits: [
        '💰 Giảm 20% giá vé mỗi lần mua',
        '🎁 Ưu tiên đặt vé và các dịch vụ',
        '🎉 Voucher giảm giá tháng sinh nhật',
        '📱 Chuyên viên hỗ trợ 24/7',
        '🎊 Mời dự các sự kiện VIP riêng'
      ]
    },
    {
      id: 'DIAMOND',
      name: 'Thành Viên Diamond',
      condition: 'Hạng VIP cao nhất',
      icon: 'bi-gem',
      color: '#9C27B0', // Tím
      benefits: [
        '💰 Giảm 25% giá vé mỗi lần mua',
        '🎁 Ưu tiên tuyệt đối tất cả dịch vụ',
        '🎉 Gói quà tặng cao cấp sinh nhật',
        '📱 Personal assistant 24/7',
        '🎊 Mời dự tất cả sự kiện VIP',
        '👑 Khu vực check-in VIP riêng biệt'
      ]
    }
  ];

  // Hàm format tiền tệ VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <div className="container py-5" style={{ maxWidth: '1000px' }}>
      {/* Header & Nút quay lại */}
      <div className="mb-4">
        <Link to="/" className="text-decoration-none text-dark d-flex align-items-center gap-2 fw-bold">
          <i className="bi bi-arrow-left"></i> Quay lại Trang chủ
        </Link>
      </div>

      <div className="text-center mb-5 py-4 px-4 rounded-3" style={{ background: 'linear-gradient(135deg, #56b6e6 0%, #5b95e0 100%)', color: 'white' }}>
        <h2 className="fw-bold mb-2" style={{ fontSize: '2.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>🏆 Đặc Quyền Thành Viên</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Trải nghiệm dịch vụ tuyệt vời hơn với các ưu đãi dành riêng cho bạn</p>
      </div>

      {/* Hiển thị thông tin hạng của User nếu đã đăng nhập */}
      {user ? (
        <div className="card shadow border-0 mb-5" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', overflow: 'hidden' }}>
          <div className="card-body p-5 text-white text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
            <h5 className="mb-2" style={{ fontSize: '1.5rem' }}>Xin chào, <strong>{user.hoTen || user.tenDangNhap}</strong>!</h5>
            <p className="mb-3" style={{ fontSize: '1.1rem' }}>Hạng thành viên hiện tại của bạn:</p>
            <div className="mb-3">
              <span className="badge" style={{ background: 'rgba(255,255,255,0.3)', color: 'white', fontSize: '1rem', padding: '0.6rem 1.2rem', borderRadius: '50px', backdropFilter: 'blur(10px)' }}>
                {user.hangThanhVien === 'SILVER' ? '💎 SILVER' : user.hangThanhVien === 'GOLD' ? '👑 GOLD' : user.hangThanhVien === 'DIAMOND' ? '💍 DIAMOND' : 'Chưa cập nhật'}
              </span>
            </div>
            <p className="mb-0 small" style={{ opacity: 0.9 }}>Tổng chi tiêu tích lũy: <strong style={{ fontSize: '1.2rem' }}>{formatCurrency(user.tongChiTieu)}</strong></p>
          </div>
        </div>
      ) : (
        <div className="alert alert-info text-center rounded-pill mb-5">
          <i className="bi bi-info-circle me-2"></i> 
          Hãy <Link to="/login" className="alert-link">đăng nhập</Link> để xem hạng thành viên và tiến trình của bạn!
        </div>
      )}

      {/* Danh sách các thẻ Quyền lợi */}
      <div className="row g-4">
        {tiers.map((tier) => {
          const gradients = {
            'SILVER': 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            'GOLD': 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            'DIAMOND': 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)'
          };
          return (
            <div className="col-lg-4 col-md-6" key={tier.id}>
              <div 
                className="card h-100 border-0" 
                style={{ 
                  borderRadius: '20px', 
                  background: gradients[tier.id] || gradients['SILVER'],
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: `radial-gradient(circle, ${tier.color}20 0%, transparent 70%)`,
                  borderRadius: '50%',
                  transform: 'translate(30%, -30%)'
                }}></div>
                <div className="card-body p-4" style={{ position: 'relative', zIndex: 1 }}>
                  <div className="d-flex align-items-center mb-4">
                    <div 
                      className="icon-box d-flex justify-content-center align-items-center"
                      style={{
                        width: '70px', 
                        height: '70px', 
                        borderRadius: '50%', 
                        background: `linear-gradient(135deg, ${tier.color}30 0%, ${tier.color}10 100%)`,
                        boxShadow: `0 8px 16px ${tier.color}30`,
                        border: `2px solid ${tier.color}50`
                      }}
                    >
                      <i className={`bi ${tier.icon}`} style={{ fontSize: '32px', color: tier.color }}></i>
                    </div>
                    <div className="ms-3">
                      <h5 className="fw-bold mb-1" style={{ color: tier.color, fontSize: '1.2rem' }}>{tier.name}</h5>
                      <span className="badge" style={{ background: `${tier.color}30`, color: tier.color, fontWeight: '600', padding: '0.4rem 0.8rem', borderRadius: '20px' }}>{tier.condition}</span>
                    </div>
                  </div>

                  <div style={{ height: '2px', background: `linear-gradient(90deg, ${tier.color}00 0%, ${tier.color}80 50%, ${tier.color}00 100%)`, marginBottom: '1rem' }}></div>

                  <ul className="list-unstyled mb-0">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="mb-3 d-flex align-items-start gap-2">
                        <i className="bi bi-star-fill" style={{ color: tier.color, marginTop: '4px', fontSize: '0.8rem' }}></i>
                        <span className="text-dark fw-500" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuyenLoiThanhVien;
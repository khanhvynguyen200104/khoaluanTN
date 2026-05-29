import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DanhGia = () => {
  // State quản lý form đánh giá
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [user, setUser] = useState(null);

  // State lưu danh sách đánh giá lấy từ Database
  const [reviews, setReviews] = useState([]);

  const getToken = () => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const userObj = JSON.parse(userString);
        return userObj.token || userObj.accessToken || localStorage.getItem('token') || '';
      }
      return localStorage.getItem('token') || '';
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
    // Lấy thông tin user nếu đã đăng nhập
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) {
      setUser(loggedInUser);
      console.log("User đang đăng nhập: ", loggedInUser);
    }

    // Gọi API lấy danh sách đánh giá khi vừa vào trang
    fetchReviews();
  }, []);

  // Hàm gọi API GET
  const fetchReviews = () => {
    fetch('http://localhost:8081/api/danh-gia', {
      headers: buildHeaders()
    })
      .then(res => {
        if (res.status === 401) {
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setReviews(data);
        } else if (Array.isArray(data?.data)) {
          setReviews(data.data);
        } else {
          console.warn('API đánh giá không trả về mảng:', data);
          setReviews([]);
        }
      })
      .catch(err => console.error("Lỗi fetch danh sách đánh giá:", err));
  };

  // Hàm xử lý gửi đánh giá (ĐÃ SỬA LỖI TẬN GỐC)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá!");
      return;
    }
    if (comment.trim() === '') {
      alert("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    // 1. Kiểm tra phải đăng nhập mới được gửi
    if (!user) {
      alert("Bạn chưa đăng nhập! Vui lòng đăng nhập để gửi đánh giá.");
      return;
    }

    // 2. Tìm ID của user (bắt mọi tên biến có thể xảy ra)
    const userId = user.maNguoiDung || user.id || user.ma_nguoi_dung;
    
    if (!userId) {
      alert("Lỗi: Không lấy được ID người dùng! Hãy thử đăng xuất và đăng nhập lại.");
      console.log("Thông tin user bị lỗi thiếu ID: ", user);
      return;
    }

    // 3. Gói dữ liệu gửi thẳng (khớp 100% với Controller mới của Spring Boot)
    const newReviewData = {
      maNguoiDung: userId, 
      soSao: rating,
      noiDung: comment
    };

    // 4. Gọi API POST
    fetch('http://localhost:8081/api/danh-gia', {
      method: 'POST',
      headers: buildHeaders(true),
      body: JSON.stringify(newReviewData)
    })
      .then(async res => {
        if (res.status === 401) {
          alert('Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
          return;
        }
        if (res.ok) {
          alert("Cảm ơn bạn đã gửi đánh giá thành công!");
          setRating(0);
          setComment('');
          fetchReviews(); // Gọi lại để hiển thị ngay
        } else {
          const errorText = await res.text();
          alert("Gửi thất bại! Server báo lỗi: " + errorText);
        }
      })
      .catch(err => {
        console.error("Lỗi khi gửi đánh giá: ", err);
        alert("Không thể kết nối đến Backend!");
      });
  };

  // Hàm hỗ trợ render các ngôi sao
  const renderStars = (numStars) => {
    return [...Array(5)].map((_, index) => {
      index += 1;
      return (
        <i 
          key={index} 
          className={index <= numStars ? "bi bi-star-fill" : "bi bi-star"} 
          style={{ color: '#ffc107', fontSize: '14px', marginRight: '3px' }}
        ></i>
      );
    });
  };

  // Hàm format ngày từ DB
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="container py-5" style={{ maxWidth: '800px' }}>
      {/* Nút quay lại */}
      <div className="mb-4">
        <Link to="/" className="text-decoration-none text-dark d-flex align-items-center gap-2 fw-bold">
          <i className="bi bi-arrow-left"></i> Quay lại Trang chủ
        </Link>
      </div>

      <h3 className="fw-bold mb-4">Đánh giá & Phản hồi dịch vụ</h3>

      {/* KHU VỰC VIẾT ĐÁNH GIÁ */}
      <div className="card shadow-sm border-0 mb-5" style={{ borderRadius: '15px' }}>
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">Gửi đánh giá của bạn</h5>
          <form onSubmit={handleSubmit}>
            
            {/* Chọn Sao */}
            <div className="mb-3 d-flex align-items-center gap-2">
              <span className="fw-medium">Chất lượng dịch vụ: </span>
              <div className="star-rating d-flex">
                {[...Array(5)].map((_, index) => {
                  index += 1;
                  return (
                    <i
                      key={index}
                      className={index <= (hover || rating) ? "bi bi-star-fill" : "bi bi-star"}
                      style={{ 
                        color: '#ffc107', 
                        fontSize: '24px', 
                        cursor: 'pointer',
                        marginRight: '5px' 
                      }}
                      onClick={() => setRating(index)}
                      onMouseEnter={() => setHover(index)}
                      onMouseLeave={() => setHover(rating)}
                    ></i>
                  );
                })}
              </div>
              <span className="text-muted ms-2" style={{ fontSize: '14px' }}>
                {rating > 0 ? `(${rating}/5 sao)` : ''}
              </span>
            </div>

            {/* Nhập nội dung */}
            <div className="mb-3">
              <textarea 
                className="form-control" 
                rows="4" 
                placeholder="Chia sẻ trải nghiệm của bạn tại đây..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ borderRadius: '10px' }}
              ></textarea>
            </div>

            <button type="submit" className="btn text-white fw-bold px-4 py-2" style={{ backgroundColor: '#ff6b81', borderRadius: '10px' }}>
              <i className="bi bi-send me-2"></i> Gửi đánh giá
            </button>
          </form>
        </div>
      </div>

      {/* DANH SÁCH ĐÁNH GIÁ TỪ DATABASE */}
      <h5 className="fw-bold mb-4">Đánh giá từ khách hàng ({reviews.length})</h5>
      
      <div className="d-flex flex-column gap-3">
        {reviews.length === 0 ? (
          <div className="text-center text-muted mt-3 p-4 bg-light" style={{ borderRadius: '10px' }}>
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
          </div>
        ) : (
          reviews.map((review, index) => {
            // Lấy tên người dùng (Xử lý an toàn tránh bị lỗi undefine)
            let displayName = "Khách hàng";
            if (review.nguoiDung && review.nguoiDung.hoTen) {
              displayName = review.nguoiDung.hoTen;
            } else if (review.nguoiDung && review.nguoiDung.tenDangNhap) {
              displayName = review.nguoiDung.tenDangNhap;
            }
            
            return (
              <div key={review.maDanhGia || index} className="card border-0 shadow-sm" style={{ borderRadius: '12px', backgroundColor: '#fdfdfd' }}>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        className="bg-primary text-white d-flex justify-content-center align-items-center fw-bold" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: '15px' }}>{displayName}</div>
                        <div className="text-muted" style={{ fontSize: '12px' }}>{formatDate(review.ngayDanhGia)}</div>
                      </div>
                    </div>
                    <div>
                      {renderStars(review.soSao)}
                    </div>
                  </div>
                  <p className="mb-0 mt-2 text-dark" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    {review.noiDung}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DanhGia;
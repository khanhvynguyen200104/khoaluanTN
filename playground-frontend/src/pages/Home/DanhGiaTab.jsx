import React, { useEffect, useState } from 'react';

const DanhGiaTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

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
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken(); // Lấy token

      const response = await fetch('http://localhost:8081/api/danh-gia', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Gửi kèm token lên server
        }
      });

      if (!response.ok) {
        throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi fetch danh sách đánh giá:', err);
      setError('Không thể tải danh sách đánh giá hoặc bạn không có quyền.');
      setReviews([]); // Đảm bảo danh sách rỗng nếu có lỗi để web không sập
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này không?')) return;

    try {
      setDeletingId(reviewId);
      const token = getToken();
      const response = await fetch(`http://localhost:8081/api/danh-gia/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Lỗi ${response.status}`);
      }

      await fetchReviews();
    } catch (err) {
      console.error('Lỗi xóa đánh giá:', err);
      alert('Không thể xóa đánh giá. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (numStars) => {
    return [...Array(5)].map((_, index) => {
      index += 1;
      return (
        <i
          key={index}
          className={index <= numStars ? 'bi bi-star-fill' : 'bi bi-star'}
          style={{ color: '#ffc107', marginRight: '3px' }}
        ></i>
      );
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + (review.soSao || 0), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="card shadow-sm p-4" style={{ borderRadius: '20px', backgroundColor: '#fff' }}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Quản lý đánh giá</h3>
          <p className="text-muted mb-0">Xem và giám sát phản hồi từ khách hàng ngay tại trang Admin.</p>
        </div>
        <button className="btn btn-outline-primary fw-bold" onClick={fetchReviews}>
          <i className="bi bi-arrow-clockwise me-2"></i>Tải lại
        </button>
      </div>

      <div className="row gx-3 gy-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="p-3 rounded-4" style={{ backgroundColor: '#f0f7ff' }}>
            <div className="text-muted mb-2">Tổng đánh giá</div>
            <div className="fs-2 fw-bold">{reviews.length}</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="p-3 rounded-4" style={{ backgroundColor: '#fff7e6' }}>
            <div className="text-muted mb-2">Điểm trung bình</div>
            <div className="fs-2 fw-bold">{averageRating} / 5</div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="p-3 rounded-4" style={{ backgroundColor: '#ecf9f1' }}>
            <div className="text-muted mb-2">Khách hàng phản hồi</div>
            <div className="fs-2 fw-bold">{reviews.filter((review) => review.noiDung).length}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-3" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5 text-muted">Đang tải đánh giá...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-5 text-muted">Chưa có đánh giá nào để quản lý.</div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {reviews.map((review, index) => {
            let displayName = 'Khách hàng';
            if (review.nguoiDung?.hoTen) displayName = review.nguoiDung.hoTen;
            else if (review.nguoiDung?.tenDangNhap) displayName = review.nguoiDung.tenDangNhap;

            return (
              <div key={review.maDanhGia || index} className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-column flex-md-row">
                    <div>
                      <div className="fw-bold">{displayName}</div>
                      <div className="text-muted" style={{ fontSize: '13px' }}>{formatDate(review.ngayDanhGia)}</div>
                    </div>
                    <div className="text-primary">{renderStars(review.soSao || 0)}</div>
                  </div>
                  <p className="mb-3 text-secondary" style={{ lineHeight: '1.7' }}>
                    {review.noiDung || 'Không có nội dung đánh giá.'}
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark border">#{review.maDanhGia || 'N/A'}</span>
                    {review.trangThai && <span className="badge bg-success">{review.trangThai}</span>}
                    <button
                      className="btn btn-sm btn-outline-danger ms-auto"
                      onClick={() => handleDeleteReview(review.maDanhGia)}
                      disabled={deletingId === review.maDanhGia}
                    >
                      {deletingId === review.maDanhGia ? 'Đang xóa...' : 'Xóa đánh giá'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DanhGiaTab;
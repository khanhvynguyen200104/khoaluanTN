import React from 'react';
import { useNavigate } from 'react-router-dom';

const LienHe = () => {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#f3f5f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* THANH ĐIỀU HƯỚNG BÊN TRÊN */}
            <div className="bg-primary text-white p-3 d-flex align-items-center shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
                <button 
                    onClick={() => navigate(-1)} 
                    className="btn btn-link text-white text-decoration-none fw-bold p-0 d-flex align-items-center"
                    style={{ minWidth: '100px' }}
                >
                    <span className="fs-4 me-2">&#8592;</span> Quay lại
                </button>
                <h5 className="m-0 fw-bold flex-grow-1 text-center pe-5">
                    LIÊN HỆ & HỖ TRỢ
                </h5>
            </div>

            {/* NỘI DUNG CHÍNH */}
            <div className="container d-flex justify-content-center align-items-center flex-grow-1 py-5">
                <div className="card shadow-lg p-4 p-md-5 text-center" style={{ maxWidth: '600px', width: '100%', borderRadius: '24px', border: 'none' }}>
                    
                    {/* LOGO NEWWORLD */}
                    <div className="mb-5">
                        <h1 className="fw-bolder" style={{ fontSize: '3.5rem', color: '#0d6efd', letterSpacing: '3px', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                            NEW<span className="text-warning">WORLD</span>
                        </h1>
                        <p className="text-muted fw-medium mt-2">Khu Vui Chơi Giải Trí Hàng Đầu</p>
                    </div>

                    <div className="row g-4">
                        
                        {/* MỤC HOTLINE */}
                        <div className="col-12">
                            <a href="tel:0909090909" className="text-decoration-none">
                                <div className="p-4 border rounded-4 bg-light d-flex align-items-center shadow-sm" style={{ transition: 'transform 0.2s', cursor: 'pointer' }}>
                                    <div className="bg-success text-white rounded-circle d-flex justify-content-center align-items-center me-4 shadow" style={{ width: '65px', height: '65px', fontSize: '28px' }}>
                                        <i className="bi bi-telephone-fill"></i>
                                    </div>
                                    <div className="text-start">
                                        <h6 className="mb-1 fw-bold text-secondary text-uppercase">Hotline CSKH</h6>
                                        <div className="fs-3 fw-bolder text-success">
                                            0909.090.909
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>

                        {/* MỤC EMAIL */}
                        <div className="col-12">
                            <a href="mailto:newworld@gmail.com" className="text-decoration-none">
                                <div className="p-4 border rounded-4 bg-light d-flex align-items-center shadow-sm" style={{ transition: 'transform 0.2s', cursor: 'pointer' }}>
                                    <div className="bg-danger text-white rounded-circle d-flex justify-content-center align-items-center me-4 shadow" style={{ width: '65px', height: '65px', fontSize: '28px' }}>
                                        <i className="bi bi-envelope-at-fill"></i>
                                    </div>
                                    <div className="text-start">
                                        <h6 className="mb-1 fw-bold text-secondary text-uppercase">Email Hỗ Trợ</h6>
                                        <div className="fs-5 fw-bold text-danger">
                                            newworld@gmail.com
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>

                        {/* MỤC THỜI GIAN HOẠT ĐỘNG */}
                        <div className="col-12">
                            <div className="p-4 border rounded-4 bg-light d-flex align-items-center shadow-sm">
                                <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-4 shadow" style={{ width: '65px', height: '65px', fontSize: '28px' }}>
                                    <i className="bi bi-clock-fill"></i>
                                </div>
                                <div className="text-start">
                                    <h6 className="mb-1 fw-bold text-secondary text-uppercase">Thời Gian Hoạt Động</h6>
                                    <div className="fs-5 fw-bold text-primary">
                                        09:00 Sáng - 09:00 Tối
                                    </div>
                                    <small className="text-muted fw-bold">Từ Thứ 2 đến Chủ Nhật</small>
                                </div>
                            </div>
                        </div>

                    </div>
                    
                    <div className="mt-5 text-muted small">
                        &copy; NewWorld Playground.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LienHe;
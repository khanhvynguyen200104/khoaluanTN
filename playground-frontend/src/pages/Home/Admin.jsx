import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardTab from './DashboardTab';
import HoaDonTab from './HoaDonTab';
import SanPhamTab from './SanPhamTab';
import NguoiDungTab from './NguoiDungTab';
import VoucherTab from './VoucherTab';
import GiaVeTab from './GiaVeTab';
import DanhGiaTab from './DanhGiaTab';
import QuanLyTiecTab from './QuanLyTiecTab';

const Admin = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // ĐÃ BỔ SUNG LẠI STATE ĐÓNG MỞ SIDEBAR
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.roles?.includes('ADMIN')) {
            alert("Bạn không có quyền truy cập trang này!");
            navigate('/');
        }
    }, [navigate]);

    // ĐÃ BỔ SUNG LẠI MẢNG MENU ITEMS
    const menuItems = [
        { id: 'dashboard', icon: 'bi-bar-chart-fill text-info', label: 'Thống Kê' },
        { id: 'hoadon', icon: 'bi-receipt text-success', label: 'Quản Lý Hóa Đơn' },
        { id: 'sanpham', icon: 'bi-box-seam text-warning', label: 'Quản Lý Sản Phẩm' },
        { id: 'nguoidung', icon: 'bi-people-fill text-primary', label: 'Quản Lý Người Dùng' },
        { id: 'voucher', icon: 'bi-ticket-perforated-fill text-danger', label: 'Quản Lý Voucher' },
        { id: 'gia-ve', icon: 'bi-currency-dollar text-success', label: 'Quản Lý Giá Vé' },
        { id: 'danhgia', icon: 'bi-star-fill text-warning', label: 'Quản Lý Đánh Giá' },
        { id: 'quanlytiec', icon: 'bi-balloon-fill text-info', label: 'Quản Lý Tiệc' }
    ];

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fc' }}>
            <div className={`bg-white shadow-sm d-flex flex-column transition-all ${isSidebarOpen ? 'px-3 pt-3' : 'px-0 pt-3'}`} 
                 style={{ width: isSidebarOpen ? '260px' : '0px', overflow: 'hidden', whiteSpace: 'nowrap', transition: 'width 0.3s ease' }}>
                <div className="d-flex align-items-center justify-content-center mb-4 mt-2">
                    <h4 className="fw-bold m-0 text-primary" style={{ letterSpacing: '1px' }}>⚙️ NEWWORLD</h4>
                </div>

                {/* Danh sách các tab quản lý */}
                <ul className="nav nav-pills flex-column mb-auto gap-2 w-100">
                    {menuItems.map(item => (
                        <li className="nav-item" key={item.id}>
                            <button 
                                className={`nav-link w-100 text-start fw-bold d-flex align-items-center gap-3 ${activeTab === item.id ? 'active shadow-sm' : 'text-secondary bg-transparent'}`}
                                onClick={() => setActiveTab(item.id)}
                                style={{ borderRadius: '10px', padding: '12px 15px', border: 'none', transition: '0.2s' }}
                            >
                                <i className={`bi ${item.icon} fs-5`}></i> 
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Nút Đăng Xuất */}
                <div className="mt-auto mb-4 w-100">
                    <hr className="text-secondary" />
                    <Link to="/dang-nhap" className="btn btn-outline-danger w-100 fw-bold d-flex align-items-center justify-content-center gap-2" style={{ borderRadius: '10px', padding: '10px' }}>
                        <i className="bi bi-box-arrow-left fs-5"></i> Đăng xuất
                    </Link>
                </div>
            </div>

            <div className="flex-grow-1 d-flex flex-column" style={{ overflowX: 'hidden' }}>
                
                {/* Thanh Topbar ở trên cùng */}
                <div className="bg-white shadow-sm d-flex align-items-center px-4 py-3 mb-4 sticky-top">
                    
                    {/* Nút 3 gạch để đóng/mở Sidebar */}
                    <button className="btn btn-light border-0 me-3 shadow-sm rounded-circle d-flex align-items-center justify-content-center" 
                            style={{ width: '40px', height: '40px' }} 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <i className="bi bi-list fs-4 text-dark"></i>
                    </button>
                    
                    <h4 className="fw-bold text-dark m-0">Hệ Thống Quản Trị</h4>
                    
                    {/* Profile góc phải */}
                    <div className="ms-auto d-flex align-items-center gap-3">
                        <span className="fw-bold text-primary d-none d-md-block">Chào, Admin</span>
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-person-fill fs-5"></i>
                        </div>
                    </div>
                </div>

                {/* Vùng hiển thị các Tab bên dưới */}
                <div className="px-4 pb-4">
                    {activeTab === 'dashboard' && <DashboardTab />}
                    {activeTab === 'hoadon' && <HoaDonTab />}
                    {activeTab === 'sanpham' && <SanPhamTab />}
                    {activeTab === 'nguoidung' && <NguoiDungTab />}
                    {activeTab === 'voucher' && <VoucherTab />}
                    {activeTab === 'gia-ve' && <GiaVeTab />}
                    {activeTab === 'danhgia' && <DanhGiaTab />}
                    {activeTab === 'quanlytiec' && <QuanLyTiecTab />}
                </div>
                
            </div>
        </div>
    );
};

export default Admin;
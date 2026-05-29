import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TabPos from './TabPos';
import TabLichSu from './TabLichSu';
import TabVongTay from './TabVongtay';

const TrangBanVeNhanVien = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('POS');
    const [nhanVien, setNhanVien] = useState({ ten: 'Đang tải...' });
    const [lichSuBanHang, setLichSuBanHang] = useState([]);

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

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { navigate('/dang-nhap'); return; }
        const user = JSON.parse(userStr);
        const tenNhanVien = user.hoTen || user.tenDangNhap;
        setNhanVien({ ten: tenNhanVien });
        fetchLichSu(tenNhanVien);
    }, [navigate]);

    useEffect(() => {
        if (activeTab !== 'POS' && nhanVien.ten && nhanVien.ten !== 'Đang tải...') {
            fetchLichSu(nhanVien.ten);
        }
    }, [activeTab, nhanVien.ten]);

    const fetchLichSu = async (tenNhanVien = nhanVien.ten) => {
        if (!tenNhanVien || tenNhanVien === 'Đang tải...') return;

        try {
            const token = getToken();
            const res = await fetch(`http://localhost:8081/api/pos/lich-su?nhanVien=${encodeURIComponent(tenNhanVien)}`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                const data = await res.json();
                setLichSuBanHang(Array.isArray(data) ? data : []);
            } else {
                setLichSuBanHang([]);
            }
        } catch (error) {
            console.error("Lỗi:", error);
            setLichSuBanHang([]);
        }
    };

    const handleDangXuat = () => {
        if (window.confirm('Bạn muốn đóng ca trực?')) {
            localStorage.removeItem('user'); navigate('/dang-nhap');
        }
    };

    return (
        <div className="container-fluid position-relative" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '20px' }}>
            <div className="d-flex justify-content-between align-items-center bg-dark text-white p-3 rounded mb-3 shadow-sm">
                <div className="d-flex align-items-center gap-4">
                    <h4 className="m-0 fw-bold">💻 POS - QUẦY VÉ PLAYGROUND</h4>
                    <div className="btn-group bg-white rounded p-1">
                        <button className={`btn btn-sm fw-bold ${activeTab === 'POS' ? 'btn-primary' : 'btn-light text-muted'}`} onClick={() => setActiveTab('POS')}>🛒 Bán Hàng</button>
                        <button className={`btn btn-sm fw-bold ${activeTab === 'LICH_SU' ? 'btn-primary' : 'btn-light text-muted'}`} onClick={() => setActiveTab('LICH_SU')}>📋 Lịch Sử</button>
                        <button className={`btn btn-sm fw-bold ${activeTab === 'VONG_TAY' ? 'btn-primary' : 'btn-light text-muted'} `} onClick={() => setActiveTab('VONG_TAY')}>🎟️ Tra Vòng Tay</button>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <span className="fw-semibold"><i className="bi bi-person-badge me-2"></i>NV: {nhanVien.ten}</span>
                    <button className="btn btn-outline-light btn-sm" onClick={handleDangXuat}>Thoát</button>
                </div>
            </div>

            {activeTab === 'POS' && <TabPos nhanVien={nhanVien} onSaleSuccess={fetchLichSu} />}
            {activeTab === 'LICH_SU' && <TabLichSu lichSuBanHang={lichSuBanHang} />}
            {activeTab === 'VONG_TAY' && <TabVongTay lichSuBanHang={lichSuBanHang} onCheckoutDone={fetchLichSu} />}
        </div>
    );
};

export default TrangBanVeNhanVien;
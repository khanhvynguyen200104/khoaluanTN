import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import DangNhap from './pages/Home/DangNhap';
import DangKy from './pages/Home/DangKy';
import MuaVe from './pages/Home/MuaVe';
//import CuaHang from './pages/Home/CuaHang';
import LichSu from './pages/Home/LichSu';
import DatTiec from './pages/Home/DatTiec';
import Voucher from './pages/Home/Voucher';
import LienHe from './pages/Home/LienHe';
import QuyenLoiThanhVien from './pages/Home/QuyenLoiThanhVien';
// THÊM 2 DÒNG NÀY:
import SuDung from './pages/Home/SuDung'; 
import HoSo from './pages/Home/HoSo';
import AnUong from './pages/Home/AnUong';
import Admin from './pages/Home/Admin';
import DanhGia from './pages/Home/DanhGia';
import TroGiupAI from './pages/Home/TroGiupAI';
import TrangBanVeNhanVien from './pages/Home/TrangBanVeNhanVien';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dang-nhap" element={<DangNhap />} />
        <Route path="/dang-ky" element={<DangKy />} />
        <Route path="/mua-ve" element={<MuaVe />} />
        <Route path="/lich-su" element={<LichSu />} />
        <Route path="/dat-tiec" element={<DatTiec />} />
        <Route path="/voucher" element={<Voucher />} />
        <Route path='/dat-tiec' element={<DatTiec />} />
        <Route path='/danh-gia' element={<DanhGia />} />
        <Route path='/quyen-loi' element={<QuyenLoiThanhVien />} />
        <Route path="/trang-su-dung" element={<SuDung />} />
        <Route path="/ho-so" element={<HoSo />} />
        <Route path="/an-uong" element={<AnUong />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/lien-he" element={<LienHe />} />
        <Route path="/tro-giup-ai" element={<TroGiupAI />} />
        <Route path="/pos-nhan-vien" element={<TrangBanVeNhanVien />} />
      </Routes>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../playground-frontend/src/pages/Home/Home';
import DangNhap from './pages/Auth/DangNhap';
import MuaVe from './pages/Ticket/MuaVe';
import CuaHang from './pages/Store/CuaHang';
import LichSu from './pages/History/LichSu';

// THÊM 2 DÒNG NÀY:
import SuDung from './pages/Ticket/SuDung'; 
import HoSo from './pages/Profile/HoSo';
import AnUong from './pages/Food/AnUong';
import Admin from './pages/Admin/Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dang-nhap" element={<DangNhap />} />
        <Route path="/mua-ve" element={<MuaVe />} />
        <Route path="/cua-hang" element={<CuaHang />} />
        <Route path="/lich-su" element={<LichSu />} />
        
        {/* THÊM 2 ROUTE NÀY NỮA: */}
        <Route path="/trang-su-dung" element={<SuDung />} />
        <Route path="/ho-so" element={<HoSo />} />
        <Route path="/an-uong" element={<AnUong />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
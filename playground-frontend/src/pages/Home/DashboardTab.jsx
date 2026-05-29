import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const DashboardTab = () => {
    const [stats, setStats] = useState({ 
        doanhThu7Ngay: [], 
        doanhThu12Thang: [],
        doanhThuHomNay: 0, 
        doanhThuThangNay: 0,
        doanhThuNamNay: 0,
        veBanHomNay: 0, 
        doanhThuDoAnHomNay: 0,
        soDonDatTiec: 0
    });

    // State cho filter
    const [filterDay, setFilterDay] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [filterStats, setFilterStats] = useState(null);
    const [filterLoading, setFilterLoading] = useState(false);
    
    // State cho dự đoán khách AI
    const [forecast, setForecast] = useState(null);
    const [forecastWeek, setForecastWeek] = useState(null);
    const [loadingForecast, setLoadingForecast] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;
        
        if (!token) return;
        
        const loadDashboard = () => {
            fetch('http://localhost:8081/api/admin/dashboard', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                })
                .then(data => setStats(data))
                .catch(err => console.error('❌ Error:', err));
        };
        
        loadDashboard();
        const interval = setInterval(loadDashboard, 10000);
        return () => clearInterval(interval);
    }, []);

    const chartData7Ngay = {
        labels: stats.doanhThu7Ngay?.map(item => item.ngay) || [],
        datasets: [{
            label: 'Doanh thu (VNĐ)',
            data: stats.doanhThu7Ngay?.map(item => item.tongCong) || [],
            backgroundColor: 'rgba(78, 115, 223, 0.8)',
            borderRadius: 5
        }]
    };

    const chartData12Thang = {
        labels: stats.doanhThu12Thang?.map(item => item.thang) || [],
        datasets: [{
            label: 'Doanh thu năm nay (VNĐ)',
            data: stats.doanhThu12Thang?.map(item => item.tongCong) || [],
            borderColor: '#e74a3b',
            backgroundColor: 'rgba(231, 74, 59, 0.2)',
            pointBackgroundColor: '#e74a3b',
            borderWidth: 3,
            tension: 0.3, 
            fill: true
        }]
    };

    const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN') + ' đ';

    const handleFilter = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;
        
        if (!token) {
            alert('❌ Phiên đăng nhập đã hết hạn');
            return;
        }

        if (!filterDay && !filterMonth && !filterYear) {
            alert('⚠️ Vui lòng chọn ít nhất ngày hoặc tháng');
            return;
        }

        setFilterLoading(true);
        
        const params = new URLSearchParams();
        const dayToSend = filterDay.trim();
        const monthToSend = filterMonth.trim() || new Date().getMonth() + 1; 
        const yearToSend = filterYear.trim() || new Date().getFullYear(); 
        
        if (dayToSend) {
            params.append('day', dayToSend);
            params.append('month', monthToSend); 
            params.append('year', yearToSend);
        } else if (monthToSend) {
            params.append('month', monthToSend);
            params.append('year', yearToSend);
        } else {
            params.append('year', yearToSend);
        }

        try {
            const res = await fetch(`http://localhost:8081/api/admin/dashboard/filter?${params}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                const error = await res.json();
                alert('❌ ' + (error.loi || 'Lỗi lọc doanh thu'));
                return;
            }

            const data = await res.json();
            setFilterStats(data);
        } catch (err) {
            alert('❌ Lỗi kết nối');
        } finally {
            setFilterLoading(false);
        }
    };

    const loadForecast = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;
        if (!token) return;

        setLoadingForecast(true);
        try {
            const res = await fetch('http://localhost:8081/api/admin/dashboard/forecast/next-day', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setForecast(data);
            }
        } catch (err) {
            console.error('Lỗi tải dự đoán:', err);
        } finally {
            setLoadingForecast(false);
        }
    };

    const loadForecastWeek = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;
        if (!token) return;

        try {
            const res = await fetch('http://localhost:8081/api/admin/dashboard/forecast/week', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setForecastWeek(data);
            }
        } catch (err) {
            console.error('Lỗi tải dự đoán tuần:', err);
        }
    };

    useEffect(() => {
        loadForecast();
        loadForecastWeek();
    }, []);

    const handleExportExcel = () => {
        const workbook = XLSX.utils.book_new();
        const summarySheet = XLSX.utils.json_to_sheet([
            { KPI: 'Doanh thu Hôm Nay', Giá_trị: formatCurrency(stats.doanhThuHomNay) },
            { KPI: 'Doanh thu Năm Nay', Giá_trị: formatCurrency(stats.doanhThuNamNay) },
            { KPI: 'Vé bán Hôm Nay', Giá_trị: stats.veBanHomNay + ' vé' },
        ]);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');

        const sheet7Ngay = XLSX.utils.json_to_sheet(
            stats.doanhThu7Ngay?.map(item => ({ Ngày: item.ngay, 'Doanh thu (VNĐ)': item.tongCong })) || []
        );
        XLSX.utils.book_append_sheet(workbook, sheet7Ngay, '7 Ngày');

        const sheet12Thang = XLSX.utils.json_to_sheet(
            stats.doanhThu12Thang?.map(item => ({ Tháng: item.thang, 'Doanh thu (VNĐ)': item.tongCong })) || []
        );
        XLSX.utils.book_append_sheet(workbook, sheet12Thang, '12 Tháng');

        XLSX.writeFile(workbook, `bao-cao-thong-ke-${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const title = 'Báo cáo thống kê';
            const dateLabel = new Date().toLocaleDateString('vi-VN');

            doc.setFontSize(18);
            doc.text(title, 40, 50);
            doc.setFontSize(11);
            doc.text(`Ngày tạo: ${dateLabel}`, 40, 70);

            const summaryTable = doc.autoTable({
                startY: 90,
                head: [['KPI', 'Giá trị']],
                body: [
                    ['Doanh thu Hôm Nay', formatCurrency(stats.doanhThuHomNay)],
                    ['Doanh thu Năm Nay', formatCurrency(stats.doanhThuNamNay)],
                    ['Vé bán Hôm Nay', stats.veBanHomNay + ' vé'],
                ],
                styles: { fontSize: 10 },
                headStyles: { fillColor: '#4e73df' }
            });

            const row7Ngay = (stats.doanhThu7Ngay || []).map(item => [item.ngay || '', formatCurrency(item.tongCong)]);
            const chart7Table = doc.autoTable({
                startY: (summaryTable?.finalY || 90) + 20,
                head: [['Ngày', 'Doanh thu']],
                body: row7Ngay.length ? row7Ngay : [['-', '-']],
                styles: { fontSize: 10 },
                headStyles: { fillColor: '#36b9cc' }
            });

            const row12Thang = (stats.doanhThu12Thang || []).map(item => [item.thang || '', formatCurrency(item.tongCong)]);
            doc.autoTable({
                startY: (chart7Table?.finalY || (summaryTable?.finalY || 90) + 20) + 20,
                head: [['Tháng', 'Doanh thu']],
                body: row12Thang.length ? row12Thang : [['-', '-']],
                styles: { fontSize: 10 },
                headStyles: { fillColor: '#e74a3b' }
            });

            doc.save(`bao-cao-thong-ke-${new Date().toISOString().slice(0,10)}.pdf`);
        } catch (err) {
            alert('Không thể xuất PDF. Vui lòng thử lại hoặc tải lại trang.');
        }
    };

    return (
        <div>
            {/* =========================================================
                HEADER VÀ THANH LỌC (FILTER) GIAO DIỆN MỚI
            ========================================================= */}
            <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center mb-4 gap-3">
                <h3 className="fw-bold text-dark m-0" style={{ letterSpacing: '-0.5px' }}>Báo cáo thống kê</h3>
                
                <div className="d-flex flex-wrap align-items-center gap-3">
                    {/* Vùng Lọc (Filter) */}
                    <div className="d-flex align-items-center bg-white border rounded-2 p-1 shadow-sm">
                        <select className="form-select form-select-sm border-0 shadow-none fw-semibold text-secondary" style={{ width: '130px', backgroundColor: 'transparent', cursor: 'pointer' }}>
                            <option>Doanh thu</option>
                        </select>
                        
                        <div className="vr mx-1 text-muted"></div>
                        
                        <div className="d-flex align-items-center px-2 gap-1">
                            <i className="bi bi-calendar3 text-muted me-1"></i>
                            <input 
                                type="number" 
                                className="form-control form-control-sm border-0 shadow-none text-center p-0" 
                                placeholder="Ngày" min="1" max="31" 
                                value={filterDay} onChange={(e) => setFilterDay(e.target.value)}
                                style={{ width: '40px', backgroundColor: 'transparent' }}
                            />
                            <span className="text-muted">/</span>
                            <select 
                                className="form-select form-select-sm border-0 shadow-none text-center p-0 ps-1" 
                                value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
                                style={{ width: '55px', backgroundColor: 'transparent', cursor: 'pointer' }}
                            >
                                <option value="">Tháng</option>
                                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                            </select>
                            <span className="text-muted">/</span>
                            <input 
                                type="number" 
                                className="form-control form-control-sm border-0 shadow-none text-center p-0" 
                                placeholder="Năm" 
                                value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
                                style={{ width: '50px', backgroundColor: 'transparent' }}
                            />
                        </div>

                        <button 
                            className="btn btn-primary btn-sm fw-bold px-3 d-flex align-items-center gap-2 ms-2 rounded-2" 
                            onClick={handleFilter} 
                            disabled={filterLoading}
                            style={{ height: '32px' }}
                        >
                            <i className="bi bi-funnel"></i> {filterLoading ? '...' : 'Lọc'}
                        </button>

                        {filterStats && (
                            <button 
                                className="btn btn-light btn-sm text-danger ms-1 border-0" 
                                title="Xóa bộ lọc" 
                                onClick={() => {
                                    setFilterDay(''); setFilterMonth(''); setFilterYear(new Date().getFullYear().toString()); setFilterStats(null);
                                }}
                            >
                                <i className="bi bi-x-circle-fill"></i>
                            </button>
                        )}
                    </div>

                    {/* Nút xuất báo cáo */}
                    <div className="d-flex gap-2">
                        <button className="btn btn-white border bg-white shadow-sm btn-sm fw-bold text-success d-flex align-items-center gap-2 px-3" style={{ height: '42px', borderRadius: '8px' }} onClick={handleExportExcel}>
                            <i className="bi bi-file-earmark-excel"></i> Xuất Excel
                        </button>
                        <button className="btn btn-white border bg-white shadow-sm btn-sm fw-bold text-danger d-flex align-items-center gap-2 px-3" style={{ height: '42px', borderRadius: '8px' }} onClick={handleExportPDF}>
                            <i className="bi bi-file-earmark-pdf"></i> Xuất PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* HIỂN THỊ KẾT QUẢ TÌM KIẾM NẾU CÓ */}
            {filterStats && (
                <div className="card shadow-sm mb-4 border-0" style={{ borderRadius: '12px', background: '#f8f9fa' }}>
                    <div className="card-header bg-success text-white py-3" style={{ borderRadius: '12px 12px 0 0' }}>
                        <h6 className="m-0 fw-bold"><i className="bi bi-check2-circle me-2"></i>Kết Quả Lọc: {filterStats.filterDesc}</h6>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <div className="p-3 bg-white rounded-3 shadow-sm border-left" style={{ borderLeft: '4px solid #1cc88a' }}>
                                    <div className="small fw-bold text-success text-uppercase">💰 Doanh Thu</div>
                                    <div className="h4 mb-0 fw-bold text-dark mt-2">{formatCurrency(filterStats.doanhThuFilter)}</div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-3 bg-white rounded-3 shadow-sm border-left" style={{ borderLeft: '4px solid #4e73df' }}>
                                    <div className="small fw-bold text-primary text-uppercase">🎫 Vé Bán Được</div>
                                    <div className="h4 mb-0 fw-bold text-dark mt-2">{filterStats.soVeBan} vé</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                HÀNG 1: THỐNG KÊ TÀI CHÍNH (GỌN GÀNG 3 THẺ)
            ========================================================= */}
            <div className="row mb-4">
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm h-100 py-2 border-left-primary" style={{ borderLeft: '4px solid #4e73df', borderRadius: '12px' }}>
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs fw-bold text-primary text-uppercase mb-1">Doanh thu Hôm Nay</div>
                                    <div className="h5 mb-0 fw-bold text-gray-800">{Number(stats.doanhThuHomNay).toLocaleString()} đ</div>
                                </div>
                                <div className="col-auto">
                                    <i className="bi bi-cash-coin text-gray-300" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm h-100 py-2 border-left-danger" style={{ borderLeft: '4px solid #e74a3b', borderRadius: '12px' }}>
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs fw-bold text-danger text-uppercase mb-1">Doanh thu Năm Nay</div>
                                    <div className="h4 mb-0 fw-bold text-gray-800">{Number(stats.doanhThuNamNay).toLocaleString()} đ</div>
                                </div>
                                <div className="col-auto">
                                    <i className="bi bi-graph-up-arrow text-gray-300" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm h-100 py-2 border-left-success" style={{ borderLeft: '4px solid #1cc88a', borderRadius: '12px' }}>
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs fw-bold text-success text-uppercase mb-1">Vé bán (Hôm Nay)</div>
                                    <div className="h4 mb-0 fw-bold text-gray-800">{stats.veBanHomNay} vé</div>
                                </div>
                                <div className="col-auto">
                                    <i className="bi bi-ticket-detailed text-gray-300" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================================
                HÀNG 2: KHU VỰC BIỂU ĐỒ (ĐÃ ĐƯỢC ĐẨY LÊN TRÊN)
            ========================================================= */}
            <div className="row mb-4">
                <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm h-100 border-0 rounded-4">
                        <div className="card-header bg-white py-3 border-bottom-0 pt-4 px-4">
                            <h6 className="m-0 fw-bold text-primary">Biểu Đồ Doanh Thu 7 Ngày Qua</h6>
                        </div>
                        <div className="card-body px-4 pb-4">
                            <div style={{ height: '320px' }}>
                                <Bar data={chartData7Ngay} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm h-100 border-0 rounded-4">
                        <div className="card-header bg-white py-3 border-bottom-0 pt-4 px-4">
                            <h6 className="m-0 fw-bold text-danger">Biểu Đồ Doanh Thu 12 Tháng (Năm Nay)</h6>
                        </div>
                        <div className="card-body px-4 pb-4">
                            <div style={{ height: '320px' }}>
                                <Line data={chartData12Thang} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================================
                HÀNG 3: DỰ ĐOÁN AI (ĐÃ ĐƯỢC HẠ XUỐNG DƯỚI CÙNG)
            ========================================================= */}
            {forecast && (
                <div className="card shadow-sm mb-4 border-0" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <div className="card-header text-white py-3" style={{ borderRadius: '12px 12px 0 0', background: 'transparent', borderBottom: '2px solid rgba(255,255,255,0.3)' }}>
                        <h6 className="m-0 fw-bold"><i className="bi bi-robot me-2"></i>Dự Đoán Lượng Khách (AI)</h6>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <div className="p-4 bg-white rounded-4 shadow-sm h-100">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <div className="small fw-bold text-muted text-uppercase mb-1">Ngày Hôm Sau</div>
                                            <div className="h4 fw-bold text-dark mb-2">{forecast.ngayDuKien}</div>
                                            <div className="small text-secondary">
                                                <span className="badge bg-info me-2">{forecast.thuTrongTuan}</span>
                                                <span className="badge bg-secondary">
                                                    {forecast.loaiNgay === 'holiday' ? '🎉 Ngày Lễ' : forecast.loaiNgay === 'weekend' ? '🎊 Cuối Tuần' : '📅 Ngày Thường'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="my-3 border-light" />
                                    <div className="mb-3">
                                        <div className="small fw-bold text-primary text-uppercase mb-2">👥 Dự Đoán Khách</div>
                                        <div className="display-6 fw-bold text-danger">{forecast.soKhachDuKien}</div>
                                        <small className="text-muted">Khoảng tin: {forecast.khoangTin} khách</small>
                                    </div>
                                    <div className="bg-light p-3 rounded-3 small text-muted">
                                        <strong>💡 Lý do:</strong> {forecast.lyDo}
                                    </div>
                                    <div className="mt-3 text-end">
                                        <small className="text-muted fst-italic">Độ chính xác: {forecast.doChinhXac}</small>
                                    </div>
                                </div>
                            </div>

                            {/* DỰ ĐOÁN CẢ TUẦN TỚI */}
                            {forecastWeek && (
                                <div className="col-md-6 mb-3">
                                    <div className="p-4 bg-white rounded-4 shadow-sm h-100 d-flex flex-column">
                                        <div className="small fw-bold text-muted text-uppercase mb-3">📊 Dự Đoán Cả Tuần Tới</div>
                                        <div className="table-responsive flex-grow-1" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                            <table className="table table-sm table-hover mb-0">
                                                <tbody>
                                                    {Object.entries(forecastWeek).map(([day, guests], idx) => (
                                                        <tr key={idx}>
                                                            <td className="small fw-bold text-dark align-middle py-2">{day}</td>
                                                            <td className="text-end py-2">
                                                                <span className="badge bg-primary px-3 py-2 rounded-pill">{guests} khách</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <hr className="my-3 border-light" />
                                        <small className="text-muted mt-auto">
                                            <i className="bi bi-info-circle me-1"></i> Dự đoán dựa trên dữ liệu lịch sử, loại ngày và ML.
                                        </small>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardTab;
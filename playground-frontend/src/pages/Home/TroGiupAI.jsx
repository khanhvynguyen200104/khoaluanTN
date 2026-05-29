import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TroGiupAI = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { id: 1, text: "Xin chào! Tôi là trợ lý ảo của NewWorld. Tôi có thể giúp gì cho bạn hôm nay?", sender: 'ai' }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Tự động cuộn xuống dưới cùng khi có tin nhắn mới
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput("");
        setIsTyping(true);

        // Giả lập AI suy nghĩ và trả lời sau 0.8-1.5 giây
        setTimeout(() => {
            const aiResponse = getAIResponse(currentInput);
            const aiMsg = { id: Date.now() + 1, text: aiResponse, sender: 'ai' };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 800 + Math.random() * 700);
    };

    const getAIResponse = (userInput) => {
        const input = userInput.toLowerCase().trim();
        
        // Mảng các quy tắc trả lời
        const responses = [
            // ===== THÔNG TIN CHUNG =====
            { keywords: ['newworld', 'khu vui chơi', 'về', 'là gì'], response: '🎡 NewWorld là khu vui chơi lớn nhất tại thành phố với đầy đủ trò chơi hiện đại dành cho mọi lứa tuổi. Chúng tôi cam kết mang lại trải nghiệm vui vẻ và an toàn cho gia đình bạn!' },
            
            // ===== GIÁ VÉ & LOẠI VÉ =====
            { keywords: ['giá vé', 'bao nhiêu tiền', 'giá'], response: '💰 Giá vé NewWorld:\n• Vé lẻ Trẻ em: 90.000đ\n• Vé lẻ Người lớn: 120.000đ\n(Bao gồm tất cả trò chơi trong khu)\n• Vé gia đình (2 người lớn + 2 trẻ): 350.000đ\n• Thành viên SILVER: Giảm 15%\n• Thành viên GOLD: Giảm 20%\n• Thành viên DIAMOND: Giảm 25%' },
            { keywords: ['vé gia đình', 'vé nhóm', 'vé gói'], response: '👨‍👩‍👧‍👦 Các gói vé đặc biệt:\n• Vé Gia đình (2N+2T): 350.000đ\n• Vé Bạn bè 5 người: Giảm 10%\n• Vé công ty (trên 20 người): Giảm 15% + quà tặng\nLiên hệ: 0388-123-456 để đặt vé nhóm!' },
            { keywords: ['khuyến mãi', 'giảm giá', 'ưu đãi', 'đi 5 tặng 1'], response: '🎁 Chương trình khuyến mãi hiện tại:\n• Đi 5 lần tặng 1 lần (thành viên)\n• Thứ 2-4 giảm 20% cho nhóm trên 5 người\n• Sinh nhật: Vé sinh nhật giảm 30%\n• Tuyển dụng thành viên SILVER/GOLD/DIAMOND để có chiết khấu hàng tháng' },
            
            // ===== GIỜ MỞ CỬA =====
            { keywords: ['giờ mở cửa', 'mấy giờ', 'giờ', 'ngày', 'tuần'], response: '⏰ Giờ mở cửa NewWorld:\n• Thứ 2-5: 09:00 - 21:00\n• Thứ 6-7: 08:00 - 22:00\n• Chủ nhật: 08:00 - 21:00\n• Các ngày lễ: 08:00 - 22:00\nKhuyên: Tránh giờ cao điểm (10-13h, 17-20h) để tránh tắc đông!' },
            
            // ===== ĐỊA CHỈ & CÁCH ĐI =====
            { keywords: ['địa chỉ', 'ở đâu', 'cách đi', 'đi tới', 'đường'], response: '📍 NewWorld tọa lạc tại:\nĐịa chỉ: Số 123 Đường Nguyễn Huệ, Quận 1, TP.HCM\n🚕 Cách đi:\n• Xe bus: Tuyến 7, 13, 25\n• Xe máy: Bãi GIỮ XE có sẵn\n• Ô tô: Bãi đậu trong khu (không phí)\n• Google Maps: Tìm "NewWorld" để xem đường đi' },
            
            // ===== CÂU HỎI VỀ AN TOÀN & ĐỘ TUỔI =====
            { keywords: ['an toàn', 'an toàn chứ', 'an toàn không', 'trẻ em', 'bé', 'trẻ'], response: '🛡️ An toàn tại NewWorld:\n✓ Tất cả trò chơi được kiểm định hàng tháng\n✓ Nhân viên y tế 24/7 có mặt\n✓ Bảo hiểm du lịch bao gồm\n✓ Trẻ em dưới 5 tuổi phải có người lớn kèm theo\n✓ Các trò chơi cảnh báo về chiều cao & cân nặng an toàn' },
            { keywords: ['trẻ bao nhiêu tuổi', 'độ tuổi', 'em bé', 'nhiều tuổi'], response: '👧 Độ tuổi khuyên cáo:\n• 2-5 tuổi: Khu vui chơi trẻ nhỏ (trong nhà)\n• 5-12 tuổi: Trò chơi gia đình & nhẹ nhàng\n• 12+ tuổi: Tất cả các trò chơi\n• Mọi lứa tuổi: Xích đu, đu quay, tàu lượn nhẹ\nNhân viên sẵn sàng tư vấn nếu không chắc chắn!' },
            
            // ===== TRÒI CHƠI CỤ THỂ =====
            { keywords: ['trò chơi', 'gì', 'có trò', 'xích đu', 'tàu lượn', 'đu quay'], response: '🎢 Các trò chơi nổi bật:\n• Tàu lượn siêu tốc (độ cao 30m)\n• Đu quay lớn (nhìn toàn thành phố)\n• Xích đu bay\n• Tàu lượn nhẹ cho gia đình\n• Khu vui chơi trẻ nhỏ (trong nhà)\n• Phòng chơi game tương tác\nCó tất cả 15+ trò chơi đa dạng!' },
            
            // ===== NHÀ ĂN & DỊCH VỤ =====
            { keywords: ['ăn', 'cơm', 'đồ ăn', 'nhà hàng', 'quán', 'uống'], response: '🍔 Dịch vụ ăn uống:\n• Cổng 1: Quán ăn vặt đa dạng\n• Cổng 2: Nhà hàng gia đình (cơm, canh)\n• Cổng 3: Quán café & kem\n• Giá cả: 20.000 - 100.000đ/suất\n⚠️ Cấm mang đồ ăn từ ngoài, nhưng được mang nước uống!' },
            { keywords: ['bãi giữ xe', 'gửi xe', 'đỗ xe', 'xe máy'], response: '🏍️ Dịch vụ bãi xe:\n• Bãi gửi xe máy: Miễn phí\n• Bãi đỗ ô tô: Miễn phí\n• Xe đạp: Có khu riêng an toàn\n• Bảo vệ 24/7, an toàn tuyệt đối' },
            
            // ===== SỰ KIỆN & SỰ THƯỜNG =====
            { keywords: ['sự kiện', 'lễ', 'đặc biệt', 'sinh nhật', 'tiệc'], response: '🎉 Sự kiện & Tiệc:\n• Sinh nhật: Gói đặc biệt + bánh + bóng bay (chỉ 2 triệu)\n• Tiệc công ty: Khu riêng + cơm chiều + đặc ưu\n• Sự kiện mùa: Halloween, Giáng sinh, Tết Âm lịch\nLiên hệ: 0388-123-456 để đặt sự kiện!' },
            
            // ===== HỎI VỀ VÉ ONLINE & ĐẶT VÉ =====
            { keywords: ['đặt vé', 'mua vé', 'online', 'qua mạng'], response: '🎫 Cách mua vé:\n• Mua trực tuyến: Qua app (giảm 5%)\n• Quầy bán vé: Tại cổng 1, 2, 3\n• Gọi đặt: 0388-123-456\n• Đặt vé nhóm: Tối thiểu 5 người\n✓ Vé online có hiệu lực 30 ngày từ khi mua' },
            { keywords: ['hoàn vé', 'hủy', 'trả vé', 'hoàn tiền'], response: '💳 Chính sách hoàn vé:\n• Vé online: Hoàn 100% nếu hủy trước 24h\n• Vé trực tiếp: Không được hoàn lại\n• Vé nhóm: Không được hoàn lại nhưng có thể đổi ngày\nLiên hệ quầy để xử lý hoàn vé!' },
            
            // ===== CÂU HỎI CHUNG CHUNG =====
            { keywords: ['thành viên', 'hạng', 'silver', 'gold', 'diamond'], response: '⭐ Chương trình thành viên:\n• SILVER (Bạc): 15% giảm giá mỗi vé\n• GOLD (Vàng): 20% giảm giá + ưu tiên xếp hàng\n• DIAMOND (Kim cương): 25% giảm giá + VIP pass\n→ Tham gia miễn phí, tích lũy điểm mỗi khi mua vé!' },
            { keywords: ['liên hệ', 'điện thoại', 'email', 'facebook', 'hỗ trợ'], response: '📞 Thông tin liên hệ:\n• Hotline: 0388-123-456 (8h-21h hàng ngày)\n• Email: support@newworld.vn\n• Facebook: NewWorld Amusement Park\n• Chat trực tiếp: Available 24/7\nChúng tôi sẵn sàng hỗ trợ bạn!' },
            { keywords: ['cảm ơn', 'tạm biệt', 'bye', 'tks', 'thanks'], response: '😊 Rất sẵn lòng giúp bạn! Chúc bạn có ngày thăm NewWorld tuyệt vời và vui vẻ. Hẹn gặp bạn lại! 🎡' },
        ];

        // Tìm response phù hợp
        for (let rule of responses) {
            if (rule.keywords.some(keyword => input.includes(keyword))) {
                return rule.response;
            }
        }

        // Nếu không tìm thấy, trả lời chung chung
        return '🤔 Xin lỗi, tôi chưa hiểu rõ. Bạn có thể hỏi về:\n• 💰 Giá vé\n• ⏰ Giờ mở cửa\n• 🎢 Các trò chơi\n• 🍔 Dịch vụ ăn uống\n• 📍 Địa chỉ & cách đi\n• 🎫 Đặt vé\n• 🛡️ An toàn\nHoặc bạn có thể liên hệ hỗ trợ viên của chúng tôi!';
    };

    return (
        <div style={{ backgroundColor: '#eef2f7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="bg-primary text-white p-3 shadow-sm d-flex align-items-center" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                <button onClick={() => navigate(-1)} className="btn btn-link text-white text-decoration-none p-0 me-3">
                    <span className="fs-4">&#8592;</span>
                </button>
                <div className="d-flex align-items-center">
                    <div className="bg-white rounded-circle d-flex justify-content-center align-items-center me-2" style={{ width: '40px', height: '40px' }}>
                        <i className="bi bi-robot text-primary fs-4"></i>
                    </div>
                    <div>
                        <h6 className="m-0 fw-bold">TRỢ LÝ ẢO NEWWORLD</h6>
                        <small className="opacity-75">Sẵn sàng hỗ trợ 24/7</small>
                    </div>
                </div>
            </div>

            {/* Khung Chat */}
            <div className="container flex-grow-1 py-4 overflow-auto" style={{ maxWidth: '800px' }}>
                <div className="d-flex flex-column gap-3">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div className={`p-3 shadow-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white text-dark'}`} 
                                 style={{ 
                                     maxWidth: '80%', 
                                     borderRadius: msg.sender === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                                     fontSize: '0.95rem'
                                 }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    
                    {/* Hiệu ứng đang gõ tin nhắn */}
                    {isTyping && (
                        <div className="d-flex justify-content-start">
                            <div className="bg-white p-3 shadow-sm" style={{ borderRadius: '20px 20px 20px 0' }}>
                                <div className="spinner-grow spinner-grow-sm text-primary me-1" role="status"></div>
                                <div className="spinner-grow spinner-grow-sm text-primary me-1" role="status"></div>
                                <div className="spinner-grow spinner-grow-sm text-primary" role="status"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input gửi tin nhắn */}
            <div className="p-3 bg-white border-top">
                <div className="container" style={{ maxWidth: '800px' }}>
                    <form onSubmit={handleSend} className="input-group">
                        <input 
                            type="text" 
                            className="form-control border-primary-subtle py-2 px-3" 
                            placeholder="Nhập câu hỏi của bạn (ví dụ: Giá vé bao nhiêu?)..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            style={{ borderRadius: '25px 0 0 25px' }}
                        />
                        <button className="btn btn-primary px-4" type="submit" style={{ borderRadius: '0 25px 25px 0' }}>
                            <i className="bi bi-send-fill"></i>
                        </button>
                    </form>
                    <div className="text-center mt-2">
                        <small className="text-muted">💡 Gợi ý: "Giá vé", "Giờ mở cửa", "Trò chơi", "Địa chỉ", "Khuyến mãi", "Sinh nhật"...</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TroGiupAI;
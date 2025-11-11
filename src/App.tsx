import { useState } from 'react';
import { Home, Bell, User, ArrowLeftRight, Calendar, Users, Train } from 'lucide-react';
import QuickBooking from './components/QuickBooking';
import BookingModal from './components/BookingModal';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    departure: '서울',
    arrival: '부산',
    departureTime: '05:13',
    arrivalTime: '06:12',
    date: '2025.11.10(월)',
    passengers: { adults: 1, children: 0, infants: 0 },
    trainType: '일반실',
    timeSlot: '05시 이후'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between sticky top-0 z-40">
        <h1 className="text-2xl font-bold text-gray-900">홈</h1>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-6 h-6 text-gray-700" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <User className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {/* Quick Booking Section */}
        <QuickBooking
          bookingData={bookingData}
          onOpenModal={() => setShowModal(true)}
        />

        {/* Fast Booking Section */}
        <section className="px-5 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">빠른 예매</h2>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
              더보기
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">집</span>
                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">KTX</span>
              </div>
              <div className="text-sm text-gray-900 font-medium">서울 → 부산</div>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">출장</span>
                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">KTX</span>
              </div>
              <div className="text-sm text-gray-900 font-medium">광명 → 부산</div>
            </button>
          </div>
        </section>

        {/* Services Section */}
        <section className="px-5 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">이런 서비스는 어떠세요?</h2>

          <div className="grid grid-cols-4 gap-6">
            {[
              { icon: '🧭', label: '길안내', sub: '역까지 안내' },
              { icon: '📍', label: '역사위치', sub: '실시간 확인' },
              { icon: '🅿️', label: '주차', sub: '역 주차장' },
              { icon: '🚌', label: '공항버스', sub: '연계 교통' },
              { icon: '🚗', label: '렌터카', sub: '도착지에서' },
              { icon: '🚙', label: '카셰어링', sub: '편리하게' },
              { icon: '🚚', label: '짐배송', sub: '가볍게 이동' },
              { icon: '🎫', label: '커피&팡', sub: '간편 주문' }
            ].map((service, idx) => (
              <button
                key={idx}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-2xl group-hover:bg-blue-100 transition-colors">
                  {service.icon}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">{service.label}</div>
                  <div className="text-xs text-gray-500">{service.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-3">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-blue-600">
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">홈</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
            <Train className="w-6 h-6" />
            <span className="text-xs font-medium">승차권확인</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
            <Calendar className="w-6 h-6" />
            <span className="text-xs font-medium">관광상품</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">더보기</span>
          </button>
        </div>
      </nav>

      {/* Booking Modal */}
      {showModal && (
        <BookingModal
          bookingData={bookingData}
          onClose={() => setShowModal(false)}
          onUpdate={setBookingData}
        />
      )}
    </div>
  );
}

export default App;

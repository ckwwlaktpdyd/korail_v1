import { useState } from 'react';
import { Home, Bell, User, ArrowLeftRight, Calendar, Users, Train } from 'lucide-react';
import QuickBooking from './components/QuickBooking';
import QuickBookingList from './components/QuickBookingList';
import BookingModal from './components/BookingModal';
import PaymentModal from './components/PaymentModal';
import PaymentSuccessModal from './components/PaymentSuccessModal';
import { QuickBooking as QuickBookingType, supabase } from './lib/supabase';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [refreshQuickPurchases, setRefreshQuickPurchases] = useState(0);
  const [bookingData, setBookingData] = useState({
    departure: '서울',
    arrival: '부산',
    departureTime: '05:13',
    arrivalTime: '06:12',
    date: '2025.11.01(금)',
    passengers: { adults: 1, children: 0, infants: 0 },
    trainType: '일반실',
    timeSlot: '8시 이후',
    trainNumber: 'KTX 061'
  });

  const handlePaymentConfirm = () => {
    setShowPaymentModal(false);
    setShowSuccessModal(true);
  };

  const handleViewTicket = () => {
    setShowSuccessModal(false);
    alert('승차권 확인 페이지로 이동합니다');
  };

  const handleSelectBooking = (booking: QuickBookingType) => {
    const timeSlot = booking.departure_time || '8시 이후';
    setBookingData({
      ...bookingData,
      departure: booking.departure,
      arrival: booking.arrival,
      trainNumber: `${booking.train_type} 061`,
      timeSlot: timeSlot,
      passengers: {
        adults: booking.adults,
        children: booking.children,
        infants: booking.infants,
      },
    });
  };

  const handleQuickPurchase = (booking: QuickBookingType) => {
    const timeSlot = booking.departure_time || '8시 이후';

    // Extract time from departure_time (e.g., "오전 09:00" -> "09:00")
    const timeMatch = timeSlot.match(/(\d{2}):(\d{2})/);
    const departureTime = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : '14:00';

    // Calculate arrival time (add 1 hour for demo)
    const [hours, minutes] = departureTime.split(':').map(Number);
    const arrivalHour = (hours + 1).toString().padStart(2, '0');
    const arrivalTime = `${arrivalHour}:${minutes.toString().padStart(2, '0')}`;

    setBookingData({
      ...bookingData,
      departure: booking.departure,
      arrival: booking.arrival,
      trainNumber: `${booking.train_type} 061`,
      timeSlot: timeSlot,
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      passengers: {
        adults: booking.adults,
        children: booking.children,
        infants: booking.infants,
      },
    });
    setShowPaymentModal(true);
  };

  const handleQuickPurchaseSaved = async (bookingId: string, openModal: boolean = false) => {
    try {
      const { data, error } = await supabase
        .from('quick_bookings')
        .select('*')
        .eq('id', bookingId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setRefreshQuickPurchases(prev => prev + 1);

        if (openModal) {
          setBookingData({
            ...bookingData,
            departure: data.departure,
            arrival: data.arrival,
            trainNumber: `${data.train_type} 061`,
            passengers: {
              adults: data.adults,
              children: data.children,
              infants: data.infants,
            },
          });
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error('Failed to load quick booking:', error);
    }
  };

  const handleUpdatePassengers = (passengers: { adults: number; children: number; infants: number }) => {
    setBookingData({
      ...bookingData,
      passengers,
    });
  };

  const handleUpdateDate = (date: string) => {
    setBookingData({
      ...bookingData,
      date,
    });
  };

  const handleUpdateTime = (time: string) => {
    setBookingData({
      ...bookingData,
      timeSlot: time,
    });
  };

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
          onUpdatePassengers={handleUpdatePassengers}
          onUpdateDate={handleUpdateDate}
          onUpdateTime={handleUpdateTime}
        />

        {/* Fast Booking Section */}
        <QuickBookingList
          onSelectBooking={handleSelectBooking}
          onQuickPurchaseSaved={handleQuickPurchaseSaved}
          onQuickPurchase={handleQuickPurchase}
        />

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
          onNext={() => {
            setShowModal(false);
            setShowPaymentModal(true);
          }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          bookingData={bookingData}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePaymentConfirm}
        />
      )}

      {/* Payment Success Modal */}
      {showSuccessModal && (
        <PaymentSuccessModal
          onClose={() => setShowSuccessModal(false)}
          onViewTicket={handleViewTicket}
        />
      )}
    </div>
  );
}

export default App;

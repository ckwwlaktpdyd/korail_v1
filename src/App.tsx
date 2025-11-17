import { useState, useRef, useEffect } from 'react';
import { Bell, User, ArrowRight, Clock, Users, Home, Ticket, Map, MoreHorizontal, Info, Zap } from 'lucide-react';
import QuickPurchaseRegistrationModal, { QuickPurchaseData } from './components/QuickPurchaseRegistrationModal';
import QuickPurchaseModal from './components/QuickPurchaseModal';
import RecentTripsModal from './components/RecentTripsModal';
import StationPickerModal from './components/StationPickerModal';
import DateTimePicker from './components/DateTimePicker';
import PassengerPicker from './components/PassengerPicker';
import PaymentModal from './components/PaymentModal';
import PaymentSuccessModal from './components/PaymentSuccessModal';
import { TrainSearchResults } from './components/TrainSearchResults';
import { QuickBooking, getQuickBookings, getBookingHistory, getQuickPurchases, addQuickBooking, deleteQuickBookings, updateQuickBooking, saveBookingHistory, toggleQuickPurchase } from './lib/supabase';

function App() {
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');
  const [departure, setDeparture] = useState('선택');
  const [arrival, setArrival] = useState('선택');
  const [date, setDate] = useState('일정을 선택해주세요.');
  const [time, setTime] = useState('선택');
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [showPassengerPicker, setShowPassengerPicker] = useState(false);

  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<{ departure: string; arrival: string } | null>(null);
  const [quickBookings, setQuickBookings] = useState<QuickBooking[]>([]);
  const [bookingHistory, setBookingHistory] = useState<QuickBooking[]>([]);
  const [quickPurchases, setQuickPurchases] = useState<QuickBooking[]>([]);
  const [isRecentTripsModalOpen, setIsRecentTripsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<QuickBooking | null>(null);
  const [isStationPickerOpen, setIsStationPickerOpen] = useState(false);
  const [stationPickerMode, setStationPickerMode] = useState<'departure' | 'arrival'>('departure');
  const [selectedRecentTrip, setSelectedRecentTrip] = useState<QuickBooking | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showTrainSearch, setShowTrainSearch] = useState(false);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadQuickBookings();
    loadBookingHistory();
    loadQuickPurchases();
  }, []);

  const loadQuickBookings = async () => {
    const bookings = await getQuickBookings();
    setQuickBookings(bookings);
  };

  const loadBookingHistory = async () => {
    const history = await getBookingHistory();
    setBookingHistory(history);
  };

  const loadQuickPurchases = async () => {
    const purchases = await getQuickPurchases();
    setQuickPurchases(purchases);
  };

  const handleSwapStations = () => {
    const temp = departure;
    setDeparture(arrival);
    setArrival(temp);
  };

  const handleTripLongPressStart = (departure: string, arrival: string) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedTrip({ departure, arrival });
      setIsRegistrationModalOpen(true);
    }, 1000);
  };

  const handleTripLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleRecentTripClick = (booking: QuickBooking) => {
    if (selectedRecentTrip?.id === booking.id) {
      setSelectedRecentTrip(null);
      setDeparture('서울');
      setArrival('부산');
      setDate('2025.11.18(화)');
      setTime('10시 이후');
      setPassengers({ adults: 1, children: 0, infants: 0 });
    } else {
      setSelectedRecentTrip(booking);
      setDeparture(booking.departure);
      setArrival(booking.arrival);

      const departureTimeMatch = booking.departure_time.match(/(\d{4}\.\d{2}\.\d{2}\([^)]+\))\s+(\d{2}시 이후)/);
      if (departureTimeMatch) {
        setDate(departureTimeMatch[1]);
        setTime(departureTimeMatch[2]);
      }

      setPassengers({
        adults: booking.adults,
        children: booking.children,
        infants: booking.infants,
      });

      setIsRecentTripsModalOpen(false);
    }
  };

  const handleQuickPurchaseClick = () => {
    if (selectedRecentTrip) {
      setIsPaymentModalOpen(true);
    }
  };

  const [isPaymentSuccessModalOpen, setIsPaymentSuccessModalOpen] = useState(false);
  const [isQuickPurchaseModalOpen, setIsQuickPurchaseModalOpen] = useState(false);
  const [quickPurchaseData, setQuickPurchaseData] = useState<{ departure: string; arrival: string } | null>(null);
  const [currentBookingData, setCurrentBookingData] = useState<any>(null);

  const handlePaymentConfirm = (totalPrice: number) => {
    console.log('handlePaymentConfirm called with totalPrice:', totalPrice);
    console.log('selectedRecentTrip:', selectedRecentTrip);
    if (selectedRecentTrip) {
      const bookingData = {
        ...selectedRecentTrip,
        departureTime: time,
        arrivalTime: '12:30',
        date: date,
        trainNumber: '101',
        totalPrice: totalPrice,
      };
      console.log('Setting currentBookingData:', bookingData);
      setCurrentBookingData(bookingData);
    }
    setIsPaymentModalOpen(false);
    setIsPaymentSuccessModalOpen(true);
  };

  const handleSaveBookingHistory = async (bookingData: any): Promise<string | null> => {
    console.log('handleSaveBookingHistory called with:', bookingData);
    try {
      const result = await saveBookingHistory(bookingData);
      console.log('saveBookingHistory result:', result);
      await loadBookingHistory();
      console.log('Booking history reloaded');
      return result?.id || null;
    } catch (error) {
      console.error('Error in handleSaveBookingHistory:', error);
      return null;
    }
  };

  const handlePaymentSuccessClose = () => {
    setIsPaymentSuccessModalOpen(false);
    setSelectedRecentTrip(null);
    setDeparture('서울');
    setArrival('부산');
    setDate('2025.11.18(화)');
    setTime('10시 이후');
    setPassengers({ adults: 1, children: 0, infants: 0 });
  };

  const handleOpenQuickPurchaseFromSuccess = (bookingData: any) => {
    setQuickPurchaseData({
      departure: bookingData.departure,
      arrival: bookingData.arrival,
    });
    setIsPaymentSuccessModalOpen(false);
    setIsQuickPurchaseModalOpen(true);
  };

  const handleViewTicket = () => {
    setIsPaymentSuccessModalOpen(false);
    alert('승차권 페이지로 이동합니다.');
  };

  const handleSaveQuickPurchase = async (data: QuickPurchaseData, departure?: string, arrival?: string) => {
    console.log('handleSaveQuickPurchase called with:', { data, departure, arrival, editingBooking, selectedTrip });
    const seatClassText = data.seatClass === 'general' ? '일반실' : '특실';
    const seatDirectionText = data.direction === 'forward' ? '순방향' : '역방향';

    const getNextWeekday = (targetWeekday: number) => {
      const today = new Date();
      const currentWeekday = today.getDay();
      let daysToAdd = targetWeekday - currentWeekday;
      if (daysToAdd <= 0) daysToAdd += 7;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysToAdd);
      return nextDate;
    };

    const nextDate = getNextWeekday(data.selectedWeekday);
    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[data.selectedWeekday];
    const formattedDate = `${year}.${month}.${day}(${weekday})`;
    const timeOnly = data.selectedTime.replace(' 이후', '');
    const formattedTime = `${timeOnly} 이후`;

    if (editingBooking) {
      await updateQuickBooking(editingBooking.id, {
        label: data.nickname,
        adults: data.adults,
        children: data.children,
        infants: data.infants,
        departure_time: `${formattedDate} ${formattedTime}`,
        seat_class: seatClassText,
        seat_direction: seatDirectionText,
        car_number: data.carNumber,
        seat_numbers: data.seatNumbers,
      });
      setEditingBooking(null);
    } else if (departure && arrival) {
      console.log('Adding quick booking with departure/arrival:', departure, arrival);
      const result = await addQuickBooking({
        label: data.nickname,
        departure: departure,
        arrival: arrival,
        adults: data.adults,
        children: data.children,
        infants: data.infants,
        departure_time: `${formattedDate} ${formattedTime}`,
        seat_class: seatClassText,
        seat_direction: seatDirectionText,
        car_number: data.carNumber,
        seat_numbers: data.seatNumbers,
        is_quick_purchase: true,
      });
      console.log('Added quick booking result:', result);
    } else if (selectedTrip) {
      console.log('Adding quick booking with selectedTrip:', selectedTrip);
      await addQuickBooking({
        label: data.nickname,
        departure: selectedTrip.departure,
        arrival: selectedTrip.arrival,
        adults: data.adults,
        children: data.children,
        infants: data.infants,
        departure_time: `${formattedDate} ${formattedTime}`,
        seat_class: seatClassText,
        seat_direction: seatDirectionText,
        car_number: data.carNumber,
        seat_numbers: data.seatNumbers,
        is_quick_purchase: true,
      });
      setSelectedTrip(null);
    }

    await loadQuickBookings();
    await loadBookingHistory();
    await loadQuickPurchases();
    setIsRegistrationModalOpen(false);
  };

  const handleDeleteBookings = async (ids: string[]) => {
    console.log('handleDeleteBookings called with ids:', ids);
    const result = await deleteQuickBookings(ids);
    console.log('Delete result:', result);
    await loadQuickBookings();
    await loadBookingHistory();
    await loadQuickPurchases();
    console.log('All data reloaded');
  };

  const handleEditBooking = (booking: QuickBooking) => {
    setEditingBooking(booking);
    setSelectedTrip({ departure: booking.departure, arrival: booking.arrival });
    setIsRegistrationModalOpen(true);
  };

  const handleCloseRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
    setEditingBooking(null);
    setSelectedTrip(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">홈</h1>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <User className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {/* Train Search Card */}
        <section className="mx-4 mt-4">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setTripType('oneway')}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  tripType === 'oneway'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                편도
              </button>
              <button
                onClick={() => setTripType('roundtrip')}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  tripType === 'roundtrip'
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                왕복
              </button>
            </div>

            {/* Station Selection */}
            <div className="p-5 flex gap-3">
              {/* Left Content */}
              <div className="flex-1">
                {selectedRecentTrip && (
                  <div className="flex items-center gap-1.5 mb-3 text-orange-600">
                    <Zap className="w-4 h-4 fill-orange-600" />
                    <span className="text-xs font-medium">최근 여정이 자동으로 입력되었습니다</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1 font-medium">출발</div>
                    <button
                      onClick={() => {
                        setStationPickerMode('departure');
                        setIsStationPickerOpen(true);
                      }}
                      className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {departure}
                    </button>
                  </div>

                  <button
                    onClick={handleSwapStations}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 mt-4"
                  >
                    <ArrowRight className="w-5 h-5 text-gray-600" />
                  </button>

                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1 font-medium">도착</div>
                    <button
                      onClick={() => {
                        setStationPickerMode('arrival');
                        setIsStationPickerOpen(true);
                      }}
                      className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {arrival}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-gray-200 mb-4 mt-1"></div>

                {/* Date & Time Selection */}
                <button
                  onClick={() => setShowDateTimePicker(!showDateTimePicker)}
                  className="w-full flex items-center gap-2.5 py-2.5 hover:bg-gray-50 rounded-lg transition-colors mb-1.5"
                >
                  <Clock className="w-[18px] h-[18px] text-gray-600" />
                  <div className="flex-1 text-left">
                    <div className="text-sm text-gray-900">
                      {date === '일정을 선택해주세요.' ? date : `${date} ${time}`}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </button>

                {/* Passenger Selection */}
                <button
                  onClick={() => setShowPassengerPicker(!showPassengerPicker)}
                  className="w-full flex items-center gap-2.5 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Users className="w-[18px] h-[18px] text-gray-600" />
                  <div className="flex-1 text-left">
                    <div className="text-sm text-gray-900">
                      {passengers.adults === 1 && passengers.children === 0 && passengers.infants === 0 && date === '일정을 선택해주세요.'
                        ? '인원을 선택해주세요.'
                        : `성인 ${passengers.adults}명${passengers.children > 0 ? `, 어린이 ${passengers.children}명` : ''}${passengers.infants > 0 ? `, 유아 ${passengers.infants}명` : ''}`
                      }
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </button>
              </div>

              {/* Vertical Search Button */}
              <button
                onClick={selectedRecentTrip ? handleQuickPurchaseClick : () => setShowTrainSearch(true)}
                className={`rounded-2xl flex flex-col items-center justify-center gap-3 transition-all shadow-lg px-6 py-8 flex-shrink-0 min-w-[90px] ${
                  selectedRecentTrip
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/40'
                    : 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-600/30'
                } text-white`}
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold whitespace-nowrap leading-snug">
                  {selectedRecentTrip ? (
                    <>간편<br/>구매</>
                  ) : (
                    <>열차<br/>조회</>
                  )}
                </div>
              </button>
            </div>

            {/* Date Time Picker - Outside flex container */}
            {showDateTimePicker && (
              <div className="px-4 pb-4">
                <DateTimePicker
                  selectedDate={date}
                  selectedTime={time}
                  onDateChange={setDate}
                  onTimeChange={setTime}
                />
              </div>
            )}

            {/* Passenger Picker - Outside flex container */}
            {showPassengerPicker && (
              <div className="px-4 pb-4">
                <PassengerPicker
                  passengers={passengers}
                  onChange={setPassengers}
                />
              </div>
            )}
          </div>
        </section>

        {/* Recent Trips Section */}
        <section className="mx-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">최근 여정 내역</h2>
              <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <Info className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <button
              onClick={() => setIsRecentTripsModalOpen(true)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-all hover:scale-105 active:scale-95"
            >
              더보기
            </button>
          </div>

          {/* Recent Trip Cards - 2 Column Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[...quickPurchases, ...bookingHistory.filter(b => !b.is_quick_purchase)].slice(0, 4).map((booking) => {
              return (
                <div
                  key={booking.id}
                  onClick={() => {
                    if (booking.is_quick_purchase) {
                      handleRecentTripClick(booking);
                    }
                  }}
                  onTouchStart={() => {
                    if (booking.is_quick_purchase) {
                      handleTripLongPressStart(booking.departure, booking.arrival);
                    }
                  }}
                  onTouchEnd={() => {
                    if (booking.is_quick_purchase) {
                      handleTripLongPressEnd();
                    }
                  }}
                  className={`bg-white rounded-xl p-3.5 shadow-sm border-2 transition-all ${
                    selectedRecentTrip?.id === booking.id
                      ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-orange-200'
                      : 'border-gray-100'
                  } ${booking.is_quick_purchase ? 'cursor-pointer active:scale-[0.98]' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`inline-block px-3 py-1 border-2 text-xs font-bold rounded-lg ${
                      selectedRecentTrip?.id === booking.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-blue-600 text-blue-600'
                    }`}>
                      {booking.label}
                    </div>
                    {booking.is_quick_purchase && (
                      <div className="inline-block px-2.5 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                        간편구매
                      </div>
                    )}
                  </div>

                  <div className="text-xl font-bold text-gray-900 mb-2">
                    {booking.departure} → {booking.arrival}
                  </div>

                  <div className="text-sm text-gray-700">
                    {booking.departure_time ? (() => {
                      if (booking.is_quick_purchase) {
                        // 간편구매: "2025.11.18(화) 11시 이후" -> "화요일 11시 이후" 변환
                        const match = booking.departure_time.match(/\((.)\)\s+(\d+)시/);
                        if (match) {
                          const [, weekday, hour] = match;
                          const weekdayMap: { [key: string]: string } = {
                            '월': '월요일',
                            '화': '화요일',
                            '수': '수요일',
                            '목': '목요일',
                            '금': '금요일',
                            '토': '토요일',
                            '일': '일요일'
                          };
                          return `${weekdayMap[weekday] || weekday} ${hour}시 이후`;
                        }
                      } else {
                        // 일반 여정: "2025년 11월 18일 (화) 07:20:00" -> "2025.11.18(화)" 변환
                        const dateMatch = booking.departure_time.match(/(\d{4})년\s+(\d+)월\s+(\d+)일\s+\((.)\)/);
                        if (dateMatch) {
                          const [, year, month, day, weekday] = dateMatch;
                          return `${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}(${weekday})`;
                        }
                      }
                      return booking.departure_time;
                    })() : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2.5 z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button className="flex flex-col items-center gap-0.5 text-blue-600">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">홈</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-600 transition-colors">
            <Ticket className="w-5 h-5" />
            <span className="text-[10px] font-medium">승차권확인</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-600 transition-colors">
            <Map className="w-5 h-5" />
            <span className="text-[10px] font-medium">관광상품</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">더보기</span>
          </button>
        </div>
      </nav>

      {/* Quick Purchase Registration Modal */}
      {selectedTrip && (
        <QuickPurchaseRegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={handleCloseRegistrationModal}
          departure={selectedTrip.departure}
          arrival={selectedTrip.arrival}
          onSave={handleSaveQuickPurchase}
          editingBooking={editingBooking}
        />
      )}

      {/* Recent Trips Modal */}
      <RecentTripsModal
        isOpen={isRecentTripsModalOpen}
        onClose={() => setIsRecentTripsModalOpen(false)}
        bookings={bookingHistory}
        onDelete={handleDeleteBookings}
        onEdit={handleEditBooking}
        onTripClick={handleRecentTripClick}
        onTripLongPressStart={handleTripLongPressStart}
        onTripLongPressEnd={handleTripLongPressEnd}
        selectedTripId={selectedRecentTrip?.id}
        onToggleQuickPurchase={async (id: string, isQuickPurchase: boolean) => {
          await toggleQuickPurchase(id, isQuickPurchase);
          await loadQuickBookings();
          await loadBookingHistory();
          await loadQuickPurchases();
        }}
        onQuickPurchaseSave={async (data, departure, arrival) => {
          await handleSaveQuickPurchase(data, departure, arrival);
          await loadQuickPurchases();
          await loadQuickBookings();
          await loadBookingHistory();
          setIsRecentTripsModalOpen(false);
          setIsQuickPurchaseSuccessOpen(true);
        }}
      />

      {/* Payment Modal */}
      {selectedRecentTrip && isPaymentModalOpen && (
        <PaymentModal
          bookingData={{
            departure: selectedRecentTrip.departure,
            arrival: selectedRecentTrip.arrival,
            departureTime: time,
            arrivalTime: '12:30',
            date: date,
            passengers: {
              adults: selectedRecentTrip.adults,
              children: selectedRecentTrip.children,
              infants: selectedRecentTrip.infants,
            },
            trainType: selectedRecentTrip.train_type,
            trainNumber: '101',
            seatClass: selectedRecentTrip.seat_class,
            seatDirection: selectedRecentTrip.seat_direction,
            carNumber: selectedRecentTrip.car_number,
            seatNumbers: selectedRecentTrip.seat_numbers,
          }}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={handlePaymentConfirm}
          onSearchOtherTrains={() => {
            setIsPaymentModalOpen(false);
            setShowTrainSearch(true);
          }}
        />
      )}

      {/* Payment Success Modal */}
      {isPaymentSuccessModalOpen && currentBookingData && (
        <PaymentSuccessModal
          isFromQuickPurchase={currentBookingData.is_quick_purchase || false}
          onClose={handlePaymentSuccessClose}
          onSaveBookingHistory={handleSaveBookingHistory}
          onToggleQuickPurchase={async (id: string, isQuickPurchase: boolean) => {
            await toggleQuickPurchase(id, isQuickPurchase);
            await loadQuickBookings();
            await loadBookingHistory();
            await loadQuickPurchases();
          }}
          onOpenQuickPurchase={handleOpenQuickPurchaseFromSuccess}
          bookingData={{
            departure: currentBookingData.departure,
            arrival: currentBookingData.arrival,
            departureTime: currentBookingData.departureTime,
            arrivalTime: currentBookingData.arrivalTime,
            date: currentBookingData.date,
            passengers: {
              adults: currentBookingData.adults,
              children: currentBookingData.children,
              infants: currentBookingData.infants,
            },
            trainType: currentBookingData.train_type,
            trainNumber: currentBookingData.trainNumber,
            carNumber: currentBookingData.car_number,
            seatNumbers: currentBookingData.seat_numbers ? currentBookingData.seat_numbers.split(', ').map(Number) : undefined,
            seatClass: currentBookingData.seat_class,
            seatDirection: currentBookingData.seat_direction,
            totalPrice: currentBookingData.totalPrice,
          }}
        />
      )}

      {/* Station Picker Modal */}
      <StationPickerModal
        isOpen={isStationPickerOpen}
        onClose={() => setIsStationPickerOpen(false)}
        onSelect={(station) => {
          if (stationPickerMode === 'departure') {
            setDeparture(station);
            setIsStationPickerOpen(false);
            // 출발역 선택 후 자동으로 도착역 선택 모달 열기
            setTimeout(() => {
              setStationPickerMode('arrival');
              setIsStationPickerOpen(true);
            }, 100);
          } else {
            setArrival(station);
            setIsStationPickerOpen(false);
          }
        }}
        title={stationPickerMode === 'departure' ? '출발역 선택' : '도착역 선택'}
        currentStation={stationPickerMode === 'departure' ? departure : arrival}
        excludeStation={stationPickerMode === 'departure' ? (arrival !== '선택' ? arrival : undefined) : (departure !== '선택' ? departure : undefined)}
      />

      {/* Train Search Results */}
      {showTrainSearch && (
        <div className="fixed inset-0 z-50 bg-white">
          <TrainSearchResults
            onBack={() => setShowTrainSearch(false)}
            onBackToHome={() => setShowTrainSearch(false)}
            onSaveAsQuickBooking={async (bookingData) => {
              const existingBookings = await getQuickBookings();
              const nextNumber = existingBookings.length + 1;
              const label = `여정 ${nextNumber}`;

              const result = await addQuickBooking({
                label,
                departure: bookingData.departure,
                arrival: bookingData.arrival,
                train_type: bookingData.trainType,
                adults: bookingData.passengers.adults,
                children: bookingData.passengers.children,
                infants: bookingData.passengers.infants,
                departure_time: `${bookingData.date} ${bookingData.time}`,
              });

              await loadQuickBookings();
              return result?.id || null;
            }}
            onDeleteQuickBooking={async (id: string) => {
              await deleteQuickBooking(id);
              await loadQuickBookings();
            }}
            onOpenQuickPurchase={handleOpenQuickPurchaseFromSuccess}
            onSaveBookingHistory={handleSaveBookingHistory}
            onToggleQuickPurchase={async (id: string, isQuickPurchase: boolean) => {
              await toggleQuickPurchase(id, isQuickPurchase);
              await loadQuickBookings();
              await loadBookingHistory();
              await loadQuickPurchases();
            }}
            initialDeparture={departure}
            initialArrival={arrival}
            initialDate={date}
            initialTime={time !== '선택' ? time : undefined}
            initialPassengerCount={passengers.adults + passengers.children + passengers.infants}
          />
        </div>
      )}

      {/* Quick Purchase Modal */}
      {isQuickPurchaseModalOpen && quickPurchaseData && (
        <QuickPurchaseModal
          departure={quickPurchaseData.departure}
          arrival={quickPurchaseData.arrival}
          onClose={() => {
            setIsQuickPurchaseModalOpen(false);
            setQuickPurchaseData(null);
          }}
          onSaved={async (bookingId: string) => {
            await loadQuickBookings();
            setIsQuickPurchaseModalOpen(false);
            setQuickPurchaseData(null);
          }}
        />
      )}
    </div>
  );
}

export default App;

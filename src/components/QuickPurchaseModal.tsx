import { useState } from 'react';
import { ArrowLeft, Info, CreditCard, ChevronDown } from 'lucide-react';
import QuickPurchaseSuccessModal from './QuickPurchaseSuccessModal';
import { supabase } from '../lib/supabase';

interface QuickPurchaseModalProps {
  departure: string;
  arrival: string;
  onClose: () => void;
  onSaved?: (bookingId: string, openModal?: boolean) => void;
}

export default function QuickPurchaseModal({ departure, arrival, onClose, onSaved }: QuickPurchaseModalProps) {
  const [alias, setAlias] = useState('');
  const [selectedTrainType, setSelectedTrainType] = useState('KTX');
  const [selectedClass, setSelectedClass] = useState('일반실');
  const [departureStation, setDepartureStation] = useState(departure);
  const [arrivalStation, setArrivalStation] = useState(arrival);
  const [selectedPayment, setSelectedPayment] = useState('kakaopay');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [seatPosition, setSeatPosition] = useState('창가');
  const [seatDirection, setSeatDirection] = useState('순방향');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [selectedDays, setSelectedDays] = useState<string[]>(['금']);
  const [departureTime, setDepartureTime] = useState('오후 07:00');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedBookingId, setSavedBookingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const trainTypes = [
    { id: 'KTX', label: 'KTX' },
    { id: 'SAEMAEUL_ITX', label: '새마을/ITX-마음' },
    { id: 'MUGUNGHWA', label: '무궁화' },
    { id: 'ITX_CHEONGCHUN', label: 'ITX-청춘' }
  ];

  const classTypes = [
    { id: '일반실', label: '일반실' },
    { id: '특실', label: '특실' }
  ];

  const paymentMethods = [
    { id: 'kakaopay', name: '카카오페이' },
    { id: 'card', name: '신용/체크카드' },
    { id: 'toss', name: '토스페이' },
    { id: 'naverpay', name: '네이버페이' },
    { id: 'payco', name: 'PAYCO' },
  ];

  const getSelectedPaymentName = () => {
    return paymentMethods.find(m => m.id === selectedPayment)?.name || '카카오페이';
  };

  const seatPositions = ['창가', '바깥'];
  const seatDirections = ['순방향', '역방향'];
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  const timeSlots = [
    '오전 06:00', '오전 07:00', '오전 08:00', '오전 09:00', '오전 10:00', '오전 11:00',
    '오후 12:00', '오후 01:00', '오후 02:00', '오후 03:00', '오후 04:00', '오후 05:00',
    '오후 06:00', '오후 07:00', '오후 08:00', '오후 09:00', '오후 10:00', '오후 11:00'
  ];

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const incrementCount = (type: 'adults' | 'children' | 'infants') => {
    if (type === 'adults') setAdults(prev => prev + 1);
    if (type === 'children') setChildren(prev => prev + 1);
    if (type === 'infants') setInfants(prev => prev + 1);
  };

  const decrementCount = (type: 'adults' | 'children' | 'infants') => {
    if (type === 'adults' && adults > 0) setAdults(prev => prev - 1);
    if (type === 'children' && children > 0) setChildren(prev => prev - 1);
    if (type === 'infants' && infants > 0) setInfants(prev => prev - 1);
  };

  const handleRegister = async () => {
    if (!alias.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quick_bookings')
        .insert({
          label: alias.trim(),
          departure: departureStation,
          arrival: arrivalStation,
          train_type: selectedTrainType,
          seat_class: selectedClass,
          seat_position: seatPosition,
          seat_direction: seatDirection,
          adults,
          children,
          infants,
          days_of_week: selectedDays,
          departure_time: departureTime,
          payment_method: selectedPayment,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSavedBookingId(data.id);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Failed to save quick booking:', error);
      alert('간편구매 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-5 py-4 flex items-center">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-3">간편구매 등록</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-6">
          <div className="flex items-start gap-2 mb-8 p-4 bg-gray-50 rounded-lg">
            <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">
              자주 이용하는 예매 정보를 미리 등록해 열차 조회 없이 바로 구매할 수 있는 서비스 입니다.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">간편구매 등록 필수 항목</h2>
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3">
                자주 사용하는 경로를 쉽게 식별할 수 있는 이름을 입력하세요.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">별칭</label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                  placeholder="진 가는 길, 무산 출장"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">열차종류</label>
                <div className="grid grid-cols-2 gap-3">
                  {trainTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedTrainType(type.id)}
                      className={`py-3.5 px-4 rounded-lg border-2 font-medium transition-all ${
                        selectedTrainType === type.id
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">객실등급</label>
                <div className="grid grid-cols-2 gap-3">
                  {classTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedClass(type.id)}
                      className={`py-3.5 px-4 rounded-lg border-2 font-medium transition-all ${
                        selectedClass === type.id
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">출발역</label>
                  <input
                    type="text"
                    value={departureStation}
                    onChange={(e) => setDepartureStation(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                    placeholder="서울역"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">도착역</label>
                  <input
                    type="text"
                    value={arrivalStation}
                    onChange={(e) => setArrivalStation(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                    placeholder="부산역"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">결제 수단</label>
                <button
                  onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                  className="w-full bg-gray-50 rounded-lg px-4 py-3.5 flex items-center justify-between hover:bg-gray-100 transition-colors border-2 border-gray-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <CreditCard className="w-5 h-5 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{getSelectedPaymentName()}</span>
                  </div>
                  <span className="px-3 py-1 text-sm text-gray-600 font-medium border border-gray-300 rounded-lg hover:bg-white transition-colors">
                    변경
                  </span>
                </button>

                {showPaymentMethods && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => {
                          setSelectedPayment(method.id);
                          setShowPaymentMethods(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                          selectedPayment === method.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="text-sm font-medium">{method.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">좌석 및 인원 선택</h2>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">좌석 위치</label>
                <div className="grid grid-cols-2 gap-3">
                  {seatPositions.map((position) => (
                    <button
                      key={position}
                      onClick={() => setSeatPosition(position)}
                      className={`py-3.5 px-4 rounded-xl border-2 font-medium transition-all text-base ${
                        seatPosition === position
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {position}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">좌석 방향</label>
                <div className="grid grid-cols-2 gap-3">
                  {seatDirections.map((direction) => (
                    <button
                      key={direction}
                      onClick={() => setSeatDirection(direction)}
                      className={`py-3.5 px-4 rounded-xl border-2 font-medium transition-all text-base ${
                        seatDirection === direction
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {direction}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">성인</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => decrementCount('adults')}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-xl font-bold text-gray-700"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-gray-900 w-12 text-center">{adults}</span>
                    <button
                      onClick={() => incrementCount('adults')}
                      className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center text-xl font-bold text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">어린이</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => decrementCount('children')}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-xl font-bold text-gray-700"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-gray-900 w-12 text-center">{children}</span>
                    <button
                      onClick={() => incrementCount('children')}
                      className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center text-xl font-bold text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">유아</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => decrementCount('infants')}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-xl font-bold text-gray-700"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-gray-900 w-12 text-center">{infants}</span>
                    <button
                      onClick={() => incrementCount('infants')}
                      className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center text-xl font-bold text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">출발 요일 및 시간 선택</h2>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">반복 요일</label>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`py-3 rounded-xl border-2 font-bold transition-all text-base ${
                        selectedDays.includes(day)
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">출발 시간</label>
                <button
                  onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3.5 flex items-center justify-between hover:bg-gray-100 transition-colors border-2 border-gray-300"
                >
                  <span className="text-base font-medium text-blue-600">{departureTime}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${
                    showTimeDropdown ? 'rotate-180' : ''
                  }`} />
                </button>

                {showTimeDropdown && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-2 max-h-60 overflow-y-auto">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          setDepartureTime(time);
                          setShowTimeDropdown(false);
                        }}
                        className={`w-full px-4 py-3 rounded-lg mb-1 transition-colors text-left ${
                          departureTime === time
                            ? 'bg-blue-600 text-white font-medium'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="border-t border-gray-200 p-5">
        <button
          onClick={handleRegister}
          disabled={isLoading || !alias.trim()}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? '등록 중...' : '등록하기 >'}
        </button>
      </div>

      {showSuccess && (
        <QuickPurchaseSuccessModal
          alias={alias}
          departure={departureStation}
          arrival={arrivalStation}
          days={selectedDays}
          time={departureTime}
          onGoToBooking={() => {
            onClose();
            if (savedBookingId) {
              onSaved?.(savedBookingId, true);
            }
          }}
          onGoHome={() => {
            onClose();
            if (savedBookingId) {
              onSaved?.(savedBookingId, false);
            }
          }}
          onBack={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}

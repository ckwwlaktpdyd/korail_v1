import { X, Calendar, Users, Armchair, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { QuickBooking } from '../lib/supabase';

interface QuickPurchaseRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  departure: string;
  arrival: string;
  onSave: (data: QuickPurchaseData) => void;
  editingBooking?: QuickBooking | null;
}

export interface QuickPurchaseData {
  nickname: string;
  selectedWeekday: number;
  selectedTime: string;
  adults: number;
  children: number;
  infants: number;
  seatClass: 'general' | 'special';
  direction: 'forward' | 'backward';
  carNumber?: number;
  seatNumbers?: string;
}

export default function QuickPurchaseRegistrationModal({
  isOpen,
  onClose,
  departure,
  arrival,
  onSave,
  editingBooking,
}: QuickPurchaseRegistrationModalProps) {
  const [nickname, setNickname] = useState('');
  const [selectedWeekday, setSelectedWeekday] = useState(1);
  const [selectedTime, setSelectedTime] = useState('10시');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [seatClass, setSeatClass] = useState<'general' | 'special'>('general');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [carNumber, setCarNumber] = useState('');
  const [seatNumbers, setSeatNumbers] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassengerPicker, setShowPassengerPicker] = useState(false);
  const [showSeatOptions, setShowSeatOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingBooking) {
        setNickname(editingBooking.label);

        if (editingBooking.departure_time) {
          const timeMatch = editingBooking.departure_time.match(/(\d{4})\.(\d{2})\.(\d{2})\(([^)]+)\)/);
          const hourMatches = editingBooking.departure_time.match(/(\d{2})시/g);

          if (timeMatch && hourMatches && hourMatches.length > 0) {
            const [, year, month, day, weekdayStr] = timeMatch;
            const weekdayMap: { [key: string]: number } = { '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0 };
            setSelectedWeekday(weekdayMap[weekdayStr] ?? 1);

            const lastHourMatch = hourMatches[hourMatches.length - 1].match(/(\d{2})시/);
            if (lastHourMatch) {
              setSelectedTime(`${lastHourMatch[1]}시`);
            }
          }
        }

        setAdults(editingBooking.adults || 1);
        setChildren(editingBooking.children || 0);
        setInfants(editingBooking.infants || 0);

        setSeatClass(editingBooking.seat_class === '특실' ? 'special' : 'general');
        setDirection(editingBooking.seat_direction === '역방향' ? 'backward' : 'forward');
        setCarNumber(editingBooking.car_number ? String(editingBooking.car_number) : '');
        setSeatNumbers(editingBooking.seat_numbers || '');
      } else {
        setNickname('');
        setSelectedWeekday(1);
        setSelectedTime('10시');
        setAdults(1);
        setChildren(0);
        setInfants(0);
        setSeatClass('general');
        setDirection('forward');
        setCarNumber('');
        setSeatNumbers('');
      }

      setShowDatePicker(false);
      setShowPassengerPicker(false);
      setShowSeatOptions(false);
    }
  }, [isOpen, editingBooking]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      nickname,
      selectedWeekday,
      selectedTime,
      adults,
      children,
      infants,
      seatClass,
      direction,
      carNumber: carNumber ? parseInt(carNumber) : undefined,
      seatNumbers: seatNumbers || undefined,
    });
    onClose();
  };

  const getNextWeekday = (targetWeekday: number) => {
    const today = new Date();
    const currentWeekday = today.getDay();
    let daysToAdd = targetWeekday - currentWeekday;
    if (daysToAdd <= 0) daysToAdd += 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);
    return nextDate;
  };

  const formatDateDisplay = () => {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[selectedWeekday];
    return `${weekday}요일 ${selectedTime} 이후`;
  };

  const getPassengerText = () => {
    const parts = [];
    if (adults > 0) parts.push(`성인 ${adults}명`);
    if (children > 0) parts.push(`어린이 ${children}명`);
    if (infants > 0) parts.push(`유아 ${infants}명`);
    return parts.length > 0 ? parts.join(', ') : '승객을 선택해주세요';
  };

  const getSeatText = () => {
    const seatClassText = seatClass === 'general' ? '일반실' : '특실';
    const directionText = direction === 'forward' ? '순방향' : '역방향';
    return `${seatClassText} / ${directionText}`;
  };

  const weekdays = [
    { label: '월요일', value: 1 },
    { label: '화요일', value: 2 },
    { label: '수요일', value: 3 },
    { label: '목요일', value: 4 },
    { label: '금요일', value: 5 },
    { label: '토요일', value: 6 },
    { label: '일요일', value: 0 },
  ];

  const timeSlots = ['08시', '09시', '10시', '11시', '12시', '13시', '14시', '15시', '16시', '17시', '18시', '19시'];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose}></div>
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl z-[60] max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{editingBooking ? '간편구매 수정' : '간편구매 등록'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-center gap-4 mb-6 py-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">출발</div>
              <div className="text-2xl font-bold text-gray-900">{departure}</div>
            </div>
            <div className="text-2xl text-gray-400">→</div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">도착</div>
              <div className="text-2xl font-bold text-gray-900">{arrival}</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">→</span>
              </div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="별칭을 입력해주세요."
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
              />
            </div>
          </div>

          <div className="mb-3">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full bg-gray-50 rounded-2xl p-4 flex items-center gap-3 hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left text-sm text-gray-900">
                {formatDateDisplay()}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>
            {showDatePicker && (
              <div className="mt-2 bg-gray-50 rounded-xl p-4">
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-900 mb-3">요일</div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {weekdays.map((day) => {
                      const isSelected = selectedWeekday === day.value;
                      return (
                        <button
                          key={day.value}
                          onClick={() => setSelectedWeekday(day.value)}
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-900 mb-3">시간</div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {timeSlots.map((time) => {
                      const isSelected = time === selectedTime;

                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-3">
            <button
              onClick={() => setShowPassengerPicker(!showPassengerPicker)}
              className="w-full bg-gray-50 rounded-2xl p-4 flex items-center gap-3 hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left text-sm text-gray-900">
                {getPassengerText()}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showPassengerPicker ? 'rotate-180' : ''}`} />
            </button>
            {showPassengerPicker && (
              <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-700">성인</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdults(Math.max(0, adults - 1))}
                      className="w-8 h-8 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{adults}</span>
                    <button
                      onClick={() => setAdults(adults + 1)}
                      className="w-8 h-8 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-700">어린이</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-8 h-8 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{children}</span>
                    <button
                      onClick={() => setChildren(children + 1)}
                      className="w-8 h-8 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">유아</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInfants(Math.max(0, infants - 1))}
                      className="w-8 h-8 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{infants}</span>
                    <button
                      onClick={() => setInfants(infants + 1)}
                      className="w-8 h-8 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowSeatOptions(!showSeatOptions)}
              className="w-full bg-gray-50 rounded-2xl p-4 flex items-center gap-3 hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Armchair className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left text-sm text-gray-900">
                {getSeatText()}
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showSeatOptions ? 'rotate-180' : ''}`} />
            </button>
            {showSeatOptions && (
              <div className="mt-2 bg-white border border-gray-200 rounded-xl p-4">
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">좌석 등급</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSeatClass('general')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        seatClass === 'general'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      일반실
                    </button>
                    <button
                      onClick={() => setSeatClass('special')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        seatClass === 'special'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      특실
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-2">좌석 방향</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDirection('forward')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        direction === 'forward'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      순방향
                    </button>
                    <button
                      onClick={() => setDirection('backward')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        direction === 'backward'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      역방향
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-2">좌석 정보 (선택)</div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={carNumber}
                      onChange={(e) => setCarNumber(e.target.value)}
                      placeholder="호차"
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                    />
                    <input
                      type="text"
                      value={seatNumbers}
                      onChange={(e) => setSeatNumbers(e.target.value)}
                      placeholder="좌석 (예: 7D)"
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!nickname.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-colors text-base"
          >
            {editingBooking ? '수정하기' : '등록하기'}
          </button>
        </div>
      </div>
    </>
  );
}

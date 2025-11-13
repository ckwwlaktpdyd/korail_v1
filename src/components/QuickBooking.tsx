import { useState } from 'react';
import { ArrowLeftRight, Calendar, Users } from 'lucide-react';
import PassengerPicker from './PassengerPicker';
import DateTimePicker from './DateTimePicker';

interface QuickBookingProps {
  bookingData: {
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    date: string;
    passengers: { adults: number; children: number; infants: number };
    trainType: string;
    timeSlot: string;
  };
  onUpdatePassengers: (passengers: { adults: number; children: number; infants: number }) => void;
  onUpdateDate: (date: string) => void;
  onUpdateTime: (time: string) => void;
}

export default function QuickBooking({ bookingData, onUpdatePassengers, onUpdateDate, onUpdateTime }: QuickBookingProps) {
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [showPassengerPicker, setShowPassengerPicker] = useState(false);
  const [showDepartureDatePicker, setShowDepartureDatePicker] = useState(false);
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);

  const formatPassengerText = () => {
    const parts = [];
    if (bookingData.passengers.adults > 0) parts.push(`성인 ${bookingData.passengers.adults}명`);
    if (bookingData.passengers.children > 0) parts.push(`어린이 ${bookingData.passengers.children}명`);
    if (bookingData.passengers.infants > 0) parts.push(`유아 ${bookingData.passengers.infants}명`);
    return parts.join(', ');
  };

  const formatDisplayDate = (dateStr: string, timeSlot: string) => {
    if (!dateStr) return { line1: '날짜 선택', line2: '' };

    if (dateStr.includes('.')) {
      const [year, month, dayPart] = dateStr.split('.');
      const [day, dayOfWeek] = dayPart.split('(');
      const dayName = dayOfWeek.replace(')', '');

      const dayNames: { [key: string]: string } = {
        '월': '월요일',
        '화': '화요일',
        '수': '수요일',
        '목': '목요일',
        '금': '금요일',
        '토': '토요일',
        '일': '일요일'
      };

      const fullDayName = dayNames[dayName] || dayName;
      const line1 = `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
      const line2 = `${fullDayName} ${timeSlot}`;

      return { line1, line2 };
    }

    return { line1: dateStr, line2: '' };
  };

  return (
    <section className="bg-white rounded-3xl mx-5 mt-4 p-5 shadow-lg">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsRoundTrip(false)}
          className={`flex-1 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
            !isRoundTrip
              ? 'text-white bg-blue-600 shadow-md'
              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          편도
        </button>
        <button
          onClick={() => setIsRoundTrip(true)}
          className={`flex-1 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
            isRoundTrip
              ? 'text-white bg-blue-600 shadow-md'
              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          왕복
        </button>
      </div>

      {/* Route Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">출발</div>
            <div className="text-3xl font-bold text-gray-900">{bookingData.departure}</div>
          </div>

          <button className="mx-4 p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-md">
            <ArrowLeftRight className="w-6 h-6 text-white" />
          </button>

          <div className="flex-1 text-right">
            <div className="text-sm text-gray-600 mb-1">도착</div>
            <div className="text-3xl font-bold text-gray-900">{bookingData.arrival}</div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 mb-4"></div>

      {/* Date Section */}
      <button
        onClick={() => setShowDepartureDatePicker(!showDepartureDatePicker)}
        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
      >
        <div className="flex-1 text-left">
          <div className="text-sm text-gray-600 mb-1.5">가는날</div>
          <div className="text-base font-bold text-gray-900 leading-tight">
            {formatDisplayDate(bookingData.date, bookingData.timeSlot).line1}
          </div>
          <div className="text-sm text-gray-700 mt-0.5">
            {formatDisplayDate(bookingData.date, bookingData.timeSlot).line2}
          </div>
        </div>
        <Calendar className={`w-6 h-6 transition-colors flex-shrink-0 ${showDepartureDatePicker ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
      </button>

      {/* Departure Date Picker */}
      {showDepartureDatePicker && (
        <div className="mt-4">
          <DateTimePicker
            selectedDate={bookingData.date}
            selectedTime={bookingData.timeSlot}
            onDateChange={(date) => {
              onUpdateDate(date);
              setShowDepartureDatePicker(false);
            }}
            onTimeChange={(time) => {
              onUpdateTime(time);
            }}
          />
        </div>
      )}

      {/* Return Date Section - Only for Round Trip */}
      {isRoundTrip && (
        <>
          <button
            onClick={() => setShowReturnDatePicker(!showReturnDatePicker)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group mt-2 animate-slide-down"
          >
            <div className="flex-1 text-left">
              <div className="text-sm text-gray-600 mb-1.5">오는날</div>
              <div className="text-base font-bold text-gray-900 leading-tight">
                {formatDisplayDate(bookingData.date, bookingData.timeSlot).line1}
              </div>
              <div className="text-sm text-gray-700 mt-0.5">
                {formatDisplayDate(bookingData.date, bookingData.timeSlot).line2}
              </div>
            </div>
            <Calendar className={`w-6 h-6 transition-colors flex-shrink-0 ${showReturnDatePicker ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
          </button>

          {/* Return Date Picker */}
          {showReturnDatePicker && (
            <div className="mt-4">
              <DateTimePicker
                selectedDate={bookingData.date}
                selectedTime={bookingData.timeSlot}
                onDateChange={(date) => {
                  onUpdateDate(date);
                  setShowReturnDatePicker(false);
                }}
                onTimeChange={(time) => {
                  onUpdateTime(time);
                }}
              />
            </div>
          )}
        </>
      )}

      <div className="h-px bg-gray-200 my-4"></div>

      {/* Passenger Section */}
      <button
        onClick={() => setShowPassengerPicker(!showPassengerPicker)}
        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
      >
        <div className="flex-1 text-left">
          <div className="text-sm text-gray-600 mb-1.5">인원</div>
          <div className="text-base font-bold text-gray-900">{formatPassengerText()}</div>
        </div>
        <Users className={`w-6 h-6 transition-colors flex-shrink-0 ${showPassengerPicker ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} />
      </button>

      {/* Passenger Picker */}
      {showPassengerPicker && (
        <div className="mt-4">
          <PassengerPicker
            passengers={bookingData.passengers}
            onChange={onUpdatePassengers}
          />
        </div>
      )}

      {/* Search Button */}
      <button
        className="w-full mt-4 py-3.5 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
      >
        열차 조회
      </button>
    </section>
  );
}

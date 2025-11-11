import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateTimePickerProps {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export default function DateTimePicker({ selectedDate, selectedTime, onDateChange, onTimeChange }: DateTimePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10)); // November 2025

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const timeSlots = ['8시', '09시', '10시', '11시', '12시', '13시', '14시', '15시', '16시', '17시', '18시', '19시'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = `${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`;

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    if (day) {
      const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay()];
      const formattedDate = `${currentMonth.getFullYear()}.${String(currentMonth.getMonth() + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}(${dayOfWeek})`;
      onDateChange(formattedDate);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-4 animate-slide-down">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="text-base font-bold text-gray-900">{monthName}</div>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day, idx) => (
          <div
            key={day}
            className={`text-center text-xs font-medium py-2 ${
              idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map((day, idx) => {
          // Parse selected date to check if this day is selected
          const selectedDay = selectedDate ? parseInt(selectedDate.split('.')[2].split('(')[0]) : null;
          const selectedYear = selectedDate ? parseInt(selectedDate.split('.')[0]) : null;
          const selectedMonth = selectedDate ? parseInt(selectedDate.split('.')[1]) : null;

          const isSelected = day === selectedDay &&
                           currentMonth.getFullYear() === selectedYear &&
                           currentMonth.getMonth() + 1 === selectedMonth;
          const dayOfWeek = day ? idx % 7 : -1;

          return (
            <button
              key={idx}
              onClick={() => handleDateClick(day!)}
              disabled={!day}
              className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                !day ? 'invisible' :
                isSelected ? 'bg-blue-600 text-white shadow-md scale-105' :
                dayOfWeek === 0 ? 'text-red-500 hover:bg-red-50' :
                dayOfWeek === 6 ? 'text-blue-500 hover:bg-blue-50' :
                'text-gray-900 hover:bg-gray-200'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Time Selection */}
      <div className="border-t border-gray-200 pt-4">
        <div className="text-sm font-medium text-gray-700 mb-3">시간</div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {timeSlots.map((time) => {
            // Extract hour from selectedTime (e.g., "11시 이후" -> "11시")
            const selectedHour = selectedTime ? selectedTime.split(' ')[0] : null;
            const isSelected = time === selectedHour;

            return (
              <button
                key={time}
                onClick={() => onTimeChange(time + ' 이후')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-pink-500 text-white shadow-md'
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
  );
}

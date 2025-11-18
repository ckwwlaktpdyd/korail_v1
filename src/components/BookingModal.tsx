import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import DateTimePicker from './DateTimePicker';
import PassengerPicker from './PassengerPicker';

interface BookingModalProps {
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
  onClose: () => void;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export default function BookingModal({ bookingData, onClose, onUpdate, onNext }: BookingModalProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassengerPicker, setShowPassengerPicker] = useState(false);
  const [showTrainType, setShowTrainType] = useState(false);

  const totalPassengers = bookingData.passengers.adults + bookingData.passengers.children + bookingData.passengers.infants;

  const getPassengerText = () => {
    const parts = [];
    if (bookingData.passengers.adults > 0) parts.push(`성인 ${bookingData.passengers.adults}명`);
    if (bookingData.passengers.children > 0) parts.push(`어린이 ${bookingData.passengers.children}명`);
    if (bookingData.passengers.infants > 0) parts.push(`유아 ${bookingData.passengers.infants}명`);
    return parts.join(', ') || '성인 1명';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">빠른 예매</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-5">
          {/* Title */}
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">집</h3>

          {/* Route Info */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs text-gray-600 mb-1">출발</div>
                <div className="text-xl font-bold text-gray-900">{bookingData.departure}</div>
                <div className="text-sm text-gray-500">{bookingData.departureTime}</div>
              </div>

              <div className="mx-4 text-gray-400">→</div>

              <div className="flex-1 text-right">
                <div className="text-xs text-gray-600 mb-1">도착</div>
                <div className="text-xl font-bold text-gray-900">{bookingData.arrival}</div>
                <div className="text-sm text-gray-500">{bookingData.arrivalTime}</div>
              </div>
            </div>
          </div>

          {/* Date & Time Selection */}
          <button
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              setShowPassengerPicker(false);
              setShowTrainType(false);
            }}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors mb-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">{bookingData.date}</div>
                <div className="text-xs text-gray-500">{bookingData.timeSlot}</div>
              </div>
            </div>
            {showDatePicker ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showDatePicker && (
            <DateTimePicker
              selectedDate={bookingData.date}
              selectedTime={bookingData.timeSlot}
              onDateChange={(date) => onUpdate({ ...bookingData, date })}
              onTimeChange={(timeSlot) => onUpdate({ ...bookingData, timeSlot })}
            />
          )}

          {/* Passenger Selection */}
          <button
            onClick={() => {
              setShowPassengerPicker(!showPassengerPicker);
              setShowDatePicker(false);
              setShowTrainType(false);
            }}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors mb-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">{getPassengerText()}</div>
              </div>
            </div>
            {showPassengerPicker ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showPassengerPicker && (
            <PassengerPicker
              passengers={bookingData.passengers}
              onChange={(passengers) => onUpdate({ ...bookingData, passengers })}
            />
          )}

          {/* Train Type Selection */}
          <button
            onClick={() => {
              setShowTrainType(!showTrainType);
              setShowDatePicker(false);
              setShowPassengerPicker(false);
            }}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">{bookingData.trainType}</div>
              </div>
            </div>
            {showTrainType ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showTrainType && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 animate-slide-down">
              {['일반석', '특실', '자유석'].map((type) => (
                <button
                  key={type}
                  onClick={() => onUpdate({ ...bookingData, trainType: type })}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
                    bookingData.trainType === type
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onNext}
            className="w-full py-4 bg-blue-600 text-white text-base font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
          >
            다음 &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

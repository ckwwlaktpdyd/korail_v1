import { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';

interface AddQuickBookingModalProps {
  onClose: () => void;
  onAdd: (booking: {
    label: string;
    departure: string;
    arrival: string;
    train_type: string;
    adults: number;
    children: number;
    infants: number;
  }) => void;
}

export default function AddQuickBookingModal({ onClose, onAdd }: AddQuickBookingModalProps) {
  const [label, setLabel] = useState('');
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [trainType, setTrainType] = useState('KTX');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (label.trim() && departure.trim() && arrival.trim()) {
      onAdd({
        label: label.trim(),
        departure: departure.trim(),
        arrival: arrival.trim(),
        train_type: trainType,
        adults,
        children,
        infants,
      });
    }
  };

  const increment = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, max = 9) => {
    if (value < max) setter(value + 1);
  };

  const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number, min = 0) => {
    if (value > min) setter(value - 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-lg font-bold text-gray-900">빠른 예매 추가</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {/* Label */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              라벨 이름
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="예: 집, 출장, 주말여행"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          {/* Departure */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              출발역
            </label>
            <input
              type="text"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              placeholder="예: 서울, 광명, 대전"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          {/* Arrival */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              도착역
            </label>
            <input
              type="text"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              placeholder="예: 부산, 광주, 목포"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          {/* Train Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              열차 종류
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['KTX', 'SRT', 'ITX'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTrainType(type)}
                  className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                    trainType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Passengers */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              인원
            </label>

            <div className="space-y-3">
              {/* Adults */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-900">성인</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => decrement(setAdults, adults, 1)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-8 text-center text-base font-medium text-gray-900">{adults}</span>
                  <button
                    type="button"
                    onClick={() => increment(setAdults, adults)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-900">어린이</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => decrement(setChildren, children)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-8 text-center text-base font-medium text-gray-900">{children}</span>
                  <button
                    type="button"
                    onClick={() => increment(setChildren, children)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-900">유아</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => decrement(setInfants, infants)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-8 text-center text-base font-medium text-gray-900">{infants}</span>
                  <button
                    type="button"
                    onClick={() => increment(setInfants, infants)}
                    className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-gray-200 text-gray-700 text-base font-bold rounded-xl hover:bg-gray-300 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-blue-600 text-white text-base font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
            >
              추가하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

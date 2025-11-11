import { Minus, Plus } from 'lucide-react';

interface PassengerPickerProps {
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  onChange: (passengers: { adults: number; children: number; infants: number }) => void;
}

export default function PassengerPicker({ passengers, onChange }: PassengerPickerProps) {
  const updateCount = (type: 'adults' | 'children' | 'infants', delta: number) => {
    const newCount = Math.max(0, passengers[type] + delta);

    // Ensure at least 1 adult
    if (type === 'adults' && newCount === 0) return;

    onChange({
      ...passengers,
      [type]: newCount
    });
  };

  const passengerTypes = [
    {
      key: 'adults' as const,
      label: '성인',
      description: '13세 이상',
      min: 1
    },
    {
      key: 'children' as const,
      label: '어린이',
      description: '2~12세',
      min: 0
    },
    {
      key: 'infants' as const,
      label: '유아',
      description: '2세 미만',
      min: 0
    }
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-4 animate-slide-down">
      {passengerTypes.map((type, index) => (
        <div
          key={type.key}
          className={`flex items-center justify-between py-4 ${
            index !== passengerTypes.length - 1 ? 'border-b border-gray-200' : ''
          }`}
        >
          <div>
            <div className="text-sm font-medium text-gray-900">{type.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => updateCount(type.key, -1)}
              disabled={passengers[type.key] <= type.min}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                passengers[type.key] <= type.min
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="text-lg font-bold text-gray-900 w-8 text-center">
              {passengers[type.key]}
            </span>

            <button
              onClick={() => updateCount(type.key, 1)}
              className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

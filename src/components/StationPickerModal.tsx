import { X } from 'lucide-react';

interface StationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (station: string) => void;
  title: string;
  currentStation: string;
  excludeStation?: string;
}

const KTX_STATIONS = [
  '서울',
  '용산',
  '광명',
  '천안아산',
  '오송',
  '대전',
  '김천(구미)',
  '동대구',
  '신경주',
  '포항',
  '울산',
  '부산',
];

export default function StationPickerModal({
  isOpen,
  onClose,
  onSelect,
  title,
  currentStation,
  excludeStation,
}: StationPickerModalProps) {
  if (!isOpen) return null;

  const handleStationClick = (station: string) => {
    onSelect(station);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full rounded-t-3xl shadow-2xl animate-slide-up max-h-[70vh] flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-3xl">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-4">
            {KTX_STATIONS.map((station) => {
              const isExcluded = excludeStation && station === excludeStation;
              const isDisabled = isExcluded;

              return (
                <button
                  key={station}
                  onClick={() => !isDisabled && handleStationClick(station)}
                  disabled={isDisabled}
                  className={`w-full text-left px-4 py-3.5 rounded-lg transition-colors mb-2 ${
                    isDisabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : station === currentStation
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{station}</span>
                    {station === currentStation && !isDisabled && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

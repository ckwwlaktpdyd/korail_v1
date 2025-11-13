import { ArrowLeft, CheckCircle } from 'lucide-react';

interface QuickPurchaseSuccessModalProps {
  alias: string;
  departure: string;
  arrival: string;
  days: string[];
  time: string;
  onGoToBooking: () => void;
  onGoHome: () => void;
  onBack: () => void;
}

export default function QuickPurchaseSuccessModal({
  alias,
  departure,
  arrival,
  days,
  time,
  onGoToBooking,
  onGoHome,
  onBack
}: QuickPurchaseSuccessModalProps) {
  const formatDays = () => {
    if (days.length === 7) return '매일';
    if (days.length === 0) return '-';
    return days.join(', ');
  };

  const formatTime = () => {
    const [period, timeRange] = time.split(' ');
    const [startHour] = timeRange.split(':');
    const endHour = String(Number(startHour) + 1).padStart(2, '0');
    return `${period} ${timeRange} ~ ${endHour}:00 출발`;
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col">
      <header className="bg-white border-b border-gray-200 px-5 py-4 flex items-center">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 ml-3">간편구매 등록 완료</h1>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-5 py-8">
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-14 h-14 text-green-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center leading-tight">
              간편구매 등록이
              <br />
              완료되었습니다!
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              <div className="px-6 py-5 flex items-center justify-between">
                <span className="text-base text-gray-600 font-medium">별칭</span>
                <span className="text-base text-gray-900 font-bold">{alias}</span>
              </div>

              <div className="px-6 py-5 flex items-center justify-between">
                <span className="text-base text-gray-600 font-medium">구간</span>
                <span className="text-base text-gray-900 font-bold">
                  {departure} → {arrival}
                </span>
              </div>

              <div className="px-6 py-5 flex items-center justify-between">
                <span className="text-base text-gray-600 font-medium">요일</span>
                <span className="text-base text-gray-900 font-bold">{formatDays()}</span>
              </div>

              <div className="px-6 py-5 flex items-center justify-between">
                <span className="text-base text-gray-600 font-medium">시간</span>
                <span className="text-base text-gray-900 font-bold">{formatTime()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 p-5 space-y-3 bg-white">
        <button
          onClick={onGoToBooking}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-base"
        >
          이대로 간편구매하기
        </button>
        <button
          onClick={onGoHome}
          className="w-full py-4 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-base border-2 border-gray-300"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}

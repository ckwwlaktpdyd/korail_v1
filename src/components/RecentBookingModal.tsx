import { useState } from 'react';
import { X, ArrowRight, User, Ticket } from 'lucide-react';
import { QuickBooking } from '../lib/supabase';
import QuickPurchaseModal from './QuickPurchaseModal';

interface RecentBookingModalProps {
  booking: QuickBooking;
  onClose: () => void;
  onQuickPurchaseSaved?: (bookingId: string, openModal?: boolean) => void;
}

export default function RecentBookingModal({ booking, onClose, onQuickPurchaseSaved }: RecentBookingModalProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const formatPassengers = (adults: number, children: number, infants: number) => {
    const parts = [];
    if (adults > 0) parts.push(`성인 ${adults}명`);
    if (children > 0) parts.push(`어린이 ${children}명`);
    if (infants > 0) parts.push(`유아 ${infants}명`);
    return parts.join(' / ');
  };

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]})`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">최근 예매 내역</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="p-5">
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-600">{formattedDate}</span>
              <span className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-full">
                {booking.train_type}
              </span>
            </div>

            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">출발</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{booking.departure}</div>
                <div className="text-lg text-gray-700">13:58</div>
              </div>

              <ArrowRight className="w-8 h-8 text-gray-400 mt-8" />

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">도착</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{booking.arrival}</div>
                <div className="text-lg text-gray-700">16:35</div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 text-gray-700">
                <User className="w-5 h-5" />
                <span className="text-base">{formatPassengers(booking.adults, booking.children, booking.infants)}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Ticket className="w-5 h-5" />
                <span className="text-base">일반실 / 창가옆 / 순방향</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            저주 이용하는 구간이라면 '간편구매'로 저장해두세요.
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="w-full py-4 bg-indigo-700 text-white text-lg font-bold rounded-xl hover:bg-indigo-800 transition-colors"
            >
              간편구매 등록 &gt;
            </button>

            <button className="w-full py-4 bg-white border-2 border-gray-300 text-gray-700 text-lg font-bold rounded-xl hover:bg-gray-50 transition-colors">
              일반 조회 &gt;
            </button>
          </div>
        </div>

        {showPurchaseModal && (
          <QuickPurchaseModal
            departure={booking.departure}
            arrival={booking.arrival}
            onClose={() => {
              setShowPurchaseModal(false);
              onClose();
            }}
            onSaved={(bookingId, openModal) => {
              setShowPurchaseModal(false);
              onClose();
              onQuickPurchaseSaved?.(bookingId, openModal);
            }}
          />
        )}
      </div>
    </div>
  );
}

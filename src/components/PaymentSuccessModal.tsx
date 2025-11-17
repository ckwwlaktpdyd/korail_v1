import { X, Check, Star } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface PaymentSuccessModalProps {
  onClose: () => void;
  onSaveAsQuickBooking?: (label: string) => Promise<string | null>;
  onDeleteQuickBooking?: (id: string) => Promise<void>;
  onToggleQuickPurchase?: (id: string, isQuickPurchase: boolean) => Promise<void>;
  onOpenQuickPurchase?: (bookingData: {
    departure: string;
    arrival: string;
    trainType: string;
    passengers: { adults: number; children: number; infants: number };
  }) => void;
  onSaveBookingHistory?: (bookingData: any) => Promise<string | null>;
  isFromQuickPurchase?: boolean;
  bookingData?: {
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    date: string;
    passengers: { adults: number; children: number; infants: number };
    trainType: string;
    trainNumber: string;
    carNumber?: number;
    seatNumbers?: number[];
    seatClass?: string;
    seatDirection?: string;
    totalPrice?: number;
  };
}

export default function PaymentSuccessModal({ onClose, onSaveAsQuickBooking, onDeleteQuickBooking, onToggleQuickPurchase, onOpenQuickPurchase, onSaveBookingHistory, isFromQuickPurchase = false, bookingData }: PaymentSuccessModalProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [savedBookingId, setSavedBookingId] = useState<string | null>(null);
  const hasBeenSavedRef = useRef(false);

  useEffect(() => {
    if (onSaveBookingHistory && bookingData && !isFromQuickPurchase && !hasBeenSavedRef.current) {
      console.log('📝 Saving booking history - hasBeenSavedRef:', hasBeenSavedRef.current);
      console.log('📝 bookingData:', bookingData);
      hasBeenSavedRef.current = true;
      onSaveBookingHistory(bookingData).then((id) => {
        console.log('✅ Received booking ID:', id);
        if (id) {
          setSavedBookingId(id);
          console.log('✅ savedBookingId set to:', id);
        } else {
          console.error('❌ Booking ID is null!');
        }
      }).catch((error) => {
        console.error('❌ Error saving booking history:', error);
      });
      console.log('After save - hasBeenSavedRef:', hasBeenSavedRef.current);
    } else {
      console.log('❌ Not saving because:', {
        onSaveBookingHistory: !!onSaveBookingHistory,
        bookingData: !!bookingData,
        isFromQuickPurchase,
        hasBeenSavedRef: hasBeenSavedRef.current
      });
    }
  }, []);

  const handleStarToggle = async () => {
    try {
      console.log('=== handleStarToggle START ===');
      console.log('savedBookingId:', savedBookingId);
      console.log('onToggleQuickPurchase exists:', !!onToggleQuickPurchase);
      console.log('current isSaved:', isSaved);

      if (!savedBookingId) {
        console.error('❌ No booking ID available yet');
        alert('예약 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      if (!onToggleQuickPurchase) {
        console.error('❌ onToggleQuickPurchase is not provided');
        alert('간편구매 기능을 사용할 수 없습니다.');
        return;
      }

      const newState = !isSaved;
      console.log('🔄 Toggling quick purchase to:', newState);

      await onToggleQuickPurchase(savedBookingId, newState);

      setIsSaved(newState);
      console.log('✅ Toggle complete - new state:', newState);
      console.log('=== handleStarToggle END ===');
    } catch (error) {
      console.error('❌ Error in handleStarToggle:', error);
      alert('간편구매 등록 중 오류가 발생했습니다.');
    }
  };
  const getPassengerText = () => {
    if (!bookingData) return '성인 1명';
    const parts = [];
    if (bookingData.passengers.adults > 0) parts.push(`성인 ${bookingData.passengers.adults}명`);
    if (bookingData.passengers.children > 0) parts.push(`어린이 ${bookingData.passengers.children}명`);
    if (bookingData.passengers.infants > 0) parts.push(`유아 ${bookingData.passengers.infants}명`);
    return parts.join(', ');
  };

  const getTotalPrice = () => {
    if (bookingData?.totalPrice) {
      return bookingData.totalPrice.toLocaleString();
    }
    return '59,800';
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <div className="flex justify-end p-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="px-6 py-8">
          {/* Success Icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <div className="w-28 h-28 bg-green-50 rounded-full flex items-center justify-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-12 h-12 text-white stroke-[3]" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-1">
              결제가
            </h2>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
              완료되었습니다!
            </h2>
          </div>

          {/* Journey Label and Star with Tooltip - Only show if NOT from quick purchase */}
          {!isFromQuickPurchase && (
            <div className="mb-6">
              {/* Tooltip */}
              <div className="flex justify-end mb-2">
                <div className="bg-blue-500 text-white px-4 py-3 rounded-2xl text-sm font-medium relative inline-block">
                  아이콘을 누르면 해당 구간이
                  <br />
                  간편구매로 등록돼요!
                  <div className="absolute bottom-0 right-6 transform translate-y-full w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-blue-500"></div>
                </div>
              </div>

              {/* Journey label and Star */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (onOpenQuickPurchase && bookingData) {
                      onOpenQuickPurchase({
                        departure: bookingData.departure,
                        arrival: bookingData.arrival,
                        trainType: bookingData.trainType,
                        passengers: bookingData.passengers,
                      });
                    }
                  }}
                  className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  여정 1
                </button>
                <button
                  onClick={handleStarToggle}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-95"
                >
                  {isSaved ? (
                    <Star className="w-8 h-8 fill-yellow-400 text-yellow-400 transition-all" />
                  ) : (
                    <Star className="w-8 h-8 text-gray-300 hover:text-yellow-400 transition-all" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-base text-gray-500">구간</span>
              <span className="text-base font-bold text-gray-900">
                {bookingData ? `${bookingData.departure} → ${bookingData.arrival}` : '서울 → 부산'}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-base text-gray-500">출발일시</span>
              <span className="text-base font-bold text-gray-900">
                {bookingData ? `${bookingData.date} ${bookingData.departureTime}` : '2025. 11. 11(화) 05:30'}
              </span>
            </div>

            {bookingData?.trainType && bookingData?.trainNumber && (
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-base text-gray-500">열차</span>
                <span className="text-base font-bold text-gray-900">
                  {bookingData.trainType} {bookingData.trainNumber}
                </span>
              </div>
            )}

            {bookingData?.carNumber && bookingData?.seatNumbers && (
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-base text-gray-500">좌석</span>
                <span className="text-base font-bold text-gray-900">
                  {bookingData.carNumber}호차 {bookingData.seatNumbers.join(', ')}번
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-base text-gray-500">인원</span>
              <span className="text-base font-bold text-gray-900">{getPassengerText()}</span>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="border-t border-gray-200 p-5">
          <button
            onClick={onClose}
            className="w-full py-4 bg-blue-600 text-white text-base font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

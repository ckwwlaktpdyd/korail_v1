import { useState } from 'react';
import { X, Tag, CreditCard } from 'lucide-react';
import DiscountModal from './DiscountModal';

interface PaymentModalProps {
  bookingData: {
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    date: string;
    passengers: { adults: number; children: number; infants: number };
    trainType: string;
    trainNumber: string;
    carNumber?: number | null;
    seatNumbers?: string | null;
    seatClass?: string | null;
    seatDirection?: string | null;
  };
  onClose: () => void;
  onConfirm: () => void;
  onSearchOtherTrains?: () => void;
}

const PAYMENT_METHODS = [
  { id: 'kakaopay', name: '카카오페이', icon: '💳' },
  { id: 'card', name: '신용/체크카드', icon: '💳' },
  { id: 'toss', name: '토스페이', icon: '💳' },
  { id: 'naverpay', name: '네이버페이', icon: '💳' },
  { id: 'payco', name: 'PAYCO', icon: '💳' },
];

const BASE_PRICE = 59800;

export default function PaymentModal({ bookingData, onClose, onConfirm, onSearchOtherTrains }: PaymentModalProps) {
  const [selectedPayment, setSelectedPayment] = useState('kakaopay');
  const [appliedDiscount, setAppliedDiscount] = useState<{ category: string; amount: number } | null>(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  const totalPassengers = bookingData.passengers.adults + bookingData.passengers.children + bookingData.passengers.infants;
  const subtotal = BASE_PRICE * totalPassengers;
  const discountAmount = appliedDiscount ? Math.round(subtotal * appliedDiscount.amount) : 0;
  const finalPrice = subtotal - discountAmount;

  const getPassengerText = () => {
    const parts = [];
    if (bookingData.passengers.adults > 0) parts.push(`성인 ${bookingData.passengers.adults}명`);
    if (bookingData.passengers.children > 0) parts.push(`어린이 ${bookingData.passengers.children}명`);
    if (bookingData.passengers.infants > 0) parts.push(`유아 ${bookingData.passengers.infants}명`);
    return parts.join(' / ');
  };

  const getSelectedPaymentName = () => {
    return PAYMENT_METHODS.find(m => m.id === selectedPayment)?.name || '카카오페이';
  };

  const handleApplyDiscount = (discount: { category: string; amount: number }) => {
    setAppliedDiscount(discount.category ? discount : null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">결제하기</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-5">
          {/* Trip Details */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-end mb-3">
              <div className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                {bookingData.trainType}
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">{bookingData.date}</div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">출발</div>
                <div className="text-2xl font-bold text-gray-900">{bookingData.departure}</div>
              </div>

              <div className="mx-4 text-gray-400 text-xl mt-5">→</div>

              <div className="flex-1 text-right">
                <div className="text-xs text-gray-500 mb-1">도착</div>
                <div className="text-2xl font-bold text-gray-900">{bookingData.arrival}</div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              {bookingData.carNumber && bookingData.seatNumbers ? (
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium">
                    {bookingData.carNumber}호차 {bookingData.seatNumbers}
                  </span>
                </div>
              ) : null}
              <div className="text-sm text-gray-600">
                {getPassengerText()} / {bookingData.seatClass || '일반실'} / {bookingData.seatDirection || '순방향'}
              </div>
            </div>
          </div>

          {/* Search Other Trains Button */}
          <button
            onClick={onSearchOtherTrains}
            className="w-full py-3 mb-5 text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
          >
            다른 열차 조회하기
          </button>

          {/* Discount Section */}
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-3">할인 선택</h3>

            <button
              onClick={() => setShowDiscountModal(true)}
              className="w-full bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">할인 / 쿠폰 적용</div>
                  {appliedDiscount ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600">
                        {appliedDiscount.category} ({Math.round(appliedDiscount.amount * 100)}% 할인)
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-1">할인 대상자를 선택하세요</div>
                  )}
                </div>
                <div className="text-sm text-blue-600 font-medium">
                  {appliedDiscount ? `-${discountAmount.toLocaleString()}원` : '선택'}
                </div>
              </div>
            </button>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">결제 수단</h3>

            <button
              onClick={() => setShowPaymentMethods(!showPaymentMethods)}
              className="w-full bg-gray-50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <CreditCard className="w-5 h-5 text-gray-700" />
                </div>
                <span className="text-sm font-medium text-gray-900">{getSelectedPaymentName()}</span>
              </div>
              <button className="px-3 py-1 text-sm text-gray-600 font-medium border border-gray-300 rounded-lg hover:bg-white transition-colors">
                변경
              </button>
            </button>

            {showPaymentMethods && (
              <div className="mt-3 bg-gray-50 rounded-xl p-2 animate-slide-down">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => {
                      setSelectedPayment(method.id);
                      setShowPaymentMethods(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                      selectedPayment === method.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm font-medium">{method.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">운임</span>
              <span className="text-sm text-gray-900">{subtotal.toLocaleString()}원</span>
            </div>
            {appliedDiscount && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-600">할인</span>
                <span className="text-sm text-green-600">-{discountAmount.toLocaleString()}원</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">최종 결제 금액</span>
              <span className="text-2xl font-bold text-blue-600">{finalPrice.toLocaleString()}원</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gray-400 text-white text-base font-bold rounded-xl hover:bg-gray-500 transition-all"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-4 bg-blue-600 text-white text-base font-bold rounded-xl hover:bg-blue-700 transition-all"
            >
              결제하기
            </button>
          </div>
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <DiscountModal
          onClose={() => setShowDiscountModal(false)}
          onApply={handleApplyDiscount}
          currentDiscount={appliedDiscount}
        />
      )}

    </div>
  );
}

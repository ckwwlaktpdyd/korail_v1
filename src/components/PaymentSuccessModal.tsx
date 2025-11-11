import { X, Check } from 'lucide-react';

interface PaymentSuccessModalProps {
  onClose: () => void;
  onViewTicket: () => void;
}

export default function PaymentSuccessModal({ onClose, onViewTicket }: PaymentSuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl animate-slide-up">
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Success Icon */}
        <div className="flex flex-col items-center px-8 pb-8 pt-4">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center animate-scale-in">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-white stroke-[3]" />
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
            결제가
          </h2>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            완료되었습니다!
          </h2>

          {/* Action Button */}
          <button
            onClick={onViewTicket}
            className="w-full py-4 bg-blue-600 text-white text-base font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg"
          >
            승차권 확인하기
          </button>
        </div>
      </div>
    </div>
  );
}

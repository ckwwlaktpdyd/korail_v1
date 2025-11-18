import { X, CheckCircle } from 'lucide-react';

interface QuickPurchaseRegistrationSuccessModalProps {
  onClose: () => void;
}

export default function QuickPurchaseRegistrationSuccessModal({
  onClose,
}: QuickPurchaseRegistrationSuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            간편구매 등록이
          </h2>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            완료되었습니다!
          </h2>

          {/* Confirm Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-blue-600 text-white text-base font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

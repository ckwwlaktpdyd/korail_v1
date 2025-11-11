import { useState } from 'react';
import { X, Check } from 'lucide-react';

interface DiscountModalProps {
  onClose: () => void;
  onApply: (discount: { category: string; amount: number }) => void;
  currentDiscount: { category: string; amount: number } | null;
}

const DISCOUNT_CATEGORIES = [
  { id: 'veteran', name: '국가유공자', discount: 0.3, icon: '🎖️' },
  { id: 'senior', name: '경로 (만 65세 이상)', discount: 0.3, icon: '👴' },
  { id: 'disabled', name: '장애인', discount: 0.5, icon: '♿' },
  { id: 'military', name: '군인 (의무복무)', discount: 0.5, icon: '🪖' },
  { id: 'child', name: '어린이 (만 6~12세)', discount: 0.5, icon: '👶' },
  { id: 'youth', name: '청소년 (만 13~18세)', discount: 0.2, icon: '🧑' },
];

export default function DiscountModal({ onClose, onApply, currentDiscount }: DiscountModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    currentDiscount?.category || null
  );

  const handleApply = () => {
    if (selectedCategory) {
      const category = DISCOUNT_CATEGORIES.find(c => c.id === selectedCategory);
      if (category) {
        onApply({
          category: category.name,
          amount: category.discount
        });
      }
    }
    onClose();
  };

  const handleRemove = () => {
    onApply({ category: '', amount: 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[80vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">할인 선택</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-5">
          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="text-sm text-blue-900 font-medium mb-1">할인 안내</div>
            <div className="text-xs text-blue-700">
              • 할인은 1인당 1개만 적용 가능합니다<br />
              • 증명 서류는 승차 시 제시해주세요<br />
              • 중복 할인은 적용되지 않습니다
            </div>
          </div>

          {/* Discount Categories */}
          <div className="space-y-3 mb-6">
            {DISCOUNT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  selectedCategory === category.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl border-2 border-gray-100">
                    {category.icon}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-gray-900">{category.name}</div>
                    <div className="text-xs text-blue-600 font-medium">
                      {Math.round(category.discount * 100)}% 할인
                    </div>
                  </div>
                </div>
                {selectedCategory === category.id && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Notice */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-xs text-gray-600 leading-relaxed">
              <strong className="text-gray-900">증명 서류 안내</strong><br />
              • 국가유공자: 국가유공자증<br />
              • 경로: 주민등록증 또는 운전면허증<br />
              • 장애인: 복지카드 또는 장애인등록증<br />
              • 군인: 휴가증 또는 신분증<br />
              • 어린이/청소년: 학생증 또는 청소년증
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {currentDiscount && (
              <button
                onClick={handleRemove}
                className="flex-1 py-4 bg-gray-200 text-gray-700 text-base font-bold rounded-xl hover:bg-gray-300 transition-all"
              >
                할인 제거
              </button>
            )}
            <button
              onClick={handleApply}
              disabled={!selectedCategory}
              className={`flex-1 py-4 text-white text-base font-bold rounded-xl transition-all shadow-lg ${
                selectedCategory
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              적용하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

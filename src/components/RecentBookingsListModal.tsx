import { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { QuickBooking } from '../lib/supabase';
import QuickPurchaseModal from './QuickPurchaseModal';

interface RecentBookingsListModalProps {
  bookings: QuickBooking[];
  onClose: () => void;
  onQuickPurchaseSaved?: (bookingId: string, openModal: boolean) => void;
}

export default function RecentBookingsListModal({ bookings, onClose, onQuickPurchaseSaved }: RecentBookingsListModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [showQuickPurchase, setShowQuickPurchase] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<QuickBooking | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);

  const formatPassengers = (adults: number, children: number, infants: number) => {
    const parts = [];
    if (adults > 0) parts.push(`성인 ${adults}명`);
    if (children > 0) parts.push(`어린이 ${children}명`);
    if (infants > 0) parts.push(`유아 ${infants}명`);
    return parts.join(', ');
  };

  const formatTimePreference = (booking: QuickBooking) => {
    if (!booking.departure_time) return null;

    // Parse departure_time format: "2025.11.19(수) 11시 이후"
    const timeMatch = booking.departure_time.match(/\(([^)]+)\)\s*(\d+)시/);
    if (timeMatch) {
      const weekday = timeMatch[1];
      const hour = timeMatch[2];
      return `${weekday}요일 ${hour}시 이후`;
    }

    return null;
  };

  const hasQuickPurchaseData = (booking: QuickBooking) => {
    return booking.departure_time && booking.label;
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')} (${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]})`;
  const formattedTime = '19:32';

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      setAllSelected(false);
    } else {
      setSelectedIds(bookings.map(b => b.id));
      setAllSelected(true);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newIds = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      setAllSelected(newIds.length === bookings.length);
      return newIds;
    });
  };

  const handleDelete = () => {
    console.log('Delete items:', selectedIds);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">최근예매 노선</h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            {editMode ? (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 font-medium">전체선택</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-blue-600 text-sm">
                <span>ⓘ 간편예매란?</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 font-medium">편집</span>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  editMode ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    editMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {bookings.map((booking, index) => {
              const isExpanded = expandedIds.includes(booking.id);
              const isSelected = selectedIds.includes(booking.id);

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  <div className="flex items-center px-5 py-4">
                    {editMode && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(booking.id)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 mr-3 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <button
                      onClick={() => !editMode && toggleExpand(booking.id)}
                      className="flex-1 text-left"
                      disabled={editMode}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">{booking.departure}</span>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <span className="text-lg font-bold text-gray-900">{booking.arrival}</span>
                        <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                          {booking.train_type}
                        </span>
                        {hasQuickPurchaseData(booking) && (
                          <span className="px-2.5 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                            간편구매
                          </span>
                        )}
                      </div>
                        {!editMode && (
                          isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )
                        )}
                      </div>
                      {formatTimePreference(booking) && (
                        <div className="text-sm text-gray-600">
                          {formatTimePreference(booking)}
                        </div>
                      )}
                    </button>
                  </div>

                  {isExpanded && !editMode && (
                    <div className="px-5 pb-4 pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-3">
                        <button className="py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                          열차 조회
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                            setShowQuickPurchase(true);
                          }}
                          className="py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          간편 구매 등록
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {editMode && selectedIds.length > 0 && (
        <div className="border-t border-gray-200 p-5">
          <button
            onClick={handleDelete}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-base"
          >
            삭제하기
          </button>
        </div>
      )}

      {showQuickPurchase && selectedBooking && (
        <QuickPurchaseModal
          departure={selectedBooking.departure}
          arrival={selectedBooking.arrival}
          onClose={() => {
            setShowQuickPurchase(false);
            setSelectedBooking(null);
            onClose();
          }}
          onSaved={(bookingId, openModal) => {
            setShowQuickPurchase(false);
            setSelectedBooking(null);
            onClose();
            onQuickPurchaseSaved?.(bookingId, openModal);
          }}
        />
      )}
    </div>
  );
}

import { ChevronLeft, MoreVertical, ArrowRight, Star } from 'lucide-react';
import { useState } from 'react';
import { QuickBooking } from '../lib/supabase';
import QuickPurchaseRegistrationModal, { QuickPurchaseData } from './QuickPurchaseRegistrationModal';

interface RecentTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: QuickBooking[];
  onDelete: (ids: string[]) => void;
  onEdit: (booking: QuickBooking) => void;
  onTripClick: (booking: QuickBooking) => void;
  onTripLongPressStart: (departure: string, arrival: string) => void;
  onTripLongPressEnd: () => void;
  selectedTripId?: string | null;
  onQuickPurchaseSave?: (data: QuickPurchaseData, departure: string, arrival: string) => Promise<void>;
}

export default function RecentTripsModal({
  isOpen,
  onClose,
  bookings,
  onDelete,
  onEdit,
  onTripClick,
  onTripLongPressStart,
  onTripLongPressEnd,
  selectedTripId,
  onQuickPurchaseSave,
}: RecentTripsModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showQuickPurchaseRegistration, setShowQuickPurchaseRegistration] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<QuickBooking | null>(null);

  if (!isOpen) return null;

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === bookings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(bookings.map(b => b.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size > 0) {
      onDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsEditMode(false);
    }
  };

  const handleIndividualDelete = (id: string) => {
    onDelete([id]);
    setDeleteConfirmId(null);
    setMenuOpenId(null);
  };

  const handleEdit = (booking: QuickBooking) => {
    onEdit(booking);
    setMenuOpenId(null);
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedIds(new Set());
  };

  return (
    <>
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
              최근 여정 내역
            </h1>
          </div>

          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-gray-700">편집</span>
            <button
              onClick={handleToggleEditMode}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isEditMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  isEditMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-4">
          {isEditMode && bookings.length > 0 && (
            <div className="mb-4">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedIds.size === bookings.length ? '전체 해제' : '전체 선택'}
              </button>
            </div>
          )}

          <div className="space-y-3">
            {bookings.map((booking) => {
              const passengerParts = [];
              if (booking.adults > 0) passengerParts.push(`성인 ${booking.adults}명`);
              if (booking.children > 0) passengerParts.push(`어린이 ${booking.children}명`);
              if (booking.infants > 0) passengerParts.push(`유아 ${booking.infants}명`);
              const passengerText = passengerParts.join(', ');

              return (
                <div
                  key={booking.id}
                  className={`rounded-xl p-4 shadow-sm border-2 relative transition-all ${
                    selectedTripId === booking.id ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-orange-200' : booking.is_quick_purchase ? 'bg-white border-gray-200 hover:border-gray-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isEditMode && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(booking.id)}
                        onChange={() => handleToggleSelect(booking.id)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1.5 text-white text-sm font-bold rounded-lg ${
                          selectedTripId === booking.id ? 'bg-orange-500' : 'bg-blue-600'
                        }`}>
                          {booking.label}
                        </span>
                        {booking.is_quick_purchase && (
                          <span className="px-2.5 py-1 bg-green-600 text-white text-xs font-bold rounded-md">
                            간편구매
                          </span>
                        )}
                        <span className={`px-2.5 py-1 text-white text-xs font-bold rounded-md ${
                          booking.train_type === 'KTX' ? 'bg-blue-600' : 'bg-orange-500'
                        }`}>
                          {booking.train_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-gray-900">{booking.departure}</span>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <span className="text-2xl font-bold text-gray-900">{booking.arrival}</span>
                      </div>

                      {passengerText && (
                        <div className="text-sm text-gray-600 mb-1">{passengerText}</div>
                      )}

                      <div className="text-sm text-gray-500">
                        {(() => {
                          // "2025년 11월 18일 (화) 05:20:00" 형식
                          const timeMatch = booking.departure_time.match(/\(([^)]+)\)\s+(\d{2}):/);
                          if (timeMatch) {
                            const [, weekday, hour] = timeMatch;
                            return `${weekday}요일 ${hour}시 이후`;
                          }
                          // "2025.11.18(화) 10시 이후" 형식 (간편구매 등록 시)
                          const timeMatch2 = booking.departure_time.match(/\(([^)]+)\)\s+(\d{2})시/);
                          if (timeMatch2) {
                            const [, weekday, hour] = timeMatch2;
                            return `${weekday}요일 ${hour}시 이후`;
                          }
                          return booking.departure_time;
                        })()}
                      </div>
                    </div>

                    {!isEditMode && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === booking.id ? null : booking.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {menuOpenId === booking.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setMenuOpenId(null)}
                            />
                            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-40 z-50">
                              {booking.is_quick_purchase && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    고정
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(booking);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    수정
                                  </button>
                                </>
                              )}
                              {!booking.is_quick_purchase && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenId(null);
                                    setSelectedBooking(booking);
                                    setShowQuickPurchaseRegistration(true);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium"
                                >
                                  간편구매 등록
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(booking.id);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors"
                              >
                                삭제
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {bookings.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p>최근 여정 내역이 없습니다</p>
            </div>
          )}
        </div>

        {isEditMode && selectedIds.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <button
              onClick={handleDeleteSelected}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-colors"
            >
              삭제하기 ({selectedIds.size})
            </button>
          </div>
        )}
      </div>

      {deleteConfirmId && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setDeleteConfirmId(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-[70] w-80 max-w-[90vw]">
            <h3 className="text-lg font-bold text-gray-900 mb-2">여정을 삭제하시겠습니까?</h3>
            <p className="text-sm text-gray-600 mb-6">삭제된 여정은 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleIndividualDelete(deleteConfirmId)}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </>
      )}

      {showQuickPurchaseRegistration && selectedBooking && (
        <QuickPurchaseRegistrationModal
          isOpen={showQuickPurchaseRegistration}
          departure={selectedBooking.departure}
          arrival={selectedBooking.arrival}
          onClose={() => {
            setShowQuickPurchaseRegistration(false);
            setSelectedBooking(null);
          }}
          onSave={async (data) => {
            setShowQuickPurchaseRegistration(false);
            setSelectedBooking(null);
            if (onQuickPurchaseSave) {
              await onQuickPurchaseSave(data, selectedBooking.departure, selectedBooking.arrival);
            }
          }}
        />
      )}
    </>
  );
}

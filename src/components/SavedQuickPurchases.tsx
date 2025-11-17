import { useEffect, useState } from 'react';
import { Plus, Calendar, Clock, Users, X } from 'lucide-react';
import { QuickBooking, supabase } from '../lib/supabase';
import QuickPurchaseModal from './QuickPurchaseModal';

interface SavedQuickPurchasesProps {
  onSelectBooking: (booking: QuickBooking) => void;
  refreshTrigger?: number;
  onQuickPurchaseSaved?: (bookingId: string, openModal?: boolean) => void;
}

export default function SavedQuickPurchases({ onSelectBooking, refreshTrigger, onQuickPurchaseSaved }: SavedQuickPurchasesProps) {
  const [bookings, setBookings] = useState<QuickBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('quick_bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Failed to load quick bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [refreshTrigger]);

  const formatDays = (days: string[]) => {
    if (days.length === 7) return '매일';
    if (days.length === 0) return '-';
    return days.join(', ');
  };

  const formatTime = (time: string) => {
    const timeMatch = time.match(/(\d{4})\.(\d{2})\.(\d{2})\(([^)]+)\)\s+(.+)/);
    if (timeMatch) {
      const [, , , , weekdayStr, timeStr] = timeMatch;
      const weekdayMap: { [key: string]: string } = {
        '월': '월요일', '화': '화요일', '수': '수요일', '목': '목요일',
        '금': '금요일', '토': '토요일', '일': '일요일'
      };
      const fullWeekday = weekdayMap[weekdayStr] || weekdayStr;
      return `${fullWeekday} ${timeStr}`;
    }
    return time;
  };

  const formatPassengers = (booking: QuickBooking) => {
    const parts = [];
    if (booking.adults > 0) parts.push(`성인 ${booking.adults}`);
    if (booking.children > 0) parts.push(`어린이 ${booking.children}`);
    if (booking.seniors > 0) parts.push(`경로 ${booking.seniors}`);
    return parts.join(', ');
  };

  const handleDelete = async (bookingId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { error } = await supabase
        .from('quick_bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      await loadBookings();
    } catch (error) {
      console.error('Failed to delete booking:', error);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">간편 구매</h2>
          {bookings.length > 0 && (
            <button
              onClick={() => setIsDeleteMode(!isDeleteMode)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isDeleteMode
                  ? 'text-white bg-red-600 hover:bg-red-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {isDeleteMode ? '완료' : '삭제'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white rounded-2xl p-4 shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center min-h-[140px]"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-600">간편 구매 추가</div>
            </div>
          </button>

          {bookings.map((booking) => (
            <button
              key={booking.id}
              onClick={() => !isDeleteMode && onSelectBooking(booking)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left relative"
            >
              {isDeleteMode && (
                <button
                  onClick={(e) => handleDelete(booking.id, e)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shadow-md hover:bg-red-700 transition-colors z-10"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}

              <div className="inline-block px-3 py-1 border-2 border-blue-600 text-blue-600 text-xs font-bold rounded-lg mb-3">
                {booking.label}
              </div>

              <div className="text-lg font-bold text-gray-900 mb-3">
                {booking.departure} → {booking.arrival}
              </div>

              <div className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded">
                간편구매 화 10시 이후
              </div>
            </button>
          ))}
        </div>
      </section>

      {showAddModal && (
        <QuickPurchaseModal
          departure="서울"
          arrival="부산"
          onClose={() => setShowAddModal(false)}
          onSaved={(bookingId, openModal) => {
            setShowAddModal(false);
            loadBookings();
            onQuickPurchaseSaved?.(bookingId, openModal);
          }}
        />
      )}
    </>
  );
}

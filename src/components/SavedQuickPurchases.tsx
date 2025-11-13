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

              <div className="mb-3">
                <div className="text-xs font-medium text-blue-600 mb-1">{booking.label}</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{booking.departure}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-lg font-bold text-gray-900">{booking.arrival}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDays(booking.days_of_week)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(booking.departure_time)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Users className="w-3.5 h-3.5" />
                  <span>{formatPassengers(booking)}</span>
                </div>
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

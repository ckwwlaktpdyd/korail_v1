import { useState, useEffect } from 'react';
import { Plus, X, ArrowRight } from 'lucide-react';
import { getQuickBookings, deleteQuickBooking, addQuickBooking, QuickBooking } from '../lib/supabase';
import AddQuickBookingModal from './AddQuickBookingModal';
import RecentBookingModal from './RecentBookingModal';
import RecentBookingsListModal from './RecentBookingsListModal';

interface QuickBookingListProps {
  onSelectBooking: (booking: QuickBooking) => void;
  onQuickPurchaseSaved?: (bookingId: string, openModal?: boolean) => void;
  onQuickPurchase?: (booking: QuickBooking) => void;
}

export default function QuickBookingList({ onSelectBooking, onQuickPurchaseSaved, onQuickPurchase }: QuickBookingListProps) {
  const [bookings, setBookings] = useState<QuickBooking[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<QuickBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    const data = await getQuickBookings();
    setBookings(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await deleteQuickBooking(id);
    if (success) {
      setBookings(bookings.filter(b => b.id !== id));
    }
  };

  const handleAdd = async (newBooking: {
    label: string;
    departure: string;
    arrival: string;
    train_type: string;
    adults: number;
    children: number;
    infants: number;
  }) => {
    const booking = await addQuickBooking(newBooking);
    if (booking) {
      setBookings([...bookings, booking]);
      setShowAddModal(false);
    }
  };

  const formatPassengers = (adults: number, children: number, infants: number) => {
    const parts = [];
    if (adults > 0) parts.push(`성인 ${adults}명`);
    if (children > 0) parts.push(`어린이 ${children}명`);
    if (infants > 0) parts.push(`유아 ${infants}명`);
    return parts.join(', ');
  };

  const formatTimePreference = (booking: QuickBooking) => {
    const parts = [];
    if (booking.days_of_week && booking.days_of_week.length > 0) {
      parts.push(booking.days_of_week.join(', '));
    }
    if (booking.departure_time) {
      parts.push(`${booking.departure_time} 이후`);
    }
    return parts.join(' ');
  };

  if (isLoading) {
    return (
      <section className="px-5 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">최근 예매 노선</h2>
        </div>
        <div className="text-center py-8 text-gray-500">로딩 중...</div>
      </section>
    );
  }

  return (
    <>
      <section className="px-5 mt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">최근 예매 노선</h2>
          <button
            onClick={() => setShowListModal(true)}
            className="text-base text-blue-500 font-medium hover:text-blue-600"
          >
            더보기
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-hide -mx-5 px-5">
          <div className="flex gap-4 pb-2">
            {bookings.map((booking) => (
              <div key={booking.id} className="relative flex-shrink-0 w-[180px]">
                <div
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 active:scale-[0.98] transition-all duration-200 cursor-pointer mb-3"
                  onClick={() => onSelectBooking(booking)}
                >
                  <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full mb-3">
                    {booking.train_type}
                  </span>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-gray-900">{booking.departure}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-lg font-bold text-gray-900">{booking.arrival}</span>
                  </div>

                  <div className="text-xs text-gray-600 mb-1">
                    {formatTimePreference(booking)}
                  </div>

                  <div className="text-xs text-gray-600">
                    {formatPassengers(booking.adults, booking.children, booking.infants)}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onQuickPurchase) {
                      onQuickPurchase(booking);
                    } else {
                      setSelectedBooking(booking);
                      setShowRecentModal(true);
                    }
                  }}
                  className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-sm"
                >
                  간편 구매
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showRecentModal && selectedBooking && (
        <RecentBookingModal
          booking={selectedBooking}
          onClose={() => {
            setShowRecentModal(false);
            setSelectedBooking(null);
          }}
          onQuickPurchaseSaved={(bookingId, openModal) => {
            setShowRecentModal(false);
            setSelectedBooking(null);
            onQuickPurchaseSaved?.(bookingId, openModal);
          }}
        />
      )}

      {showListModal && (
        <RecentBookingsListModal
          bookings={bookings}
          onClose={() => setShowListModal(false)}
          onQuickPurchaseSaved={(bookingId, openModal) => {
            setShowListModal(false);
            onQuickPurchaseSaved?.(bookingId, openModal);
          }}
        />
      )}
    </>
  );
}

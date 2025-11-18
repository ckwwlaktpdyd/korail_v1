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
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

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
    if (!booking.departure_time) return null;

    // Parse departure_time format: "2025년 11월 18일 (화) 05:20:00"
    const timeMatch = booking.departure_time.match(/\((.)\)\s*(\d+):(\d+)/);
    if (timeMatch) {
      const weekday = timeMatch[1];
      const hour = parseInt(timeMatch[2], 10);
      return `간편구매 ${weekday} ${hour}시 이후`;
    }

    return null;
  };

  const hasQuickPurchaseData = (booking: QuickBooking) => {
    // Check if this booking is registered as a quick purchase
    const result = booking.is_quick_purchase === true;
    console.log('hasQuickPurchaseData:', booking.departure, '→', booking.arrival, 'is_quick_purchase:', booking.is_quick_purchase, 'result:', result);
    return result;
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
            {bookings.map((booking) => {
              const isQuickPurchase = hasQuickPurchaseData(booking);
              console.log('Booking:', booking.departure, '→', booking.arrival, 'is_quick_purchase:', booking.is_quick_purchase, 'isQuickPurchase:', isQuickPurchase, 'label:', booking.label);

              return (
              <div key={booking.id} className="relative flex-shrink-0 w-[180px]">
                {isQuickPurchase ? (
                  <div
                    className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer mb-3"
                    onClick={() => {
                      setActiveBookingId(activeBookingId === booking.id ? null : booking.id);
                      onSelectBooking(booking);
                    }}
                  >
                    {booking.label && booking.label.trim() && (
                      <div className="inline-block px-3 py-1 border-2 border-blue-600 text-blue-600 text-xs font-bold rounded-lg mb-3">
                        {booking.label}
                      </div>
                    )}

                    <div className={booking.label && booking.label.trim() ? "mb-3" : "mb-0"}>
                      <div className="text-lg font-bold text-gray-900">
                        {booking.departure} → {booking.arrival}
                      </div>
                    </div>

                    {formatTimePreference(booking) && (
                      <div className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded">
                        {formatTimePreference(booking)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="group bg-gray-50 rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer mb-3"
                    onClick={() => {
                      setActiveBookingId(activeBookingId === booking.id ? null : booking.id);
                      onSelectBooking(booking);
                    }}
                  >
                    <div className="text-lg font-bold text-gray-900 mb-3">
                      {booking.departure} → {booking.arrival}
                    </div>

                    <div className="text-sm text-gray-600">
                      {booking.departure_time || '2025.11.19(수)'}
                    </div>
                  </div>
                )}

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
              );
            })}
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
          onClose={() => {
            setShowListModal(false);
            loadBookings();
          }}
          onQuickPurchaseSaved={(bookingId, openModal) => {
            setShowListModal(false);
            loadBookings();
            onQuickPurchaseSaved?.(bookingId, openModal);
          }}
        />
      )}
    </>
  );
}

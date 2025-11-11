import { ArrowLeftRight, Calendar } from 'lucide-react';

interface QuickBookingProps {
  bookingData: {
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    date: string;
    passengers: { adults: number; children: number; infants: number };
    trainType: string;
    timeSlot: string;
  };
  onOpenModal: () => void;
}

export default function QuickBooking({ bookingData, onOpenModal }: QuickBookingProps) {
  const totalPassengers = bookingData.passengers.adults + bookingData.passengers.children + bookingData.passengers.infants;

  return (
    <section className="bg-white rounded-3xl mx-5 mt-6 p-6 shadow-lg">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button className="flex-1 px-6 py-2.5 rounded-full text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
          편도
        </button>
        <button className="flex-1 px-6 py-2.5 rounded-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md">
          왕복
        </button>
      </div>

      {/* Route Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">출발</div>
            <div className="text-3xl font-bold text-gray-900">{bookingData.departure}</div>
          </div>

          <button className="mx-4 p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-md">
            <ArrowLeftRight className="w-6 h-6 text-white" />
          </button>

          <div className="flex-1 text-right">
            <div className="text-sm text-gray-600 mb-1">도착</div>
            <div className="text-3xl font-bold text-gray-900">{bookingData.arrival}</div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 mb-6"></div>

      {/* Date Section */}
      <button
        onClick={onOpenModal}
        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
      >
        <div>
          <div className="text-sm text-gray-600 mb-1 text-left">가는날</div>
          <div className="text-lg font-bold text-gray-900">{bookingData.date}</div>
        </div>
        <Calendar className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </button>

      {/* Search Button */}
      <button
        onClick={onOpenModal}
        className="w-full mt-6 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
      >
        열차 조회
      </button>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Menu } from 'lucide-react';
import PaymentModal from './PaymentModal';
import PaymentSuccessModal from './PaymentSuccessModal';

interface SeatSelectionProps {
  onBack: () => void;
  onBackToHome?: () => void;
  onSaveAsQuickBooking?: (bookingData: any) => Promise<string | null>;
  onDeleteQuickBooking?: (id: string) => Promise<void>;
  onOpenQuickPurchase?: (bookingData: any) => void;
  onSaveBookingHistory?: (bookingData: any) => Promise<void>;
  onToggleQuickPurchase?: (id: string, isQuickPurchase: boolean) => Promise<void>;
  trainInfo: {
    trainType: string;
    trainNumber: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    arrivalTime: string;
    date: string;
    price: number;
    passengerCount: number;
  };
}

interface Seat {
  number: number;
  row: number;
  column: number;
  isAvailable: boolean;
  isSelected: boolean;
  side: 'left' | 'right';
}

export function SeatSelection({ onBack, onBackToHome, onSaveAsQuickBooking, onDeleteQuickBooking, onOpenQuickPurchase, onSaveBookingHistory, onToggleQuickPurchase, trainInfo }: SeatSelectionProps) {
  const [selectedCar, setSelectedCar] = useState(4);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [finalPaymentPrice, setFinalPaymentPrice] = useState<number>(0);

  const totalCars = 10;
  const seatsPerCar = 63;
  const windowSeats = [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26];

  useEffect(() => {
    generateSeats();
  }, [selectedCar]);

  const generateSeats = () => {
    const newSeats: Seat[] = [];
    const totalRows = Math.ceil(seatsPerCar / 4);

    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < 4; col++) {
        const seatNumber = row * 4 + col + 1;
        if (seatNumber <= seatsPerCar) {
          const isAvailable = Math.random() > 0.3;

          newSeats.push({
            number: seatNumber,
            row,
            column: col,
            isAvailable,
            isSelected: false,
            side: col < 2 ? 'left' : 'right',
          });
        }
      }
    }

    setSeats(newSeats);
    setSelectedSeats([]);
  };

  const handleSeatClick = (seatNumber: number) => {
    const seat = seats.find(s => s.number === seatNumber);
    if (!seat || !seat.isAvailable) return;

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      if (selectedSeats.length < trainInfo.passengerCount) {
        setSelectedSeats([...selectedSeats, seatNumber]);
      }
    }
  };

  const handleCancelSelection = () => {
    setSelectedSeats([]);
  };

  const handleConfirmBooking = () => {
    setShowPaymentModal(true);
  };

  const getPassengers = () => {
    return {
      adults: trainInfo.passengerCount,
      children: 0,
      infants: 0
    };
  };

  const getSeatsByRow = (row: number) => {
    return seats.filter(s => s.row === row);
  };

  const totalRows = Math.ceil(seatsPerCar / 4);

  const getSeatStyle = (seat: Seat) => {
    if (selectedSeats.includes(seat.number)) {
      return 'bg-blue-600 text-white border-blue-700';
    }
    if (!seat.isAvailable) {
      return 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed';
    }
    return 'bg-white text-gray-900 border-gray-300 hover:border-blue-500 cursor-pointer';
  };

  const isWindowSeat = (seatNumber: number) => {
    return windowSeats.includes(seatNumber);
  };

  const totalPrice = trainInfo.price * trainInfo.passengerCount;

  return (
    <div className="h-screen bg-gray-50 flex flex-col max-w-[430px] mx-auto overflow-hidden">
      {/* 헤더 */}
      <header className="bg-[#1e4d6b] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">{selectedCar}호차 좌석 선택</h1>
        <div className="flex items-center gap-2">
          <button className="p-1">
            <Clock className="w-6 h-6" />
          </button>
          <button className="p-1">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* 호차 선택 드롭다운 */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <select
          value={selectedCar}
          onChange={(e) => setSelectedCar(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: totalCars }, (_, i) => i + 1).map(car => (
            <option key={car} value={car}>
              {car}호차 ({seatsPerCar}석)
            </option>
          ))}
        </select>
      </div>

      {/* 열차 정보 */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-center gap-3 mb-2">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-full">
            {selectedCar - 1 > 0 ? `${selectedCar - 1}호차` : ''}
          </button>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              KTX {trainInfo.trainNumber} (일반석)
            </div>
            <div className="text-sm text-gray-600">
              전여 {seats.filter(s => s.isAvailable).length}석 / 전체 {seatsPerCar}석
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-full">
            {selectedCar + 1 <= totalCars ? `${selectedCar + 1}호차` : ''}
          </button>
        </div>

        {/* 좌석 타입 표시 */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-600 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border-2 border-gray-400 bg-gray-300"></div>
            <span>선택 불가</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white"></div>
            <span>선택 가능</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 text-gray-500">U</div>
            <span>순방향</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 text-gray-500">∩</div>
            <span>역방향</span>
          </div>
        </div>
      </div>

      {/* 좌석 맵 */}
      <div className="flex-1 overflow-y-auto bg-gray-100 px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          {/* 창측/내측 라벨 */}
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-sm text-gray-600 font-medium">창측</span>
            <span className="text-sm text-gray-600 font-medium">내측</span>
            <div className="w-8"></div>
            <span className="text-sm text-gray-600 font-medium">내측</span>
            <span className="text-sm text-gray-600 font-medium">창측</span>
          </div>

          {/* 좌석 배치 */}
          <div className="space-y-4">
            {Array.from({ length: totalRows }, (_, row) => {
              const rowSeats = getSeatsByRow(row);
              if (rowSeats.length === 0) return null;

              return (
                <div key={row} className="flex items-center justify-between gap-2">
                  {/* 왼쪽 좌석 2개 */}
                  <div className="flex gap-2">
                    {rowSeats.slice(0, 2).map(seat => (
                      <button
                        key={seat.number}
                        onClick={() => handleSeatClick(seat.number)}
                        disabled={!seat.isAvailable}
                        className={`w-12 h-12 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center ${getSeatStyle(seat)}`}
                      >
                        {seat.number}
                      </button>
                    ))}
                  </div>

                  {/* 통로 방향 표시 */}
                  <div className="flex items-center justify-center w-8">
                    <span className="text-gray-500 text-xl">
                      ▲
                    </span>
                  </div>

                  {/* 오른쪽 좌석 2개 */}
                  <div className="flex gap-2">
                    {rowSeats.slice(2, 4).map(seat => (
                      <button
                        key={seat.number}
                        onClick={() => handleSeatClick(seat.number)}
                        disabled={!seat.isAvailable}
                        className={`w-12 h-12 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center ${getSeatStyle(seat)}`}
                      >
                        {seat.number}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 하단 선택 시트 */}
      {selectedSeats.length > 0 && (
        <div className="bg-white border-t-2 border-gray-200 shadow-lg flex-shrink-0">
          {/* 선택 정보 */}
          <div className="px-4 py-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">출발 → 도착</div>
                <div className="text-base font-bold text-gray-900">
                  {trainInfo.departureStation} → {trainInfo.arrivalStation}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">열차</div>
                <div className="text-base font-bold text-gray-900">{trainInfo.trainType} {trainInfo.trainNumber}</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">좌석</div>
                <div className="text-lg font-bold text-blue-600">
                  {selectedCar}호차 {selectedSeats.sort((a, b) => a - b).join(', ')}번
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">승객</div>
                <div className="text-lg font-bold text-gray-900">{trainInfo.passengerCount}명</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-300">
              <div className="text-sm font-medium text-gray-700">총 금액</div>
              <div className="text-2xl font-bold text-blue-600">{totalPrice.toLocaleString()}원</div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="px-4 py-3 flex gap-3">
            <button
              onClick={handleCancelSelection}
              className="flex-1 py-3.5 bg-gray-200 text-gray-700 text-base font-bold rounded-xl hover:bg-gray-300 transition-all"
            >
              취소
            </button>
            <button
              disabled={selectedSeats.length !== trainInfo.passengerCount}
              onClick={handleConfirmBooking}
              className={`flex-1 py-3.5 rounded-xl text-base font-bold transition-all ${
                selectedSeats.length === trainInfo.passengerCount
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              예매하기
            </button>
          </div>
        </div>
      )}
      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          bookingData={{
            departure: trainInfo.departureStation,
            arrival: trainInfo.arrivalStation,
            departureTime: trainInfo.departureTime,
            arrivalTime: trainInfo.arrivalTime,
            date: trainInfo.date,
            passengers: getPassengers(),
            trainType: trainInfo.trainType,
            trainNumber: trainInfo.trainNumber,
            carNumber: selectedCar,
            seatNumbers: selectedSeats.sort((a, b) => a - b),
          }}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={(totalPrice) => {
            setFinalPaymentPrice(totalPrice);
            setShowPaymentModal(false);
            setShowPaymentSuccessModal(true);
          }}
          onSearchOtherTrains={() => {
            setShowPaymentModal(false);
            setSelectedSeats([]);
            onBack();
          }}
        />
      )}

      {showPaymentSuccessModal && (
        <PaymentSuccessModal
          isFromQuickPurchase={false}
          onClose={() => {
            setShowPaymentSuccessModal(false);
            setSelectedSeats([]);
            if (onBackToHome) {
              onBackToHome();
            } else {
              onBack();
            }
          }}
          onSaveAsQuickBooking={async (baseLabel: string) => {
            if (onSaveAsQuickBooking) {
              return await onSaveAsQuickBooking({
                departure: trainInfo.departureStation,
                arrival: trainInfo.arrivalStation,
                trainType: trainInfo.trainType,
                date: trainInfo.date,
                time: trainInfo.departureTime,
                passengers: getPassengers(),
              });
            }
            return null;
          }}
          onDeleteQuickBooking={onDeleteQuickBooking}
          onOpenQuickPurchase={onOpenQuickPurchase}
          onSaveBookingHistory={onSaveBookingHistory}
          onToggleQuickPurchase={onToggleQuickPurchase}
          bookingData={{
            departure: trainInfo.departureStation,
            arrival: trainInfo.arrivalStation,
            departureTime: trainInfo.departureTime,
            arrivalTime: trainInfo.arrivalTime,
            date: trainInfo.date,
            passengers: getPassengers(),
            trainType: trainInfo.trainType,
            trainNumber: trainInfo.trainNumber,
            carNumber: selectedCar,
            seatNumbers: selectedSeats.sort((a, b) => a - b),
            totalPrice: finalPaymentPrice,
          }}
        />
      )}
    </div>
  );
}

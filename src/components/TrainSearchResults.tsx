import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, ArrowRight, Home, Ticket, Map, MoreHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import StationPickerModal from './StationPickerModal';
import { SeatSelection } from './SeatSelection';

interface TrainSchedule {
  id: string;
  train_number: string;
  train_type: string;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
  travel_date: string;
  regular_price: number;
  first_class_price: number | null;
  has_regular_seats: boolean;
  has_first_class_seats: boolean;
  discount_rate: number;
  discount_type: string | null;
}

interface TrainSearchResultsProps {
  onBack: () => void;
  onBackToHome?: () => void;
  onSaveAsQuickBooking?: (bookingData: any) => Promise<string | null>;
  onDeleteQuickBooking?: (id: string) => Promise<void>;
  onOpenQuickPurchase?: (bookingData: any) => void;
  initialDeparture?: string;
  initialArrival?: string;
  initialDate?: string;
  initialPassengerCount?: number;
}


export function TrainSearchResults({
  onBack,
  onBackToHome,
  onSaveAsQuickBooking,
  onDeleteQuickBooking,
  onOpenQuickPurchase,
  initialDeparture = '청량리',
  initialArrival = '대전',
  initialDate = '2025.11.11(화)',
  initialPassengerCount = 1
}: TrainSearchResultsProps) {
  const parseDateString = (dateStr: string) => {
    const match = dateStr.match(/(\d{4})\.(\d{2})\.(\d{2})/);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const day = parseInt(match[3]);
      return new Date(year, month, day);
    }
    return new Date(2025, 10, 11);
  };

  const [departureStation, setDepartureStation] = useState(initialDeparture);
  const [arrivalStation, setArrivalStation] = useState(initialArrival);
  const [selectedDate, setSelectedDate] = useState(parseDateString(initialDate));
  const [trains, setTrains] = useState<TrainSchedule[]>([]);
  const [filteredTrains, setFilteredTrains] = useState<TrainSchedule[]>([]);
  const [seatFilter, setSeatFilter] = useState<'all' | 'regular'>('all');
  const [trainTypeFilter, setTrainTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showStationPicker, setShowStationPicker] = useState(false);
  const [stationPickerMode, setStationPickerMode] = useState<'departure' | 'arrival'>('departure');
  const [selectedTrain, setSelectedTrain] = useState<TrainSchedule | null>(null);
  const [showSeatSelection, setShowSeatSelection] = useState(false);

  useEffect(() => {
    fetchTrains();
  }, [departureStation, arrivalStation, selectedDate]);

  useEffect(() => {
    applyFilters();
  }, [trains, seatFilter, trainTypeFilter]);

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('train_schedules')
        .select('*')
        .eq('departure_station', departureStation)
        .eq('arrival_station', arrivalStation)
        .eq('travel_date', dateStr)
        .order('departure_time', { ascending: true });

      if (error) throw error;
      setTrains(data || []);
    } catch (error) {
      console.error('Error fetching trains:', error);
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trains];

    // 좌석 타입 필터
    if (seatFilter === 'regular') {
      filtered = filtered.filter(t => t.has_regular_seats);
    }

    // 열차 타입 필터
    if (trainTypeFilter !== 'all') {
      filtered = filtered.filter(t => t.train_type === trainTypeFilter);
    }

    setFilteredTrains(filtered);
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const swapStations = () => {
    const temp = departureStation;
    setDepartureStation(arrivalStation);
    setArrivalStation(temp);
  };

  const handleStationSelect = (station: string) => {
    if (stationPickerMode === 'departure') {
      setDepartureStation(station);
    } else {
      setArrivalStation(station);
    }
    setShowStationPicker(false);
  };

  const handleTrainSelect = (train: TrainSchedule) => {
    setSelectedTrain(train);
    setShowSeatSelection(true);
  };

  if (showSeatSelection && selectedTrain) {
    return (
      <SeatSelection
        onBack={() => setShowSeatSelection(false)}
        onBackToHome={onBackToHome}
        onSaveAsQuickBooking={onSaveAsQuickBooking}
        onDeleteQuickBooking={onDeleteQuickBooking}
        onOpenQuickPurchase={onOpenQuickPurchase}
        trainInfo={{
          trainType: selectedTrain.train_type,
          trainNumber: selectedTrain.train_number,
          departureStation: selectedTrain.departure_station,
          arrivalStation: selectedTrain.arrival_station,
          departureTime: selectedTrain.departure_time,
          arrivalTime: selectedTrain.arrival_time,
          date: formatDate(selectedDate),
          price: selectedTrain.regular_price,
          passengerCount: initialPassengerCount,
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-[430px] mx-auto">
      {/* 헤더 */}
      <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">열차 조회</h1>
        <button onClick={fetchTrains} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <RefreshCw className={`w-6 h-6 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {/* 출발/도착 정보 카드 */}
        <section className="mx-4 mt-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setStationPickerMode('departure');
                  setShowStationPicker(true);
                }}
                className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {departureStation}
              </button>
              <button
                onClick={swapStations}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => {
                  setStationPickerMode('arrival');
                  setShowStationPicker(true);
                }}
                className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {arrivalStation}
              </button>
            </div>
          </div>
        </section>

        {/* 날짜 선택 */}
        <section className="mx-4 mt-3">
          <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between">
            <button
              onClick={handlePreviousDay}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              이전날
            </button>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {formatDate(selectedDate)}
              </div>
            </div>
            <button
              onClick={handleNextDay}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              다음날
            </button>
          </div>
        </section>

        {/* 필터 */}
        <section className="mx-4 mt-3">
          <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex gap-2">
            <button
              onClick={() => setSeatFilter('all')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full border-2 transition-all ${
                seatFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setSeatFilter('regular')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-full border-2 transition-all ${
                seatFilter === 'regular'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              일반석
            </button>
          </div>
        </section>

        {/* 열차 목록 */}
        <section className="mx-4 mt-3">
          <div className="text-xs text-gray-500 mb-2 px-1 font-medium">
            {filteredTrains.length > 0 ? `총 ${filteredTrains.length}개의 열차` : '열차 목록'}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredTrains.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <p className="text-sm">조회된 열차가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTrains.map((train) => (
                <div
                  key={train.id}
                  className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    {/* 열차 정보 */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col items-start">
                        <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-md mb-1.5">
                          {train.train_type}
                        </span>
                        <span className="text-xs text-gray-500">{train.train_number}</span>
                      </div>

                      {/* 시간 정보 */}
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="text-base font-bold text-gray-900">
                            {train.departure_time.substring(0, 5)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{train.departure_station}</div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-gray-400" />

                        <div className="text-center">
                          <div className="text-base font-bold text-gray-900">
                            {train.arrival_time.substring(0, 5)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{train.arrival_station}</div>
                        </div>
                      </div>
                    </div>

                    {/* 가격 버튼 */}
                    <div className="ml-3">
                      {train.has_regular_seats ? (
                        <button
                          onClick={() => handleTrainSelect(train)}
                          className="px-4 py-2.5 text-base font-bold text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 active:scale-95 transition-all whitespace-nowrap"
                        >
                          {formatPrice(train.regular_price)}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">매진</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2.5 z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button onClick={onBack} className="flex flex-col items-center gap-0.5 text-blue-600">
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">홈</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-600 transition-colors">
            <Ticket className="w-5 h-5" />
            <span className="text-[10px] font-medium">승차권확인</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-600 transition-colors">
            <Map className="w-5 h-5" />
            <span className="text-[10px] font-medium">관광상품</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">더보기</span>
          </button>
        </div>
      </nav>

      {/* 역 선택 모달 */}
      <StationPickerModal
        isOpen={showStationPicker}
        onSelect={handleStationSelect}
        onClose={() => setShowStationPicker(false)}
        title={stationPickerMode === 'departure' ? '출발역 선택' : '도착역 선택'}
        currentStation={stationPickerMode === 'departure' ? departureStation : arrivalStation}
      />
    </div>
  );
}

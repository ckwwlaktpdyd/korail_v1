import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface QuickBooking {
  id: string;
  user_id: string | null;
  label: string;
  departure: string;
  arrival: string;
  train_type: string;
  adults: number;
  children: number;
  infants: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  departure_time?: string;
  days_of_week?: string[];
  seat_class?: string;
  seat_direction?: string;
  car_number?: number;
  seat_numbers?: string;
  is_quick_purchase?: boolean;
  booking_status?: string;
  total_price?: number;
  payment_date?: string;
}

export async function getQuickBookings(): Promise<QuickBooking[]> {
  const { data, error } = await supabase
    .from('quick_bookings')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching quick bookings:', error);
    return [];
  }

  return data || [];
}

export async function addQuickBooking(booking: {
  label: string;
  departure: string;
  arrival: string;
  train_type?: string;
  adults?: number;
  children?: number;
  infants?: number;
  departure_time?: string;
  seat_class?: string;
  seat_direction?: string;
  car_number?: number;
  seat_numbers?: string;
  is_quick_purchase?: boolean;
}): Promise<QuickBooking | null> {
  const maxOrder = await getMaxOrderIndex();

  const { data, error } = await supabase
    .from('quick_bookings')
    .insert([
      {
        ...booking,
        train_type: booking.train_type || 'KTX',
        adults: booking.adults || 1,
        children: booking.children || 0,
        infants: booking.infants || 0,
        is_quick_purchase: booking.is_quick_purchase || false,
        order_index: maxOrder + 1,
      },
    ])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error adding quick booking:', error);
    return null;
  }

  return data;
}

export async function deleteQuickBooking(id: string): Promise<boolean> {
  console.log('deleteQuickBooking called with id:', id);
  const { error, data } = await supabase
    .from('quick_bookings')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error deleting quick booking:', error);
    return false;
  }

  console.log('Deleted booking:', data);
  return true;
}

export async function deleteQuickBookings(ids: string[]): Promise<boolean> {
  console.log('deleteQuickBookings called with ids:', ids);
  const { error, data } = await supabase
    .from('quick_bookings')
    .delete()
    .in('id', ids)
    .select();

  if (error) {
    console.error('Error deleting quick bookings:', error);
    return false;
  }

  console.log('Deleted bookings:', data);
  return true;
}

export async function updateQuickBooking(
  id: string,
  updates: Partial<QuickBooking>
): Promise<QuickBooking | null> {
  const { data, error } = await supabase
    .from('quick_bookings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating quick booking:', error);
    return null;
  }

  return data;
}

async function getMaxOrderIndex(): Promise<number> {
  const { data, error } = await supabase
    .from('quick_bookings')
    .select('order_index')
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return 0;
  }

  return data.order_index;
}

export async function getBookingHistory(): Promise<QuickBooking[]> {
  const { data, error } = await supabase
    .from('quick_bookings')
    .select('*')
    .eq('booking_status', 'completed')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching booking history:', error);
    return [];
  }

  return data || [];
}

export async function getQuickPurchases(): Promise<QuickBooking[]> {
  const { data, error } = await supabase
    .from('quick_bookings')
    .select('*')
    .eq('is_quick_purchase', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching quick purchases:', error);
    return [];
  }

  return data || [];
}

export async function saveBookingHistory(booking: {
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  trainType: string;
  trainNumber: string;
  passengers: { adults: number; children: number; infants: number };
  carNumber?: number;
  seatNumbers?: number[];
  seatClass?: string;
  seatDirection?: string;
  totalPrice?: number;
}): Promise<QuickBooking | null> {
  console.log('saveBookingHistory called with:', booking);
  const maxOrder = await getMaxOrderIndex();

  // General booking history doesn't need labels
  const label = '';

  // Format departure_time to match quick purchase format: "YYYY.MM.DD(요일) HH시 이후"
  const formatDateTime = (date: string, time: string): string => {
    // Extract hour from time (e.g., "05:30" -> "05")
    const hour = time.split(':')[0];
    // Return formatted string with "시 이후" suffix
    return `${date} ${hour}시 이후`;
  };

  const insertData = {
    label: label,
    departure: booking.departure,
    arrival: booking.arrival,
    train_type: booking.trainType,
    adults: booking.passengers.adults,
    children: booking.passengers.children,
    infants: booking.passengers.infants,
    departure_time: formatDateTime(booking.date, booking.departureTime),
    seat_class: booking.seatClass,
    seat_direction: booking.seatDirection,
    car_number: booking.carNumber,
    seat_numbers: booking.seatNumbers?.join(', '),
    is_quick_purchase: false,
    booking_status: 'completed',
    total_price: booking.totalPrice,
    payment_date: new Date().toISOString(),
    order_index: maxOrder + 1,
  };

  console.log('Inserting data:', insertData);

  const { data, error } = await supabase
    .from('quick_bookings')
    .insert([insertData])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving booking history:', error);
    return null;
  }

  console.log('Booking history saved successfully:', data);
  return data;
}

export async function toggleQuickPurchase(
  id: string,
  isQuickPurchase: boolean
): Promise<QuickBooking | null> {
  const { data, error } = await supabase
    .from('quick_bookings')
    .update({
      is_quick_purchase: isQuickPurchase,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error toggling quick purchase:', error);
    return null;
  }

  return data;
}

export async function convertToQuickPurchase(
  id: string,
  label: string
): Promise<QuickBooking | null> {
  const { data, error } = await supabase
    .from('quick_bookings')
    .update({
      is_quick_purchase: true,
      label: label,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error converting to quick purchase:', error);
    return null;
  }

  return data;
}

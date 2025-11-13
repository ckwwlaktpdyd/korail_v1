import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 생성 (환경 변수가 없으면 null 반환)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
}

export async function getQuickBookings(): Promise<QuickBooking[]> {
  if (!supabase) {
    console.warn('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    return [];
  }

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
}): Promise<QuickBooking | null> {
  if (!supabase) {
    console.warn('Supabase is not configured.');
    return null;
  }

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
  if (!supabase) {
    console.warn('Supabase is not configured.');
    return false;
  }

  const { error } = await supabase
    .from('quick_bookings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting quick booking:', error);
    return false;
  }

  return true;
}

export async function updateQuickBooking(
  id: string,
  updates: Partial<QuickBooking>
): Promise<QuickBooking | null> {
  if (!supabase) {
    console.warn('Supabase is not configured.');
    return null;
  }

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
  if (!supabase) {
    return 0;
  }

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

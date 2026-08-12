import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface OrderRecord {
  id: string;
  tool_name: string;
  website_url: string;
  tagline: string;
  category: string;
  pricing: string;
  founder_email: string;
  plan: string;
  amount_usd: number;
  crypto_currency: string;
  wallet_address?: string;
  tx_hash?: string;
  status: 'pending' | 'submitted' | 'confirmed' | 'rejected';
  is_featured?: boolean;
  featured_until?: string | null;
  created_at: string;
  updated_at: string;
}

// Global in-memory fallback store across Next.js API route invocations
declare global {
  // eslint-disable-next-line no-var
  var __LOCAL_ORDERS_STORE: OrderRecord[] | undefined;
}

if (!globalThis.__LOCAL_ORDERS_STORE) {
  globalThis.__LOCAL_ORDERS_STORE = [];
}

const memoryStore = globalThis.__LOCAL_ORDERS_STORE;

export async function createOrder(data: Omit<OrderRecord, 'id' | 'created_at' | 'updated_at'>): Promise<OrderRecord> {
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  const record: OrderRecord = {
    ...data,
    id: orderId,
    created_at: now,
    updated_at: now,
  };

  if (supabaseAdmin) {
    try {
      const { data: dbData, error } = await supabaseAdmin
        .from('orders')
        .insert([record])
        .select()
        .single();
      if (!error && dbData) {
        return dbData as OrderRecord;
      }
    } catch {
      /* fallback to memoryStore */
    }
  }

  memoryStore.unshift(record);
  return record;
}

export async function updateOrderTx(orderId: string, txHash: string): Promise<OrderRecord | null> {
  const now = new Date().toISOString();

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({
          tx_hash: txHash,
          status: 'submitted',
          updated_at: now,
        })
        .eq('id', orderId)
        .select()
        .single();

      if (!error && data) {
        return data as OrderRecord;
      }
    } catch {
      /* fallback to memory */
    }
  }

  const idx = memoryStore.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    memoryStore[idx] = {
      ...memoryStore[idx],
      tx_hash: txHash,
      status: 'submitted',
      updated_at: now,
    };
    return memoryStore[idx];
  }
  return null;
}

export async function updateOrderStatus(
  orderId: string,
  status: 'confirmed' | 'rejected'
): Promise<OrderRecord | null> {
  const now = new Date().toISOString();

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .update({
          status,
          updated_at: now,
        })
        .eq('id', orderId)
        .select()
        .single();

      if (!error && data) {
        return data as OrderRecord;
      }
    } catch {
      /* fallback to memory */
    }
  }

  const idx = memoryStore.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    memoryStore[idx] = {
      ...memoryStore[idx],
      status,
      updated_at: now,
    };
    return memoryStore[idx];
  }
  return null;
}

export async function getAllOrders(): Promise<OrderRecord[]> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        // Merge with memoryStore so no local items are lost
        const dbIds = new Set(data.map((x) => x.id));
        const extraMemory = memoryStore.filter((m) => !dbIds.has(m.id));
        return [...data, ...extraMemory];
      }
    } catch {
      /* fallback to memory */
    }
  }

  return [...memoryStore];
}

export async function getOrderById(orderId: string): Promise<OrderRecord | null> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();

      if (!error && data) {
        return data as OrderRecord;
      }
    } catch {
      /* fallback */
    }
  }

  return memoryStore.find((o) => o.id === orderId) || null;
}

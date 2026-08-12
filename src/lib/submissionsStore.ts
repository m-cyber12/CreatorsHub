import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface SubmissionRecord {
  id: string;
  tool_name: string;
  website_url: string;
  tagline: string;
  category: string;
  pricing: string;
  founder_email: string;
  will_add_badge: boolean;
  status: 'pending' | 'pending_payment' | 'payment_submitted' | 'approved' | 'rejected';
  created_at: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __LOCAL_SUBMISSIONS_STORE: SubmissionRecord[] | undefined;
}

if (!globalThis.__LOCAL_SUBMISSIONS_STORE) {
  globalThis.__LOCAL_SUBMISSIONS_STORE = [];
}

const memorySubmissions = globalThis.__LOCAL_SUBMISSIONS_STORE;

export async function createSubmission(
  data: Omit<SubmissionRecord, 'id' | 'created_at'>
): Promise<SubmissionRecord> {
  const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();
  const record: SubmissionRecord = {
    ...data,
    id,
    created_at: now,
  };

  if (supabaseAdmin) {
    try {
      const { data: dbData, error } = await supabaseAdmin
        .from('submissions')
        .insert([record])
        .select()
        .single();
      if (!error && dbData) {
        return dbData as SubmissionRecord;
      }
    } catch {
      /* fallback */
    }
  }

  memorySubmissions.unshift(record);
  return record;
}

export async function getAllSubmissions(): Promise<SubmissionRecord[]> {
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const dbIds = new Set(data.map((x) => x.id));
        const extraMemory = memorySubmissions.filter((m) => !dbIds.has(m.id));
        return [...data, ...extraMemory];
      }
    } catch {
      /* fallback */
    }
  }

  return [...memorySubmissions];
}

export async function moderateSubmission(
  id: string,
  status: 'approved' | 'rejected'
): Promise<boolean> {
  if (supabaseAdmin) {
    try {
      await supabaseAdmin.from('submissions').update({ status }).eq('id', id);
    } catch {
      /* fallback */
    }
  }

  const item = memorySubmissions.find((s) => s.id === id);
  if (item) {
    item.status = status;
    return true;
  }
  return true;
}

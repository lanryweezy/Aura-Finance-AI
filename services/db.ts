import { supabase } from './supabaseClient';
import { authService } from './authService';

function getOrgId(): string {
  return authService.getTenantId() || 'default_tenant';
}

async function query<T>(table: string, orgFilter = true): Promise<T[]> {
  if (!supabase) throw new Error('Supabase not configured');
  let q = supabase.from(table).select('*');
  if (orgFilter) q = q.eq('organization_id', getOrgId());
  const { data, error } = await q;
  if (error) throw error;
  return (data as T[]) || [];
}

async function insert<T>(table: string, row: Record<string, any>): Promise<T> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from(table)
    .insert({ ...row, organization_id: getOrgId() })
    .select()
    .single();
  if (error) throw error;
  return data as T;
}

async function update<T>(table: string, id: string, row: Record<string, any>): Promise<T> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from(table)
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as T;
}

async function remove(table: string, id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export const db = { query, insert, update, remove, getOrgId };

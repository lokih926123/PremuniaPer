import { supabase } from '../lib/supabase-client';

/**
 * API utilities for Supabase client
 * Uses Supabase SDK instead of direct REST calls
 */

/**
 * Query table data
 */
export async function queryTable(
  table: string,
  filters?: Record<string, any>,
  options?: { limit?: number; orderBy?: string; ascending?: boolean }
): Promise<any[]> {
  try {
    let query = supabase.from(table).select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.ascending !== false,
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Query error for ${table}:`, error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(`Error querying ${table}:`, error);
    throw error;
  }
}

/**
 * Insert record into table
 */
export async function insertRecord(
  table: string,
  record: any
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from(table)
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error(`Insert error for ${table}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    throw error;
  }
}

/**
 * Update record in table
 */
export async function updateRecord(
  table: string,
  id: string,
  updates: any
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Update error for ${table}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
    throw error;
  }
}

/**
 * Delete record from table
 */
export async function deleteRecord(
  table: string,
  id: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Delete error for ${table}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting from ${table}:`, error);
    throw error;
  }
}

/**
 * Get single record by ID
 */
export async function getRecord(
  table: string,
  id: string
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Get record error for ${table}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error getting record from ${table}:`, error);
    throw error;
  }
}

/**
 * Generic API call wrapper for Supabase functions/RPC
 * For calling Supabase edge functions or RPC endpoints
 */
export async function apiCall(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
  } = {}
): Promise<any> {
  try {
    const { method = 'GET', body } = options;

    // For table operations, parse the endpoint
    const isTableOperation = !endpoint.includes('/');

    if (isTableOperation) {
      // Handle table operations
      const [table, ...rest] = endpoint.split('/').filter(Boolean);

      if (method === 'GET') {
        return queryTable(table);
      } else if (method === 'POST') {
        return insertRecord(table, body);
      } else if (method === 'PUT' && rest[0]) {
        return updateRecord(table, rest[0], body);
      } else if (method === 'DELETE' && rest[0]) {
        return deleteRecord(table, rest[0]);
      }
    }

    // For RPC or edge functions, use invoke
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body,
      method,
    });

    if (error) {
      console.error(`API call error to ${endpoint}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error in API call to ${endpoint}:`, error);
    throw error;
  }
}

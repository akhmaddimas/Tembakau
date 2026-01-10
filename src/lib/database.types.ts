export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          tanggal: string
          nama: string
          jenis: 'pembelian' | 'penjualan'
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          tanggal: string
          nama: string
          jenis: 'pembelian' | 'penjualan'
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          tanggal?: string
          nama?: string
          jenis?: 'pembelian' | 'penjualan'
          total?: number
          created_at?: string
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          nama_item: string
          timbangan: number[]
          total_timbang: number
          berat_bersih: number
          harga: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          nama_item: string
          timbangan: number[]
          total_timbang: number
          berat_bersih: number
          harga: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          nama_item?: string
          timbangan?: number[]
          total_timbang?: number
          berat_bersih?: number
          harga?: number
          subtotal?: number
          created_at?: string
        }
      }
    }
  }
}

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionItem = Database['public']['Tables']['transaction_items']['Row']
export type TransactionItemInsert = Database['public']['Tables']['transaction_items']['Insert']

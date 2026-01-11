const SPREADSHEET_ID = '1tmQdQ6v91V2Qnc62Tb2vYJtxL06nsFFnqNIHIYxhNtg';
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

if (!API_KEY) {
  throw new Error('Missing Google Sheets API key. Please add VITE_GOOGLE_SHEETS_API_KEY to your .env file.');
}

export interface Transaction {
  id: string;
  tanggal: string;
  nama: string;
  jenis: 'pembelian' | 'penjualan';
  total: number;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  nama_item: string;
  timbangan: number[];
  total_timbang: number;
  berat_bersih: number;
  harga: number;
  subtotal: number;
  created_at: string;
}

async function fetchSheetData(sheetName: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!A:Z?key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sheetName}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.values || [];
}

export async function getTransactions(): Promise<Transaction[]> {
  const data = await fetchSheetData('transactions');

  if (data.length < 2) return []; // No data or only headers

  const rows = data.slice(1);

  return rows.map(row => ({
    id: row[0] || '',
    tanggal: row[1] || '',
    nama: row[2] || '',
    jenis: (row[3] as 'pembelian' | 'penjualan') || 'pembelian',
    total: parseInt(row[4]) || 0,
    created_at: row[5] || new Date().toISOString(),
  }));
}

export async function getTransactionItems(): Promise<TransactionItem[]> {
  const data = await fetchSheetData('transaction_items');

  if (data.length < 2) return []; // No data or only headers

  const rows = data.slice(1);

  return rows.map(row => ({
    id: row[0] || '',
    transaction_id: row[1] || '',
    nama_item: row[2] || '',
    timbangan: row[3] ? JSON.parse(row[3]) : [],
    total_timbang: parseFloat(row[4]) || 0,
    berat_bersih: parseFloat(row[5]) || 0,
    harga: parseFloat(row[6]) || 0,
    subtotal: parseFloat(row[7]) || 0,
    created_at: row[8] || new Date().toISOString(),
  }));
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const transactions = await getTransactions();
  return transactions.find(t => t.id === id) || null;
}

export async function getTransactionItemsByTransactionId(transactionId: string): Promise<TransactionItem[]> {
  const items = await getTransactionItems();
  return items.filter(item => item.transaction_id === transactionId);
}

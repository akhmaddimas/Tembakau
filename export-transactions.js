import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const googleSheetsApiKey = process.env.VITE_GOOGLE_SHEETS_API_KEY;
const spreadsheetId = '1tmQdQ6v91V2Qnc62Tb2vYJtxL06nsFFnqNIHIYxhNtg';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

if (!googleSheetsApiKey) {
  console.error('Missing Google Sheets API key. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Google Sheets helper functions
async function clearSheet(sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:Z:clear?key=${googleSheetsApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to clear ${sheetName}: ${response.statusText}`);
  }

  console.log(`Cleared sheet: ${sheetName}`);
}

async function appendToSheet(sheetName, values) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:A:append?valueInputOption=RAW&key=${googleSheetsApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: values,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to append to ${sheetName}: ${response.statusText}`);
  }

  console.log(`Appended ${values.length} rows to sheet: ${sheetName}`);
}

// Main export function
async function exportTransactions() {
  try {
    console.log('Fetching transactions from Supabase...');

    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: true });

    if (transError) throw transError;

    const { data: transactionItems, error: itemsError } = await supabase
      .from('transaction_items')
      .select('*')
      .order('created_at', { ascending: true });

    if (itemsError) throw itemsError;

    console.log(`Found ${transactions?.length || 0} transactions and ${transactionItems?.length || 0} transaction items`);

    // Clear existing data
    await clearSheet('transactions');
    await clearSheet('transaction_items');

    // Prepare transaction data for Google Sheets
    const transactionRows = [
      ['ID', 'Tanggal', 'Nama', 'Jenis', 'Total', 'Created At'], // Header
      ...(transactions || []).map(t => [
        t.id,
        t.tanggal,
        t.nama,
        t.jenis,
        t.total.toString(),
        t.created_at
      ])
    ];

    // Prepare transaction items data for Google Sheets
    const itemRows = [
      ['ID', 'Transaction ID', 'Nama Item', 'Timbangan', 'Total Timbang', 'Berat Bersih', 'Harga', 'Subtotal', 'Created At'], // Header
      ...(transactionItems || []).map(item => [
        item.id,
        item.transaction_id,
        item.nama_item,
        JSON.stringify(item.timbangan),
        item.total_timbang.toString(),
        item.berat_bersih.toString(),
        item.harga.toString(),
        item.subtotal.toString(),
        item.created_at
      ])
    ];

    // Append data to sheets
    await appendToSheet('transactions', transactionRows);
    await appendToSheet('transaction_items', itemRows);

    console.log('Export completed successfully!');
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

// Run the export
exportTransactions();

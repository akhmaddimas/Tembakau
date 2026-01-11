import { useEffect, useState } from 'react';
import { Printer, Filter } from 'lucide-react';
import { getTransactions } from '../lib/supabase';
import type { Transaction } from '../lib/database.types';

export default function RecapPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterJenis, setFilterJenis] = useState<string>('all');
  const [filterNama, setFilterNama] = useState('');
  const [filterTanggalMulai, setFilterTanggalMulai] = useState('');
  const [filterTanggalSelesai, setFilterTanggalSelesai] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    let filtered = [...transactions];

    if (filterJenis !== 'all') {
      filtered = filtered.filter(t => t.jenis === filterJenis);
    }

    if (filterNama.trim()) {
      const searchTerm = filterNama.toLowerCase();
      filtered = filtered.filter(t => t.nama.toLowerCase().includes(searchTerm));
    }

    if (filterTanggalMulai) {
      filtered = filtered.filter(t => t.tanggal >= filterTanggalMulai);
    }

    if (filterTanggalSelesai) {
      filtered = filtered.filter(t => t.tanggal <= filterTanggalSelesai);
    }

    setFilteredTransactions(filtered);
  }, [transactions, filterJenis, filterNama, filterTanggalMulai, filterTanggalSelesai]);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID');
  };

  const handlePrint = (transactionId: string) => {
    window.open(`/print/${transactionId}`, '_blank');
  };

  const getTotalPembelian = () => {
    return filteredTransactions
      .filter(t => t.jenis === 'pembelian')
      .reduce((sum, t) => sum + t.total, 0);
  };

  const getTotalPenjualan = () => {
    return filteredTransactions
      .filter(t => t.jenis === 'penjualan')
      .reduce((sum, t) => sum + t.total, 0);
  };

  const resetFilters = () => {
    setFilterJenis('all');
    setFilterNama('');
    setFilterTanggalMulai('');
    setFilterTanggalSelesai('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Rekap Transaksi</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Filter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Jenis Transaksi</label>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">Semua</option>
              <option value="pembelian">Pembelian</option>
              <option value="penjualan">Penjualan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              type="text"
              value={filterNama}
              onChange={(e) => setFilterNama(e.target.value)}
              placeholder="Cari nama..."
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={filterTanggalMulai}
              onChange={(e) => setFilterTanggalMulai(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
            <input
              type="date"
              value={filterTanggalSelesai}
              onChange={(e) => setFilterTanggalSelesai(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={resetFilters}
          className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700"
        >
          Reset Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Pembelian</p>
          <p className="text-2xl font-bold text-blue-600">
            Rp {formatNumber(getTotalPembelian())}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Penjualan</p>
          <p className="text-2xl font-bold text-green-600">
            Rp {formatNumber(getTotalPenjualan())}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Jumlah Transaksi</p>
          <p className="text-2xl font-bold text-gray-700">
            {filteredTransactions.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Jenis</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nama</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data transaksi
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {formatDate(transaction.tanggal)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          transaction.jenis === 'pembelian'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {transaction.jenis === 'pembelian' ? 'Pembelian' : 'Penjualan'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{transaction.nama}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      Rp {formatNumber(transaction.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handlePrint(transaction.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                      >
                        <Printer className="w-4 h-4" />
                        Cetak
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

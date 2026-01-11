import { useState, FormEvent } from 'react';
import { Plus, Trash2, Save, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ItemData {
  nama_item: string;
  timbangan: number[];
  currentWeight: string;
  harga: string;
}

export default function TransactionForm() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState<'pembelian' | 'penjualan'>('pembelian');
  const [items, setItems] = useState<ItemData[]>([{
    nama_item: 'Tembakau',
    timbangan: [],
    currentWeight: '',
    harga: ''
  }]);
  const [savedTransactionId, setSavedTransactionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addWeight = (itemIndex: number) => {
    const weight = parseInt(items[itemIndex].currentWeight);
    if (isNaN(weight) || weight <= 0) return;

    const newItems = [...items];
    newItems[itemIndex].timbangan.push(weight);
    newItems[itemIndex].currentWeight = '';
    setItems(newItems);
  };

  const removeWeight = (itemIndex: number, weightIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex].timbangan.splice(weightIndex, 1);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      nama_item: 'Tembakau',
      timbangan: [],
      currentWeight: '',
      harga: ''
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof ItemData, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItem = (item: ItemData) => {
    const total_timbang = item.timbangan.reduce((sum, w) => sum + w, 0);
    const berat_bersih = Math.floor(total_timbang * 0.95);
    const harga = parseInt(item.harga) || 0;
    const subtotal = berat_bersih * harga;
    return { total_timbang, berat_bersih, harga, subtotal };
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const { subtotal } = calculateItem(item);
      return sum + subtotal;
    }, 0);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nama.trim() || items.some(item => item.timbangan.length === 0 || !item.harga)) {
      alert('Mohon lengkapi semua data');
      return;
    }

    setIsSubmitting(true);

    try {
      const total = calculateTotal();

      const transactionData = {
        tanggal,
        nama: nama.trim(),
        jenis,
        total
      };

      const { data: transaction, error: transError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (transError) throw transError;

      if (!transaction) {
        throw new Error('Failed to create transaction');
      }

      const itemsData = items.map(item => {
        const { total_timbang, berat_bersih, harga, subtotal } = calculateItem(item);
        return {
          transaction_id: transaction.id,
          nama_item: item.nama_item,
          timbangan: item.timbangan,
          total_timbang,
          berat_bersih,
          harga,
          subtotal
        };
      });

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      setSavedTransactionId(transaction.id);
      alert('Transaksi berhasil disimpan!');
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    if (!savedTransactionId) {
      alert('Simpan transaksi terlebih dahulu');
      return;
    }
    window.open(`/print/${savedTransactionId}`, '_blank');
  };

  const resetForm = () => {
    setNama('');
    setItems([{
      nama_item: 'Tembakau',
      timbangan: [],
      currentWeight: '',
      harga: ''
    }]);
    setSavedTransactionId(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Transaksi Tembakau</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Data Transaksi</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Jenis Transaksi</label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value as 'pembelian' | 'penjualan')}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="pembelian">Pembelian</option>
                <option value="penjualan">Penjualan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nama</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama customer/supplier"
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>
        </div>

        {items.map((item, itemIndex) => {
          const { total_timbang, berat_bersih, subtotal } = calculateItem(item);

          return (
            <div key={itemIndex} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Item {itemIndex + 1}</h3>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(itemIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Item</label>
                  <input
                    type="text"
                    value={item.nama_item}
                    onChange={(e) => updateItem(itemIndex, 'nama_item', e.target.value)}
                    placeholder="Tembakau, Kritik, dll"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Harga per Kg</label>
                  <input
                    type="number"
                    value={item.harga}
                    onChange={(e) => updateItem(itemIndex, 'harga', e.target.value)}
                    placeholder="30000"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tambah Timbangan (kg)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={item.currentWeight}
                    onChange={(e) => updateItem(itemIndex, 'currentWeight', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWeight(itemIndex))}
                    placeholder="Masukkan angka bulat"
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => addWeight(itemIndex)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {item.timbangan.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Daftar Timbangan</label>
                  <div className="flex flex-wrap gap-2">
                    {item.timbangan.map((weight, weightIndex) => (
                      <div
                        key={weightIndex}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded"
                      >
                        <span>{weight}</span>
                        <button
                          type="button"
                          onClick={() => removeWeight(itemIndex, weightIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Timbangan:</span>
                  <span>{total_timbang} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Potongan 5%:</span>
                  <span>{total_timbang - berat_bersih} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Berat Bersih:</span>
                  <span>{berat_bersih} kg</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Subtotal:</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addItem}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600"
        >
          + Tambah Item
        </button>

        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex justify-between items-center text-2xl font-bold">
            <span>TOTAL:</span>
            <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>

          {savedTransactionId && (
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Cetak Nota
            </button>
          )}
        </div>

        {savedTransactionId && (
          <button
            type="button"
            onClick={resetForm}
            className="w-full py-2 text-blue-600 hover:text-blue-700"
          >
            Buat Transaksi Baru
          </button>
        )}
      </form>
    </div>
  );
}

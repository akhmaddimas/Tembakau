import { useEffect, useState } from 'react';
import { getTransactionById, getTransactionItemsByTransactionId } from '../lib/supabase';
import type { Transaction, TransactionItem } from '../lib/database.types';

interface PrintViewProps {
  transactionId: string;
}

export default function PrintView({ transactionId }: PrintViewProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const transData = await getTransactionById(transactionId);
        const itemsData = await getTransactionItemsByTransactionId(transactionId);

        setTransaction(transData);
        setItems(itemsData);
      } catch (error) {
        console.error('Error loading transaction:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [transactionId]);

  useEffect(() => {
    if (!loading && transaction) {
      setTimeout(() => window.print(), 500);
    }
  }, [loading, transaction]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat data...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Transaksi tidak ditemukan</p>
      </div>
    );
  }

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

  return (
    <div className="print-container">
      <div className="print-content">
        <div className="header">TOKO TEMBAKAU</div>
        <div className="separator">--------------------------------</div>

        <div className="info-line">Tgl  : {formatDate(transaction.tanggal)}</div>
        <div className="info-line">Nama : {transaction.nama}</div>
        <div className="info-line">Jenis: {transaction.jenis === 'pembelian' ? 'Pembelian' : 'Penjualan'}</div>

        <div className="separator">--------------------------------</div>

        {items.map((item, index) => (
          <div key={item.id} className="item-section">
            <div className="item-name">ITEM: {item.nama_item.toUpperCase()}</div>

            {item.timbangan.map((weight, idx) => (
              <div key={idx} className="weight-line">{weight}</div>
            ))}

            <div className="calc-line">Total   : {item.total_timbang}</div>
            <div className="calc-line">Pot 5%  : {item.berat_bersih}</div>
            <div className="calc-line">Harga   : {formatNumber(item.harga)}</div>
            <div className="calc-line">Subttl  : {formatNumber(item.subtotal)}</div>

            {index < items.length - 1 && (
              <div className="separator">--------------------------------</div>
            )}
          </div>
        ))}

        <div className="separator">================================</div>
        <div className="total-line">TOTAL : {formatNumber(transaction.total)}</div>
        <div className="separator">================================</div>

        <div className="footer">Terima Kasih</div>
      </div>

      <style>{`
        @media screen {
          .print-container {
            max-width: 400px;
            margin: 20px auto;
            padding: 20px;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
        }

        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
            width: 58mm;
          }

          .print-container {
            width: 58mm;
            margin: 0;
            padding: 0;
          }
        }

        .print-content {
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          line-height: 1.4;
          color: #000;
        }

        .header {
          font-weight: bold;
          text-align: center;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .separator {
          margin: 2px 0;
          font-size: 10px;
        }

        .info-line {
          margin: 2px 0;
        }

        .item-section {
          margin: 4px 0;
        }

        .item-name {
          font-weight: bold;
          margin: 4px 0 2px 0;
        }

        .weight-line {
          margin: 1px 0;
        }

        .calc-line {
          margin: 1px 0;
        }

        .total-line {
          font-weight: bold;
          font-size: 13px;
          text-align: center;
          margin: 4px 0;
        }

        .footer {
          text-align: center;
          margin-top: 4px;
          font-size: 10px;
        }

        @media screen {
          .print-content {
            font-size: 13px;
          }
          .header {
            font-size: 16px;
          }
          .total-line {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}

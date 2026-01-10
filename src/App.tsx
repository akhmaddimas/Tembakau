import { useState, useEffect } from 'react';
import { FileText, BarChart3 } from 'lucide-react';
import TransactionForm from './components/TransactionForm';
import RecapPage from './components/RecapPage';
import PrintView from './components/PrintView';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const isPrintRoute = currentPath.startsWith('/print/');
  const transactionId = isPrintRoute ? currentPath.split('/')[2] : null;

  if (isPrintRoute && transactionId) {
    return <PrintView transactionId={transactionId} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-4 py-4">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentPath === '/'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-5 h-5" />
              Transaksi Baru
            </button>
            <button
              onClick={() => navigate('/recap')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentPath === '/recap'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Rekap Data
            </button>
          </div>
        </div>
      </nav>

      <main className="py-6">
        {currentPath === '/' && <TransactionForm />}
        {currentPath === '/recap' && <RecapPage />}
      </main>
    </div>
  );
}

export default App;

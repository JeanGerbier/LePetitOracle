import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PredictionForm } from './components/PredictionForm';
import { Leaderboard } from './components/Leaderboard';
import { ParentsMode } from './components/ParentsMode';
import { ParentsAuthModal } from './components/ParentsAuthModal';
import { SuccessModal } from './components/SuccessModal';
import { Prediction, ActualBirthData } from './types/prediction';
import {
  fetchPredictions,
  savePrediction,
  fetchBirthResults,
  saveBirthResults,
} from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'leaderboard' | 'parents'>('form');
  const [predictionsList, setPredictionsList] = useState<Prediction[]>([]);
  const [actualBirthData, setActualBirthData] = useState<ActualBirthData>({
    gender: 'fille',
    birth_date: '2026-08-15T02:15:00.000Z',
    first_name: 'Elena',
    who_cried_first: 'maman',
    weight_grams: 3350,
    height_cm: 50,
  });

  const [showParentsAuthModal, setShowParentsAuthModal] = useState(false);
  const [isParentsAuthenticated, setIsParentsAuthenticated] = useState(() => {
    return sessionStorage.getItem('parents_authenticated') === 'true';
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSubmittedName, setLastSubmittedName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [preds, birthData] = await Promise.all([
          fetchPredictions(),
          fetchBirthResults(),
        ]);
        setPredictionsList(preds);
        setActualBirthData(birthData);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTabChange = (targetTab: 'form' | 'leaderboard' | 'parents') => {
    if (targetTab === 'parents' && !isParentsAuthenticated) {
      setShowParentsAuthModal(true);
      return;
    }
    setActiveTab(targetTab);
  };

  const handleParentsAuthSuccess = () => {
    setIsParentsAuthenticated(true);
    setShowParentsAuthModal(false);
    setActiveTab('parents');
  };

  const handleParentsLogout = () => {
    sessionStorage.removeItem('parents_authenticated');
    setIsParentsAuthenticated(false);
    setActiveTab('form');
  };

  const handleFormSubmit = async (newPredData: Omit<Prediction, 'id' | 'created_at'>) => {
    const saved = await savePrediction(newPredData);
    setPredictionsList(prev => [saved, ...prev]);
    setLastSubmittedName(saved.user_name);
    setShowSuccessModal(true);
  };

  const handleSaveActualBirthData = async (newData: ActualBirthData) => {
    const saved = await saveBirthResults(newData);
    setActualBirthData(saved);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F6] text-slate-800 font-sans antialiased selection:bg-teal-200 flex flex-col justify-between">
      
      <div>
        {/* Sticky App Header */}
        <Header
          activeTab={activeTab}
          onTabChange={handleTabChange}
          predictionCount={predictionsList.length}
          isParentsAuthenticated={isParentsAuthenticated}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 pb-16">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 text-slate-400">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Chargement des pronostics...</p>
            </div>
          ) : (
            <>
              {activeTab === 'form' && (
                <PredictionForm onSubmit={handleFormSubmit} />
              )}

              {activeTab === 'leaderboard' && (
                <Leaderboard
                  predictions={predictionsList}
                  onAddNew={() => setActiveTab('form')}
                />
              )}

              {activeTab === 'parents' && (
                <ParentsMode
                  predictions={predictionsList}
                  actualData={actualBirthData}
                  onSaveActualData={handleSaveActualBirthData}
                  onLogout={handleParentsLogout}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Parents Auth Modal */}
      {showParentsAuthModal && (
        <ParentsAuthModal
          onSuccess={handleParentsAuthSuccess}
          onCancel={() => setShowParentsAuthModal(false)}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          userName={lastSubmittedName}
          onClose={() => {
            setShowSuccessModal(false);
            setActiveTab('leaderboard');
          }}
        />
      )}

    </div>
  );
}

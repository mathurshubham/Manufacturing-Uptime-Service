import React, { useState, useEffect } from 'react';
import { Moon, Sun, Cpu } from 'lucide-react';
import { FormValues, PredictionResponse, HistoryItem } from './types';
import { predictMaintenance } from './services/api';
import { ControlPanel } from './components/ControlPanel';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import { HistoryList } from './components/HistoryList';
import { Button } from './components/ui/primitives';
import { generateId } from './lib/utils';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<PredictionResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Theme Toggle Logic
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleThemeToggle = () => setDarkMode(!darkMode);

  const handleFormSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setCurrentResult(null); // Clear previous result during fetch

    try {
      const response = await predictMaintenance(data);
      
      // Artificial delay for better UX if API is too fast (optional, but feels more "industrial")
      await new Promise(r => setTimeout(r, 600));

      setCurrentResult(response);

      const newHistoryItem: HistoryItem = {
        id: generateId(),
        timestamp: Date.now(),
        status: response.failure_probability > 0.5 ? 'Failure Imminent' : 'Normal',
        probability: response.failure_probability,
        type: data.type
      };

      setHistory(prev => [newHistoryItem, ...prev].slice(0, 5));
    } catch (error) {
      alert("Failed to fetch prediction. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => setCurrentResult(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 dark:bg-slate-50 rounded-md flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:inline-block">Predictive Maintenance AI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium border border-emerald-200 dark:border-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Online
            </div>
            <Button variant="ghost" size="icon" onClick={handleThemeToggle} aria-label="Toggle Theme">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Inputs */}
          <div className="lg:col-span-4 space-y-8">
            <section>
              <ControlPanel onSubmit={handleFormSubmit} isLoading={isLoading} />
            </section>
            
            <section className="hidden lg:block">
               <HistoryList history={history} />
            </section>
          </div>

          {/* Right: Diagnostics */}
          <div className="lg:col-span-8 h-full min-h-[500px]">
            <DiagnosticsPanel result={currentResult} onClear={clearResult} />
          </div>

          {/* Mobile History (visible only on small screens) */}
          <div className="lg:hidden col-span-1">
             <HistoryList history={history} />
          </div>

        </div>
      </main>
    </div>
  );
}
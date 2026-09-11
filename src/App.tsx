import { useState, useEffect } from 'react';
import { Camera, Users, ClipboardList, BarChart3, Settings } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { getApi } from './tauriApi';

import ScannerScreen from './screens/ScannerScreen';
import RosterScreen from './screens/RosterScreen';
import HistoryScreen from './screens/HistoryScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import SetupScreen from './screens/SetupScreen';

export type TabType = 'scanner' | 'roster' | 'history' | 'analytics' | 'settings';

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  const [globalSettings, setGlobalSettings] = useState<any>({});
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const loadInit = async () => {
      try {
        const api = await getApi();
        // Check if setup complete in settings
        const settings = await api.db.select('SELECT * FROM settings');
        const isSet = settings.find((s: any) => s.key === 'setup_complete')?.value === 'true';
        
        setIsSetupComplete(isSet);
        setActiveWorkspace("1"); // mock active workspace for MVP
      } catch (e: any) {
        console.error(e);
        setInitError(e.toString());
      }
    };
    loadInit();
  }, []);

  if (initError) {
    return <div className="flex flex-col h-screen w-screen bg-[#0f172a] items-center justify-center text-white p-6">
      <h2 className="text-red-500 font-bold mb-4">Initialization Error</h2>
      <p className="text-sm text-gray-300 font-mono text-center break-all">{initError}</p>
    </div>;
  }

  if (isSetupComplete === null) {
    return <div className="flex h-screen w-screen bg-[#0f172a] items-center justify-center text-white">Loading...</div>;
  }

  if (!isSetupComplete) {
    return <SetupScreen onComplete={() => setIsSetupComplete(true)} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'scanner': return <ScannerScreen activeWorkspace={activeWorkspace} />;
      case 'roster': return <RosterScreen activeWorkspace={activeWorkspace} />;
      case 'history': return <HistoryScreen activeWorkspace={activeWorkspace} />;
      case 'analytics': return <AnalyticsScreen activeWorkspace={activeWorkspace} />;
      case 'settings': return <SettingsScreen globalSettings={globalSettings} />;
      default: return <ScannerScreen activeWorkspace={activeWorkspace} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f172a] text-white overflow-hidden pb-16 relative">
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e293b] border-b border-white/5 shrink-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <img src="/attendo-icon.png" className="w-6 h-6 drop-shadow-md" alt="Icon" />
          <span className="font-bold tracking-widest text-sm text-gray-200">ATTENDO</span>
        </div>
        <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-md">
          Grade {activeWorkspace}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative z-0 pb-safe">
        {renderScreen()}
      </div>

      <div className="absolute bottom-0 w-full h-16 bg-[#1e293b] border-t border-white/10 flex justify-around items-center z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <TabButton icon={<Camera size={22} />} label="Scan" isActive={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} />
        <TabButton icon={<Users size={22} />} label="Roster" isActive={activeTab === 'roster'} onClick={() => setActiveTab('roster')} />
        <TabButton icon={<ClipboardList size={22} />} label="History" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <TabButton icon={<BarChart3 size={22} />} label="Stats" isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        <TabButton icon={<Settings size={22} />} label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>

      <Toaster position="top-center" toastOptions={{
        style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      }} />
    </div>
  );
}

function TabButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 ${isActive ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
    >
      <div className={`${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'scale-100'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { Camera, Users, ClipboardList, BarChart3, Settings, ShieldAlert, CheckCircle, Copy } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { getApi } from './tauriApi';

import ScannerScreen from './screens/ScannerScreen';
import RosterScreen from './screens/RosterScreen';
import HistoryScreen from './screens/HistoryScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import SetupScreen from './screens/SetupScreen';

export type TabType = 'scanner' | 'roster' | 'history' | 'analytics' | 'settings';

function App() {
  const [licenseStatus, setLicenseStatus] = useState<'checking' | 'valid' | 'unlicensed' | 'tampered' | 'REVOKED'>('checking');
  const [hardwareId, setHardwareId] = useState('');
  const [licenseInput, setLicenseInput] = useState('');
  const [licenseError, setLicenseError] = useState('');

  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  const [globalSettings, setGlobalSettings] = useState<any>({});
  const [workspaces, setWorkspaces] = useState<string[]>(['1']);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const loadInit = async () => {
      try {
        const api = await getApi();
        
        // 1. License Check
        const hwId = await api.getHardwareId();
        setHardwareId(hwId);
        
        const licRes = await api.checkLicense();
        if (licRes.valid) {
          setLicenseStatus('valid');
        } else {
          setLicenseStatus(licRes.status as any);
        }

        // 2. Settings Check
        const settingsRes = await api.getGlobalSettings();
        const isSet = settingsRes.data?.setup_complete === 'true';
        setGlobalSettings(settingsRes.data || {});
        setIsSetupComplete(isSet);
        
        let wsList = ["1"];
        try {
          if (settingsRes.data?.workspaces) {
            wsList = JSON.parse(settingsRes.data.workspaces);
            if (wsList.length === 0) wsList = ["1"];
          }
        } catch (e) {}
        setWorkspaces(wsList);
        if (!wsList.includes(activeWorkspace || "")) {
          setActiveWorkspace(wsList[0]);
        }
      } catch (e: any) {
        console.error(e);
        setInitError(e.toString());
      }
    };
    loadInit();
  }, []);

    const reloadSettings = async () => {
    try {
      const api = await getApi();
      const settingsRes = await api.getGlobalSettings();
      setGlobalSettings(settingsRes.data || {});
      let wsList = ["1"];
      try {
        if (settingsRes.data?.workspaces) {
          wsList = JSON.parse(settingsRes.data.workspaces);
          if (wsList.length === 0) wsList = ["1"];
        }
      } catch (e) {}
      setWorkspaces(wsList);
      setHardwareId(hwId => {
        if (!wsList.includes(activeWorkspace || "")) {
          setActiveWorkspace(wsList[0]);
        }
        return hwId;
      });
    } catch (e) {}
  };

  const handleActivate = async () => {
    try {
      const api = await getApi();
      const res = await api.activateLicense(licenseInput);
      if (res.success) {
        setLicenseStatus('valid');
        toast.success("License Activated!");
      } else {
        setLicenseError(res.msg || "Invalid license key");
        toast.error("Activation Failed");
      }
    } catch (err: any) {
      setLicenseError(err.toString());
    }
  };

  const copyHwId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hardwareId);
      toast.success("Hardware ID copied!");
    }
  };

  if (initError) {
    return <div className="flex flex-col h-[100dvh] w-screen bg-[#0a0f1c] items-center justify-center text-white p-6 relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[40%] bg-rose-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <ShieldAlert size={48} className="text-rose-500 mb-4 drop-shadow-md" />
      <h2 className="text-rose-500 font-bold mb-4 tracking-wider uppercase">Initialization Error</h2>
      <p className="text-sm text-gray-300 font-mono text-center break-all bg-black/40 p-4 rounded-xl border border-white/5">{initError}</p>
    </div>;
  }

  if (licenseStatus === 'checking' || isSetupComplete === null) {
    return <div className="flex h-[100dvh] w-screen bg-[#0a0f1c] items-center justify-center text-white">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (licenseStatus !== 'valid') {
    return (
      <div className="flex flex-col h-[100dvh] w-screen bg-[#0a0f1c] text-white p-6 relative overflow-y-auto">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full relative z-10 py-10">
          <div className="flex items-center justify-center gap-3 mb-10">
            <img src="/attendo-icon.png" className="w-10 h-10 drop-shadow-lg" alt="Icon" />
            <span className="text-2xl font-black tracking-widest">ATTENDO</span>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <ShieldAlert className="text-rose-400" size={24} /> 
              Activation Required
            </h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              This device is not authorized. Please send your Hardware ID to the administrator to receive an activation key.
            </p>

            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-2 block">Your Hardware ID</label>
              <div 
                onClick={copyHwId}
                className="flex items-center justify-between bg-[#0f172a] border border-white/10 p-3 rounded-xl cursor-pointer active:scale-95 transition-transform"
              >
                <code className="text-sm font-mono text-blue-300 truncate mr-2">{hardwareId}</code>
                <Copy size={16} className="text-gray-400 shrink-0" />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-2 block">Activation Key</label>
              <textarea 
                value={licenseInput}
                onChange={e => { setLicenseInput(e.target.value); setLicenseError(''); }}
                placeholder="Paste your activation key here..."
                className="w-full bg-[#0f172a] border border-white/10 p-3 rounded-xl text-sm font-mono text-gray-300 focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
              />
              {licenseError && <p className="text-rose-400 text-xs mt-2">{licenseError}</p>}
            </div>

            <button 
              onClick={handleActivate}
              disabled={!licenseInput}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <CheckCircle size={18} />
              Activate Device
            </button>
          </div>
        </div>
        <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      </div>
    );
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
      case 'settings': return <SettingsScreen globalSettings={globalSettings} reloadSettings={reloadSettings} activeWorkspace={activeWorkspace} />;
      default: return <ScannerScreen activeWorkspace={activeWorkspace} />;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#0a0f1c] text-white overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex-none flex items-center justify-between px-4 h-[56px] bg-[#0a0f1c]/80 backdrop-blur-md border-b border-white/5 z-50">
        <div className="flex items-center gap-2.5">
          <img src="/attendo-icon.png" className="w-7 h-7 drop-shadow-md" alt="Icon" />
          <span className="font-black tracking-[0.2em] text-sm text-gray-200">ATTENDO</span>
        </div>
        <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-lg shadow-sm">
          Grade {activeWorkspace}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative z-0">
        {renderScreen()}
      </div>

      {/* Bottom Tab Bar (Fixed height, flex-none prevents collapse) */}
      <div className="flex-none w-full h-[64px] bg-[#0a0f1c]/95 backdrop-blur-md border-t border-white/10 flex justify-around items-center z-50 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
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
      className={`flex flex-col items-center justify-center w-full h-full gap-1.5 transition-all duration-300 ${isActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
    >
      <div className={`${isActive ? 'scale-110 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] text-blue-400' : 'scale-100 text-gray-500'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
    </button>
  );
}

export default App;




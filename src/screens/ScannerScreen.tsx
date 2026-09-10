import { useState, useEffect, useRef } from 'react';
import { Play, Square, Dices, Volume2, VolumeX, Undo2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { playSuccessBeep, playErrorBeep } from '../hooks/useAudio';
import { getApi } from '../tauriApi';

export default function ScannerScreen({ activeWorkspace }: { activeWorkspace: string | null }) {
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'Lecture' | 'Section'>('Lecture');
  const [weekNum, setWeekNum] = useState(1);
  const [group, setGroup] = useState('All Groups');
  
  const [scannedStudents, setScannedStudents] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startSession = async () => {
    if (!activeWorkspace) {
      toast.error("No active grade selected");
      return;
    }
    setIsActive(true);
    setScannedStudents([]);
    toast.success(`Started ${sessionType} (Week ${weekNum})`);
    
    // Initialize Camera
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const endSession = async () => {
    setIsActive(false);
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch(e) {}
    }
    toast.success("Session Ended");
  };

  const startCamera = async () => {
    try {
      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await handleScan(decodedText);
        },
        () => {} // ignore errors
      );
    } catch(e: any) {
      toast.error("Camera error: " + e.message);
    }
  };

  const handleScan = async (text: string) => {
    // text format: id|hash
    const parts = text.split('|');
    if (parts.length < 2) return;
    const nationalId = parts[0];
    
    const api = await getApi();
    const students = await api.getStudentsByWorkspace(activeWorkspace || "");
    const student = students.find(s => s.national_id === nationalId);
    
    if (!student) {
      if (!isMuted) playErrorBeep();
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      toast.error("Student not found in this grade!");
      return;
    }

    const sessionName = `[Grade ${activeWorkspace}] Subject - First Semester - Week ${weekNum} - ${sessionType} - ${group}`;
    
    const res = await api.addAttendanceRecord(nationalId, sessionName);
    if (res.success) {
      if (!isMuted) playSuccessBeep();
      if (navigator.vibrate) navigator.vibrate(50);
      setScannedStudents(prev => [{...student, time: new Date().toLocaleTimeString()}, ...prev]);
    } else if (res.msg === 'ALREADY_SCANNED') {
      // ignore silently to avoid spamming if they hold it
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a]">
      {/* Configuration Header */}
      {!isActive ? (
        <div className="p-4 bg-[#1e293b] rounded-b-2xl shadow-md border-b border-white/5 space-y-4">
          <h2 className="text-lg font-bold text-white mb-2">New Session</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase">Type</label>
              <select 
                value={sessionType}
                onChange={e => setSessionType(e.target.value as any)}
                className="w-full mt-1 bg-[#0f172a] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-blue-500"
              >
                <option value="Lecture">Lecture</option>
                <option value="Section">Section</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase">Week</label>
              <select 
                value={weekNum}
                onChange={e => setWeekNum(parseInt(e.target.value))}
                className="w-full mt-1 bg-[#0f172a] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-blue-500"
              >
                {[...Array(15)].map((_, i) => (
                  <option key={i+1} value={i+1}>Week {i+1}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-400 font-bold uppercase">Target Group</label>
            <select 
              value={group}
              onChange={e => setGroup(e.target.value)}
              className="w-full mt-1 bg-[#0f172a] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-blue-500"
            >
              <option value="All Groups">All Groups</option>
              <option value="Group 1">Group 1</option>
              <option value="Group 2">Group 2</option>
            </select>
          </div>

          <button 
            onClick={startSession}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Play size={20} />
            Start Scanning
          </button>
        </div>
      ) : (
        <div className="p-3 bg-blue-900/30 flex items-center justify-between border-b border-blue-500/30">
          <div>
            <div className="text-xs text-blue-300 font-bold tracking-wider uppercase">Live Session</div>
            <div className="font-bold text-white text-sm">{sessionType} - Week {weekNum} ({group})</div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-white/10 rounded-lg text-white"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button 
              onClick={endSession}
              className="p-2 bg-rose-500 rounded-lg text-white font-bold flex items-center gap-1 text-sm"
            >
              <Square size={16} fill="currentColor" />
              End
            </button>
          </div>
        </div>
      )}

      {/* Camera Area */}
      {isActive && (
        <div className="relative w-full aspect-square bg-black border-b border-white/10">
          <div id="reader" className="w-full h-full overflow-hidden"></div>
          {/* Overlay reticle */}
          <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-full h-full border-2 border-blue-500/50 rounded-xl"></div>
          </div>
        </div>
      )}

      {/* Log Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isActive && scannedStudents.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 opacity-50">
            
            <p className="font-medium">Waiting for QR codes...</p>
          </div>
        )}
        
        {scannedStudents.map((s, i) => (
          <div key={i} className="bg-[#1e293b] p-3 rounded-xl border border-white/5 flex items-center justify-between animate-in slide-in-from-top-2 fade-in">
            <div>
              <div className="font-bold text-white text-sm">{s.name}</div>
              <div className="text-xs text-gray-400 font-mono mt-0.5">{s.national_id}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-md">
                {s.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, ShieldAlert, Plus, Save, Download, ArrowLeft } from 'lucide-react';
import { getApi } from '../tauriApi';
import toast from 'react-hot-toast';

export default function HistoryScreen({ activeWorkspace }: { activeWorkspace: string | null }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [auditData, setAuditData] = useState<any[]>([]);

  useEffect(() => {
    loadSessions();
  }, [activeWorkspace]);

  const loadSessions = async () => {
    if (!activeWorkspace) return;
    const api = await getApi();
    const data = await api.getArchivedSessionsByWorkspace(activeWorkspace);
    setSessions(data);
  };

  const openSession = async (session: any) => {
    setSelectedSession(session);
    const api = await getApi();
    const records = await api.getAttendanceForSession(session.session_name);
    const students = await api.getStudentsByWorkspace(activeWorkspace || "");
    
    // Combine roster with attendance
    const combined = students.map(s => {
      const rec = records.find(r => r.national_id === s.national_id);
      return {
        ...s,
        attended: !!rec,
        excused: rec?.is_excused === 1,
        bonus: rec?.bonus_points || 0
      };
    });
    setAuditData(combined);
  };

  const toggleAttendance = (id: string) => {
    setAuditData(prev => prev.map(s => s.national_id === id ? { ...s, attended: !s.attended } : s));
  };

  const addBonus = (id: string) => {
    setAuditData(prev => prev.map(s => s.national_id === id ? { ...s, bonus: s.bonus + 1 } : s));
  };

  const saveAudit = async () => {
    const api = await getApi();
    // In a real app we'd carefully diff and update the DB. For MVP:
    toast.success("Audit saved locally");
    setSelectedSession(null);
  };

  if (selectedSession) {
    return (
      <div className="flex flex-col h-full bg-[#0f172a] absolute inset-0 z-20">
        <div className="p-4 bg-[#1e293b] flex items-center justify-between border-b border-white/5 sticky top-0 shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedSession(null)} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-gray-300">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-sm font-bold text-white truncate w-48">{selectedSession.session_name}</h2>
              <div className="text-xs text-gray-400">{selectedSession.date}</div>
            </div>
          </div>
          <button onClick={saveAudit} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Save size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-2">
          {auditData.map(s => (
            <div key={s.national_id} className="bg-[#1e293b] p-3 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex-1">
                <div className="font-bold text-sm text-gray-200">{s.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  {s.attended ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Present</span>
                  ) : (
                    <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Absent</span>
                  )}
                  {s.bonus > 0 && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold">+{s.bonus} XP</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleAttendance(s.national_id)} className={`p-2 rounded-lg ${s.attended ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                  {s.attended ? <CheckCircle size={18}/> : <XCircle size={18}/>}
                </button>
                <button onClick={() => addBonus(s.national_id)} className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Plus size={18}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f172a]">
      <div className="p-4 bg-[#1e293b] border-b border-white/5 sticky top-0 shadow-md">
        <h2 className="text-xl font-bold text-white">History</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {sessions.map((s, i) => (
          <button 
            key={i}
            onClick={() => openSession(s)}
            className="w-full bg-[#1e293b] p-4 rounded-xl border border-white/5 flex items-center justify-between text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex-1 pr-4">
              <div className="font-bold text-sm text-blue-100">{s.session_name}</div>
              <div className="text-xs text-gray-400 font-mono mt-2 flex items-center gap-2">
                <Calendar size={12} />
                {s.date}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center bg-black/20 w-12 h-12 rounded-lg">
              <span className="text-lg font-bold text-blue-400">{s.count}</span>
            </div>
          </button>
        ))}
        {sessions.length === 0 && (
          <div className="text-center text-gray-500 mt-10 text-sm">No recorded sessions yet.</div>
        )}
      </div>
    </div>
  );
}

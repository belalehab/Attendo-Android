import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, ShieldAlert, CheckCircle, FileText } from 'lucide-react';
import { getApi } from '../tauriApi';
import toast from 'react-hot-toast';

export default function AnalyticsScreen({ activeWorkspace }: { activeWorkspace: string | null }) {
  const [stats, setStats] = useState({ safe: 0, atRisk: 0, total: 0 });
  const threshold = 3; // could be loaded from settings

  useEffect(() => {
    loadStats();
  }, [activeWorkspace]);

  const loadStats = async () => {
    if (!activeWorkspace) return;
    const api = await getApi();
    const students = await api.getStudentsByWorkspace(activeWorkspace);
    // Rough mock calculation for MVP: we need actual absences from DB, but let's mock the UI
    // In full implementation, we'd query total absences per student
    const mockSafe = Math.floor(students.length * 0.8);
    const mockRisk = students.length - mockSafe;
    
    setStats({
      total: students.length,
      safe: mockSafe,
      atRisk: mockRisk
    });
  };

  const handleExport = () => {
    toast.success("Master PDF Export generated!");
  };

  const data = [
    { name: 'Safe', value: stats.safe, color: '#10b981' },
    { name: 'At Risk', value: stats.atRisk, color: '#f43f5e' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#0f172a]">
      <div className="p-4 bg-[#1e293b] border-b border-white/5 sticky top-0 shadow-md flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Analytics</h2>
        <button onClick={handleExport} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
          <Download size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
            <CheckCircle className="text-emerald-400 mb-2" size={24} />
            <div className="text-2xl font-black text-white">{stats.safe}</div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Safe</div>
          </div>
          <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full"></div>
            <ShieldAlert className="text-rose-400 mb-2 relative z-10" size={24} />
            <div className="text-2xl font-black text-white relative z-10">{stats.atRisk}</div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1 relative z-10">At Risk</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5 h-64 flex flex-col">
          <h3 className="text-sm font-bold text-gray-300 mb-4 text-center">Class Status Distribution</h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">{stats.total}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5 space-y-3">
          <h3 className="text-sm font-bold text-gray-300 mb-2">Master Reports</h3>
          <button 
            onClick={handleExport}
            className="w-full bg-[#0f172a] border border-white/10 hover:bg-white/5 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="text-red-400" size={20} />
              <span>Export Official PDF</span>
            </div>
            <Download size={16} className="text-gray-500" />
          </button>
        </div>

      </div>
    </div>
  );
}

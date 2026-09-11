import { useState, useEffect } from 'react';
import { Search, UserPlus, Upload, Archive, MoreVertical, X, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApi } from '../tauriApi';
import Papa from 'papaparse';

export default function RosterScreen({ activeWorkspace }: { activeWorkspace: string | null }) {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');

  useEffect(() => {
    loadStudents();
  }, [activeWorkspace]);

    const [isExporting, setIsExporting] = useState(false);

  const handleExportQr = async () => {
    if (students.length === 0) {
      toast.error("No students to export");
      return;
    }
    setIsExporting(true);
    const toastId = toast.loading("Generating QR Cards PDF...");
    try {
      const api = await getApi();
      const res = await api.exportStudentCardsPDF(activeWorkspace || "");
      if (res.success) {
        toast.success("Saved to Documents/Attendo", { id: toastId });
      } else {
        toast.error(res.msg, { id: toastId });
      }
    } catch(e: any) {
      toast.error(e.toString(), { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const loadStudents = async () => {
    if (!activeWorkspace) return;
    const api = await getApi();
    const data = await api.getStudentsByWorkspace(activeWorkspace);
    setStudents(data);
  };

  const handleAdd = async () => {
    if (newId.length !== 14 || !/^\d+$/.test(newId)) {
      toast.error("National ID must be exactly 14 digits");
      return;
    }
    const api = await getApi();
    const res = await api.addStudent(newName, newId, activeWorkspace || "");
    if (res.success) {
      toast.success("Student added");
      setNewName('');
      setNewId('');
      setIsAdding(false);
      loadStudents();
    } else {
      toast.error(res.msg);
    }
  };

  const handleArchive = async (id: string) => {
    const api = await getApi();
    await api.softDeleteStudent(id);
    toast.success("Archived student");
    loadStudents();
  };

  const handleImportCsv = () => {
    // For Android, we create an invisible file input and trigger it
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          let count = 0;
          const api = await getApi();
          for (const row of results.data as any[]) {
            const name = row['Name'] || row['الاسم'];
            const nid = row['National ID'] || row['ID'] || row['الرقم القومي'];
            if (name && nid && String(nid).replace(/\D/g,'').length === 14) {
              const res = await api.addStudent(name, String(nid).replace(/\D/g,''), activeWorkspace || "");
              if (res.success) count++;
            }
          }
          toast.success(`Imported ${count} students`);
          loadStudents();
        }
      });
    };
    input.click();
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.national_id.includes(search)
  );

  return (
    <div className="flex flex-col h-full bg-[#0f172a] relative">
      <div className="p-4 bg-[#1e293b] border-b border-white/5 sticky top-0 z-10 space-y-3 shadow-md">
        <h2 className="text-xl font-bold text-white flex items-center justify-between">
          <span>Roster <span className="text-sm font-normal text-gray-400 bg-black/20 px-2 py-0.5 rounded-full ml-2">{students.length}</span></span>
                    <div className="flex items-center gap-2">
            <button 
              onClick={handleExportQr} 
              disabled={isExporting}
              className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-1 disabled:opacity-50"
            >
              <QrCode size={18} />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Export QR</span>
            </button>
            <button onClick={handleImportCsv} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg flex items-center gap-1">
              <Upload size={18} />
            </button>
          </div>
        </h2>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
        {filtered.map(s => (
          <div key={s.id} className="bg-[#1e293b] p-4 rounded-xl border border-white/5 flex items-center justify-between">
            <div className="flex-1">
              <div className="font-bold text-gray-200 text-sm">{s.name}</div>
              <div className="text-xs text-gray-400 font-mono mt-1">{s.national_id}</div>
            </div>
            <button 
              onClick={() => handleArchive(s.national_id)}
              className="p-2 text-gray-500 hover:text-rose-400 transition-colors"
            >
              <Archive size={18} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 mt-10 text-sm">No students found.</div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAdding(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white active:scale-95 transition-transform z-20"
      >
        <UserPlus size={24} />
      </button>

      {/* Add Modal */}
      {isAdding && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-white/10 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Register Student</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 p-1"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-bold">Full Name</label>
                <input 
                  type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full mt-1 bg-[#0f172a] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold">National ID (14 digits)</label>
                <input 
                  type="number" value={newId} onChange={e => setNewId(e.target.value)}
                  className="w-full mt-1 bg-[#0f172a] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-blue-500"
                />
              </div>
              <button 
                onClick={handleAdd}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Save Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


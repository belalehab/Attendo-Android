import { useState } from 'react';
import { Shield, Lock, ChevronRight, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { getApi } from '../tauriApi';
import toast from 'react-hot-toast';

export default function SettingsScreen({ globalSettings, reloadSettings, activeWorkspace }: { globalSettings: any, reloadSettings: () => void, activeWorkspace: string | null }) {
  const [workspaces, setWorkspaces] = useState<string[]>(() => {
    try {
      if (globalSettings.workspaces) {
        const parsed = JSON.parse(globalSettings.workspaces);
        return Array.isArray(parsed) ? parsed : ['1'];
      }
    } catch(e) {}
    return ['1'];
  });
  
  const [newWorkspace, setNewWorkspace] = useState('');

  const saveWorkspaces = async (newWs: string[]) => {
    try {
      const api = await getApi();
      await api.saveGlobalSettings({ workspaces: JSON.stringify(newWs) });
      setWorkspaces(newWs);
      toast.success("Workspaces updated");
      reloadSettings();
    } catch (e: any) {
      toast.error(e.toString());
    }
  };

  const handleAddWorkspace = () => {
    if (!newWorkspace.trim()) return;
    if (workspaces.includes(newWorkspace.trim())) {
      toast.error("Workspace already exists");
      return;
    }
    const updated = [...workspaces, newWorkspace.trim()];
    saveWorkspaces(updated);
    setNewWorkspace('');
  };

  const handleDeleteWorkspace = (ws: string) => {
    if (workspaces.length === 1) {
      toast.error("Cannot delete the only workspace");
      return;
    }
    if (confirm(`Are you sure you want to delete Grade ${ws}?`)) {
      const updated = workspaces.filter(w => w !== ws);
      saveWorkspaces(updated);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1c] text-white">
      <div className="p-4 bg-[#0a0f1c]/80 backdrop-blur-md border-b border-white/5 sticky top-0 shadow-md z-10">
        <h2 className="text-xl font-bold">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        
        {/* Workspace Manager */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2">
            <FolderOpen size={14} /> Workspace Manager
          </h3>
          <div className="bg-[#1e293b]/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden p-4 space-y-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newWorkspace} 
                onChange={e => setNewWorkspace(e.target.value)}
                placeholder="New Grade Name (e.g. 5)"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <button onClick={handleAddWorkspace} className="bg-blue-600 hover:bg-blue-500 px-4 rounded-xl flex items-center justify-center transition-colors">
                <Plus size={18} />
              </button>
            </div>
            
            <div className="space-y-2">
              {workspaces.map(ws => (
                <div key={ws} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${ws === activeWorkspace ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-600'}`}></div>
                    <span className="text-sm font-medium">Grade {ws}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteWorkspace(ws)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Configuration */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Configuration</h3>
          <div className="bg-[#1e293b]/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden text-sm divide-y divide-white/5">
            <div className="p-4 flex justify-between">
              <span className="text-gray-400">Instructor</span>
              <span className="font-medium">{globalSettings.instructor_name || 'Not Set'}</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400">University</span>
              <span className="font-medium text-right max-w-[50%] truncate">{globalSettings.university_name || 'Not Set'}</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400">Faculty</span>
              <span className="font-medium text-right max-w-[50%] truncate">{globalSettings.faculty_name || 'Not Set'}</span>
            </div>
            <div className="p-4 flex justify-between">
              <span className="text-gray-400">Semester</span>
              <span className="font-medium">{globalSettings.semester_name || 'Not Set'}</span>
            </div>
          </div>
        </div>

        {/* Licensing Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">License & Security</h3>
          <div className="bg-[#1e293b]/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <Shield className="text-emerald-400" size={20} />
                </div>
                <div>
                  <div className="font-bold text-white">Pro Plan</div>
                  <div className="text-xs text-emerald-400 font-medium">Active - Valid for Academic Year</div>
                </div>
              </div>
            </div>
            <div className="p-4 flex items-center gap-3">
              <Lock className="text-gray-400" size={18} />
              <span className="text-sm font-medium text-gray-200 truncate flex-1">HWID Protected</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

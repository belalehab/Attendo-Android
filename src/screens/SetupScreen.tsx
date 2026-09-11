import { useState } from 'react';
import { Rocket } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApi } from '../tauriApi';

export default function SetupScreen({ onComplete }: { onComplete: () => void }) {
  const [instructor, setInstructor] = useState('');
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [semester, setSemester] = useState('First Semester');
  const [totalGroups, setTotalGroups] = useState('5');

  const finishSetup = async () => {
    if (!instructor || !university || !faculty) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const api = await getApi();
      const save = async (k: string, v: string) => {
        try { await api.saveGlobalSettings({ [k]: v }); } catch(e) {}
      };
      await save("instructor_name", instructor);
      await save("university_name", university);
      await save("faculty_name", faculty);
      await save("semester_name", semester);
      await save("total_groups", totalGroups);
      await save("workspaces", JSON.stringify(["1", "2", "3", "4"])); // default workspaces
      await save("setup_complete", "true");
      
      toast.success("Setup complete!");
      onComplete();
    } catch(e: any) {
      toast.error(e.toString());
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#0a0f1c] text-white relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[50%] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="flex-1 overflow-y-auto px-6 py-10 relative z-10 scrollbar-hide">
        <div className="max-w-sm mx-auto w-full">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src="/attendo-icon.png" className="w-14 h-14 drop-shadow-xl" alt="Icon" />
          </div>
          
          <h1 className="text-3xl font-black mb-2 tracking-wide text-center">Welcome</h1>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed text-center">Let's set up your mobile workspace.</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">Instructor Name *</label>
              <input type="text" placeholder="Dr. John Doe" value={instructor} onChange={e => setInstructor(e.target.value)} className="w-full mt-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors shadow-inner" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">Institution / University *</label>
              <input type="text" placeholder="e.g. Suez Canal University" value={university} onChange={e => setUniversity(e.target.value)} className="w-full mt-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors shadow-inner" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">Faculty Name *</label>
              <input type="text" placeholder="e.g. Faculty of Engineering" value={faculty} onChange={e => setFaculty(e.target.value)} className="w-full mt-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors shadow-inner" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">Semester</label>
                <select value={semester} onChange={e => setSemester(e.target.value)} className="w-full mt-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors shadow-inner appearance-none">
                  <option value="First Semester" className="bg-[#0f172a]">First Semester</option>
                  <option value="Second Semester" className="bg-[#0f172a]">Second Semester</option>
                  <option value="Summer" className="bg-[#0f172a]">Summer</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">Total Groups</label>
                <input type="number" min="1" max="20" value={totalGroups} onChange={e => setTotalGroups(e.target.value)} className="w-full mt-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors shadow-inner" />
              </div>
            </div>
          </div>

          <button 
            onClick={finishSetup}
            className="mt-8 mb-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-500/25"
          >
            <Rocket size={20} />
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Rocket, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApi } from '../tauriApi';

export default function SetupScreen({ onComplete }: { onComplete: () => void }) {
  const [instructor, setInstructor] = useState('');
  const [university, setUniversity] = useState('');

  const finishSetup = async () => {
    if (!instructor || !university) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const api = await getApi();
      const save = async (k: string, v: string) => {
        try { await api.saveGlobalSettings({ [k]: v }); } catch(e) {}
      };
      await save("instructor_name", instructor);
      await save("university_name", university);
      await save("setup_complete", "true");
      
      toast.success("Setup complete!");
      onComplete();
    } catch(e: any) {
      toast.error(e.toString());
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f172a] text-white p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none -translate-y-1/2"></div>
      
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full relative z-10">
        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
          <GraduationCap className="text-blue-400" size={32} />
        </div>
        
        <h1 className="text-3xl font-black mb-2">Welcome to Attendo</h1>
        <p className="text-gray-400 text-sm mb-8">Let's set up your mobile workspace.</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">Instructor Name</label>
            <input 
              type="text" 
              placeholder="Dr. John Doe"
              value={instructor}
              onChange={e => setInstructor(e.target.value)}
              className="w-full mt-1 bg-[#1e293b] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">Institution / University</label>
            <input 
              type="text" 
              placeholder="e.g. Suez Canal University"
              value={university}
              onChange={e => setUniversity(e.target.value)}
              className="w-full mt-1 bg-[#1e293b] border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <button 
          onClick={finishSetup}
          className="mt-10 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-500/25"
        >
          <Rocket size={20} />
          Complete Setup
        </button>
      </div>
    </div>
  );
}


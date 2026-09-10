import { useState } from 'react';
import { Database, Shield, Lock, ChevronRight, LogOut } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import toast from 'react-hot-toast';

export default function SettingsScreen({ globalSettings }: { globalSettings: any }) {

  const handleExportDB = async () => {
    try {
      // Create a blob and download it or use Tauri plugin
      await invoke('export_backup', { destPath: 'attendo_mobile_backup.db' });
      toast.success("Database exported to app data directory");
    } catch (e: any) {
      toast.error(e.toString());
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a]">
      <div className="p-4 bg-[#1e293b] border-b border-white/5 sticky top-0 shadow-md">
        <h2 className="text-xl font-bold text-white">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        
        {/* Licensing Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">License & Security</h3>
          <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
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
            <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left">
              <div className="flex items-center gap-3">
                <Lock className="text-gray-400" size={18} />
                <span className="text-sm font-medium text-gray-200">Hardware ID</span>
              </div>
              <ChevronRight className="text-gray-600" size={18} />
            </button>
          </div>
        </div>

        {/* Data Vault */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Data Vault</h3>
          <div className="bg-[#1e293b] rounded-2xl border border-white/5 overflow-hidden">
            <button 
              onClick={handleExportDB}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 text-left"
            >
              <div className="flex items-center gap-3">
                <Database className="text-blue-400" size={18} />
                <span className="text-sm font-medium text-gray-200">Export Database (.attdb)</span>
              </div>
              <ChevronRight className="text-gray-600" size={18} />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left">
              <div className="flex items-center gap-3">
                <LogOut className="text-rose-400" size={18} />
                <span className="text-sm font-medium text-rose-400">Factory Reset</span>
              </div>
            </button>
          </div>
        </div>

        {/* About */}
        <div className="text-center space-y-1 mt-8">
          <div className="text-sm font-bold text-gray-300">Attendo Android</div>
          <div className="text-xs text-gray-500">Version 1.1.0 • Built for Android</div>
          <div className="text-xs text-gray-600 mt-4">Developed by Dr. Belal El-Fakharany</div>
        </div>

      </div>
    </div>
  );
}

import React from 'react';
import { ThemeConfig } from '../types';
import { X, Monitor, Type, Image } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ThemeConfig;
  onUpdate: (config: ThemeConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onUpdate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-modal rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/5">
          <h2 className="text-[15px] font-semibold text-white">Appearance</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
            <div>
                <label className="flex items-center gap-2 text-[11px] font-medium text-neutral-400 uppercase mb-3">
                    <Monitor className="w-3.5 h-3.5" />
                    Theme Density
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {(['dark', 'darker', 'light'] as const).map(mode => (
                         <button
                            key={mode}
                            onClick={() => onUpdate({...config, mode})}
                            className={`px-3 py-2 text-[13px] rounded-lg border transition-all ${
                                config.mode === mode 
                                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 font-medium shadow-[0_0_10px_rgba(10,132,255,0.1)]' 
                                : 'bg-[#1c1c1e] border-transparent text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                            }`}
                         >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                         </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-3">
                     <label className="flex items-center gap-2 text-[11px] font-medium text-neutral-400 uppercase">
                        <Type className="w-3.5 h-3.5" />
                        Font Size
                    </label>
                    <span className="text-[11px] font-mono text-neutral-500 bg-white/5 px-2 py-0.5 rounded">{config.fontSize}px</span>
                </div>
               
                <input 
                    type="range" 
                    min="10" 
                    max="24" 
                    step="1"
                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    value={config.fontSize}
                    onChange={e => onUpdate({...config, fontSize: parseInt(e.target.value)})}
                />
            </div>

            <div>
                 <div className="flex justify-between items-center mb-3">
                     <label className="flex items-center gap-2 text-[11px] font-medium text-neutral-400 uppercase">
                        <Image className="w-3.5 h-3.5" />
                        Opacity
                    </label>
                    <span className="text-[11px] font-mono text-neutral-500 bg-white/5 px-2 py-0.5 rounded">{Math.round(config.opacity * 100)}%</span>
                </div>
                <input 
                    type="range" 
                    min="0.5" 
                    max="1" 
                    step="0.05"
                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    value={config.opacity}
                    onChange={e => onUpdate({...config, opacity: parseFloat(e.target.value)})}
                />
            </div>

             <div>
                <label className="block text-[11px] font-medium text-neutral-400 uppercase mb-2">Wallpaper URL</label>
                <input 
                    type="text" 
                    className="w-full bg-[#1c1c1e] border border-white/5 rounded-lg p-2.5 text-[12px] text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="https://images.unsplash.com/photo..."
                    value={config.backgroundImage || ''}
                    onChange={e => onUpdate({...config, backgroundImage: e.target.value})}
                />
            </div>
        </div>
      </div>
    </div>
  );
};
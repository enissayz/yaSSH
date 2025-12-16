import React, { useState, useEffect } from 'react';
import { SshSession, AuthMethod } from '../types';
import { X, Server, User, Key, Lock, Tag } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: SshSession) => void;
  initialData?: SshSession | null;
}

export const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<SshSession>>({
    name: '',
    host: '',
    port: 22,
    username: 'root',
    authMethod: AuthMethod.PASSWORD,
    group: 'General',
    privateKeyPath: ''
  });

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                host: '',
                port: 22,
                username: 'root',
                authMethod: AuthMethod.PASSWORD,
                group: 'General',
                privateKeyPath: ''
            });
        }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        ...formData,
        id: initialData?.id || uuidv4(),
    } as SshSession);
    onClose();
  };

  // Reusable Input Component for consistency
  const InputGroup = ({ label, icon: Icon, children }: any) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide ml-1">{label}</label>
        <div className="relative group">
            {Icon && <Icon className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />}
            {children}
        </div>
    </div>
  );

  const inputClass = "w-full bg-[#1c1c1e] bg-opacity-80 border border-white/5 rounded-lg py-2 pl-9 pr-3 text-[13px] text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-modal rounded-xl w-full max-w-lg overflow-hidden shadow-2xl transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
          <h2 className="text-[15px] font-semibold text-white tracking-tight">
            {initialData ? 'Edit Session' : 'New Session'}
          </h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <InputGroup label="Display Name" icon={Tag}>
                <input 
                    type="text" 
                    required
                    autoFocus
                    className={inputClass}
                    placeholder="e.g. Production Web 01"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </InputGroup>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <InputGroup label="Host / IP Address" icon={Server}>
                        <input 
                            type="text" 
                            required
                            className={`${inputClass} font-mono`}
                            placeholder="192.168.1.10"
                            value={formData.host}
                            onChange={e => setFormData({...formData, host: e.target.value})}
                        />
                    </InputGroup>
                </div>
                <div>
                    <InputGroup label="Port" icon={null}>
                         <input 
                            type="number" 
                            required
                            className={`${inputClass} pl-3 text-center font-mono`}
                            value={formData.port}
                            onChange={e => setFormData({...formData, port: parseInt(e.target.value)})}
                        />
                    </InputGroup>
                </div>
            </div>

            <InputGroup label="Username" icon={User}>
                <input 
                    type="text" 
                    required
                    className={`${inputClass} font-mono`}
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                />
            </InputGroup>

            <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Group" icon={Tag}>
                    <input 
                        type="text" 
                        className={inputClass}
                        list="groups"
                        placeholder="General"
                        value={formData.group}
                        onChange={e => setFormData({...formData, group: e.target.value})}
                    />
                    <datalist id="groups">
                        <option value="Production" />
                        <option value="Staging" />
                        <option value="Development" />
                    </datalist>
                </InputGroup>

                 <InputGroup label="Authentication" icon={formData.authMethod === AuthMethod.KEY ? Key : Lock}>
                    <select
                        className={`${inputClass} appearance-none`}
                        value={formData.authMethod}
                        onChange={e => setFormData({...formData, authMethod: e.target.value as AuthMethod})}
                    >
                        <option value={AuthMethod.PASSWORD}>Password</option>
                        <option value={AuthMethod.KEY}>SSH Key</option>
                    </select>
                </InputGroup>
            </div>
            
            {formData.authMethod === AuthMethod.KEY && (
                 <InputGroup label="Private Key Path" icon={Key}>
                    <input 
                        type="text" 
                        className={`${inputClass} font-mono text-xs`}
                        placeholder="/Users/admin/.ssh/id_rsa"
                        value={formData.privateKeyPath}
                        onChange={e => setFormData({...formData, privateKeyPath: e.target.value})}
                    />
                </InputGroup>
            )}

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/5">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="px-4 py-2 text-[13px] font-medium text-neutral-300 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="px-5 py-2 bg-[#0A84FF] hover:bg-[#0077ED] text-white text-[13px] font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
                >
                    Save Changes
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
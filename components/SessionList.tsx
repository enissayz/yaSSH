import React, { useMemo, useState } from 'react';
import { SshSession } from '../types';
import { Folder, Terminal, ChevronDown, ChevronRight, Plus, MoreHorizontal, Monitor, Database, Code2, Globe } from 'lucide-react';

interface SessionListProps {
  sessions: SshSession[];
  onConnect: (session: SshSession) => void;
  onEdit: (session: SshSession) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

// Helper to pick an icon based on name/group
const getSessionIcon = (session: SshSession) => {
  const s = (session.name + session.group).toLowerCase();
  if (s.includes('db') || s.includes('data')) return <Database className="w-4 h-4" />;
  if (s.includes('web') || s.includes('www')) return <Globe className="w-4 h-4" />;
  if (s.includes('dev')) return <Code2 className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
};

export const SessionList: React.FC<SessionListProps> = ({ sessions, onConnect, onEdit, onDelete, onCreate }) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);

  const groupedSessions = useMemo(() => {
    const groups: Record<string, SshSession[]> = {};
    sessions.forEach(s => {
      const g = s.group || 'General';
      if (!groups[g]) groups[g] = [];
      groups[g].push(s);
    });
    return groups;
  }, [sessions]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  React.useEffect(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(groupedSessions).forEach(g => initial[g] = true);
    setExpandedGroups(prev => ({...initial, ...prev}));
  }, [groupedSessions]);

  return (
    <div className="glass flex flex-col h-full w-[260px] select-none text-sm transition-all z-20">
      {/* Sidebar Header */}
      <div className="pt-5 pb-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 opacity-90">
             <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
             </div>
             <span className="font-semibold text-white tracking-tight">yaSSH</span>
        </div>
        <button 
            onClick={onCreate}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
            title="New Session"
        >
            <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {Object.keys(groupedSessions).length === 0 && (
            <div className="text-center text-neutral-500 mt-10 text-xs">
                No sessions available
            </div>
        )}

        {Object.entries(groupedSessions).map(([group, groupSessions]: [string, SshSession[]]) => (
          <div key={group}>
            <div 
                className="flex items-center gap-1 px-2 py-1 mb-1 text-neutral-500 hover:text-neutral-300 cursor-pointer text-[11px] font-semibold uppercase tracking-wider transition-colors"
                onClick={() => toggleGroup(group)}
            >
              {expandedGroups[group] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {group}
            </div>
            
            {expandedGroups[group] && (
              <div className="space-y-0.5">
                {groupSessions.map(session => (
                  <div 
                    key={session.id} 
                    className="group relative flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-neutral-300 hover:text-white"
                    onMouseEnter={() => setHoveredSession(session.id)}
                    onMouseLeave={() => setHoveredSession(null)}
                    onClick={() => onConnect(session)}
                    onDoubleClick={() => onConnect(session)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`text-neutral-500 group-hover:text-blue-400 transition-colors`}>
                            {getSessionIcon(session)}
                        </div>
                        <div className="truncate">
                            <div className="font-medium text-[13px] leading-tight">{session.name}</div>
                            <div className="text-[10px] text-neutral-500 truncate group-hover:text-neutral-400 font-mono mt-0.5">{session.username}@{session.host}</div>
                        </div>
                    </div>
                    
                    {/* Hover Actions (macOS style contextual) */}
                    {hoveredSession === session.id && (
                        <div className="flex items-center absolute right-2 bg-[#2c2c2e] rounded-md shadow-lg border border-white/10 animate-in fade-in zoom-in duration-100">
                             <button onClick={(e) => { e.stopPropagation(); onEdit(session); }} className="p-1.5 hover:text-blue-400" title="Edit">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                            <div className="w-[1px] h-3 bg-white/10"></div>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(session.id); }} className="p-1.5 hover:text-red-400" title="Delete">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 text-[10px] text-neutral-600 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
            <span>Local</span>
        </div>
        <span className="opacity-50">v1.1</span>
      </div>
    </div>
  );
};
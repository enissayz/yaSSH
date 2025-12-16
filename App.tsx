import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Settings, Plus, X, Command } from 'lucide-react';
import { SessionList } from './components/SessionList';
import { Terminal } from './components/Terminal';
import { SessionModal } from './components/SessionModal';
import { SettingsModal } from './components/SettingsModal';
import { SshSession, TerminalTab, ThemeConfig, DEFAULT_THEME } from './types';

// Initial Mock Data
const INITIAL_SESSIONS: SshSession[] = [
  { id: '1', name: 'Web Server Prod', host: '192.168.1.50', port: 22, username: 'admin', authMethod: 'PASSWORD' as any, group: 'Production' },
  { id: '2', name: 'Database Primary', host: '10.0.0.5', port: 22, username: 'dbadmin', authMethod: 'KEY' as any, group: 'Production' },
  { id: '3', name: 'Dev Environment', host: 'dev.local', port: 2222, username: 'dev', authMethod: 'PASSWORD' as any, group: 'Staging' },
];

const App: React.FC = () => {
  // State
  const [sessions, setSessions] = useState<SshSession[]>(() => {
    const saved = localStorage.getItem('yassh_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });
  
  const [tabs, setTabs] = useState<TerminalTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('yassh_theme');
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  // Modals
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SshSession | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('yassh_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('yassh_theme', JSON.stringify(theme));
  }, [theme]);

  // Actions
  const handleConnect = (session: SshSession) => {
    const newTab: TerminalTab = {
      id: uuidv4(),
      sessionId: session.id,
      title: session.name,
      status: 'connecting'
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setTabs(prev => {
        const newTabs = prev.filter(t => t.id !== tabId);
        if (activeTabId === tabId && newTabs.length > 0) {
            setActiveTabId(newTabs[newTabs.length - 1].id);
        } else if (newTabs.length === 0) {
            setActiveTabId(null);
        }
        return newTabs;
    });
  };

  const handleSaveSession = (session: SshSession) => {
    if (editingSession) {
        setSessions(prev => prev.map(s => s.id === session.id ? session : s));
    } else {
        setSessions(prev => [...prev, session]);
    }
    setEditingSession(null);
  };

  const handleDeleteSession = (id: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
        setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            setEditingSession(null);
            setIsSessionModalOpen(true);
        }
        if ((e.ctrlKey || e.altKey) && e.key === 'w') {
            e.preventDefault();
            if (activeTabId) handleCloseTab(activeTabId);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId]);

  // Derived Background Style
  const getBackgroundStyle = () => {
    // macOS Dark Mode-ish background
    const base = theme.mode === 'light' ? '#f5f5f7' : '#000000';
    if (theme.backgroundImage) {
        return {
            backgroundImage: `url(${theme.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative' as const
        };
    }
    return { backgroundColor: base };
  };

  const overlayColor = theme.mode === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)';
  const overlayStyle = theme.backgroundImage ? { backgroundColor: overlayColor, opacity: theme.opacity } : {};

  // Custom styles for electron window dragging
  const dragRegionStyle: React.CSSProperties = {
    WebkitAppRegion: 'drag' as any, // TypeScript workaround
  };
  const noDragStyle: React.CSSProperties = {
    WebkitAppRegion: 'no-drag' as any,
  };

  return (
    <div className="flex h-screen w-screen text-[#e0e0e0] overflow-hidden selection:bg-blue-500/30">
      {/* Sidebar - Glassmorphism */}
      {/* Add drag region to top of sidebar */}
      <div className="flex flex-col h-full w-[260px] z-20 relative">
          <div className="absolute top-0 left-0 w-full h-8 z-50" style={dragRegionStyle}></div>
          <SessionList 
            sessions={sessions}
            onConnect={handleConnect}
            onCreate={() => { setEditingSession(null); setIsSessionModalOpen(true); }}
            onEdit={(s) => { setEditingSession(s); setIsSessionModalOpen(true); }}
            onDelete={handleDeleteSession}
          />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative" style={getBackgroundStyle()}>
        {/* Background Overlay */}
        {theme.backgroundImage && (
            <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-300" style={overlayStyle} />
        )}

        {/* Top Bar / Tab Bar - MacOS Title Bar style */}
        {/* Add Drag Region to the container, but remove it from interactive elements */}
        <div 
            className="flex items-center h-[44px] px-2 z-10 border-b border-white/5 bg-[#1c1c1e]/80 backdrop-blur-md transition-colors duration-200"
            style={dragRegionStyle}
        >
            <div className="flex-1 flex items-center overflow-x-auto no-scrollbar gap-1" style={noDragStyle}>
                {tabs.map(tab => (
                    <div 
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`
                            group relative flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer select-none min-w-[120px] max-w-[200px] transition-all duration-150 ease-out
                            ${activeTabId === tab.id 
                                ? 'bg-white/10 text-white shadow-sm' 
                                : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                            }
                        `}
                    >
                        <span className="truncate flex-1 font-sans">{tab.title}</span>
                        {/* Close Button - Only visible on hover or active */}
                        <button 
                            onClick={(e) => handleCloseTab(tab.id, e)}
                            className={`p-0.5 rounded hover:bg-white/20 text-neutral-400 hover:text-white transition-opacity duration-200 ${activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
            
            {/* Window Actions */}
            <div className="flex items-center pl-3 border-l border-white/5 ml-2" style={noDragStyle}>
                 <button 
                    onClick={() => setIsSettingsOpen(true)} 
                    className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                    title="Settings"
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Terminal Area */}
        <div className="flex-1 relative z-0">
            {tabs.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 select-none pointer-events-none">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center mb-6 shadow-2xl border border-white/5">
                        <Command className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-300 mb-2">No active sessions</h3>
                    <p className="text-xs text-neutral-500 font-medium bg-white/5 px-3 py-1 rounded-full border border-white/5">Press Ctrl + T to start</p>
                </div>
            ) : (
                tabs.map(tab => {
                    const session = sessions.find(s => s.id === tab.sessionId);
                    if (!session) return null;
                    return (
                        <Terminal 
                            key={tab.id}
                            session={session}
                            active={activeTabId === tab.id}
                            theme={theme}
                            onClose={() => handleCloseTab(tab.id)}
                        />
                    );
                })
            )}
        </div>
      </div>

      <SessionModal 
        isOpen={isSessionModalOpen} 
        onClose={() => setIsSessionModalOpen(false)}
        onSave={handleSaveSession}
        initialData={editingSession}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={theme}
        onUpdate={setTheme}
      />
    </div>
  );
};

export default App;
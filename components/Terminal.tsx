import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SshSession, ThemeConfig } from '../types';
import { MockSshConnection } from '../services/mockSsh';
import { Copy, ClipboardPaste, Eraser } from 'lucide-react';

interface TerminalProps {
  session: SshSession;
  active: boolean;
  theme: ThemeConfig;
  onClose: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ session, active, theme, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const connectionRef = useRef<MockSshConnection | null>(null);
  const commandBuffer = useRef<string>('');
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Input Handler using refs to avoid closure staleness in useEffect
  const handleInput = useCallback((data: string) => {
      const term = xtermRef.current;
      const connection = connectionRef.current;
      if (!term || !connection) return;

      for (let i = 0; i < data.length; i++) {
        const char = data[i];
        const code = char.charCodeAt(0);

        // Enter
        if (code === 13) {
            term.write('\r\n');
            connection.exec(commandBuffer.current);
            commandBuffer.current = '';
        } 
        // Backspace
        else if (code === 127) {
            if (commandBuffer.current.length > 0) {
                commandBuffer.current = commandBuffer.current.slice(0, -1);
                term.write('\b \b');
            }
        }
        // Printable characters
        else if (code >= 32) {
            commandBuffer.current += char;
            term.write(char);
        }
      }
  }, []);

  // Initialize Terminal
  useEffect(() => {
    if (!containerRef.current) return;

    // Apple Terminal / iTerm2 Default inspired theme
    const term = new XTerm({
      cursorBlink: true,
      fontFamily: '"JetBrains Mono", Menlo, Consolas, monospace',
      fontSize: theme.fontSize,
      fontWeight: '500',
      lineHeight: 1.2,
      letterSpacing: 0,
      theme: {
        background: '#00000000',
        foreground: '#F2F2F2',
        cursor: '#A0A0A0',
        cursorAccent: '#000',
        selectionBackground: 'rgba(255, 255, 255, 0.2)',
        black: '#1c1c1e',
        red: '#ff453a',
        green: '#32d74b',
        yellow: '#ffd60a',
        blue: '#0a84ff',
        magenta: '#bf5af2',
        cyan: '#64d2ff',
        white: '#ffffff',
        brightBlack: '#8e8e93',
        brightRed: '#ff6961',
        brightGreen: '#30d158',
        brightYellow: '#ffd60a',
        brightBlue: '#409cff',
        brightMagenta: '#d37feb',
        brightCyan: '#64d2ff',
        brightWhite: '#ffffff'
      },
      allowProposedApi: true,
      // allow transparency
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(containerRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Custom Key Handler for Copy/Paste
    term.attachCustomKeyEventHandler((arg) => {
        if (arg.type !== 'keydown') return true;
        
        const ctrlOrCmd = arg.ctrlKey || arg.metaKey;
        const key = arg.key.toLowerCase();

        // Copy: Ctrl+C / Cmd+C (only if selection exists)
        if (ctrlOrCmd && key === 'c') {
            const selection = term.getSelection();
            if (selection) {
                navigator.clipboard.writeText(selection);
                return false; // Prevent sending ^C to terminal
            }
            return true; // Send ^C if no selection
        }

        // Paste: Ctrl+V / Cmd+V
        if (ctrlOrCmd && key === 'v') {
             navigator.clipboard.readText().then(text => {
                 handleInput(text);
             });
             return false; // Prevent default browser paste
        }
        
        return true;
    });

    // Start Fake Connection
    const connection = new MockSshConnection(
      session,
      (data) => term.write(data),
      () => onClose()
    );
    
    connection.connect();
    connectionRef.current = connection;

    term.onData((data) => {
        handleInput(data);
    });

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      connection.close();
      term.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps, using refs for stability

  // Handle active state changes
  useEffect(() => {
    if (active && fitAddonRef.current) {
        setTimeout(() => {
            fitAddonRef.current?.fit();
            xtermRef.current?.focus();
        }, 50);
    }
  }, [active]);

  // Handle Theme Updates
  useEffect(() => {
    if (xtermRef.current) {
        xtermRef.current.options.fontSize = theme.fontSize;
        fitAddonRef.current?.fit();
    }
  }, [theme.fontSize]);

  // Context Menu Handlers
  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  useEffect(() => {
      if (contextMenu) {
          window.addEventListener('click', closeContextMenu);
          return () => window.removeEventListener('click', closeContextMenu);
      }
  }, [contextMenu]);

  const handleCopy = () => {
      const selection = xtermRef.current?.getSelection();
      if (selection) {
          navigator.clipboard.writeText(selection);
      }
      closeContextMenu();
  };

  const handlePaste = () => {
      navigator.clipboard.readText().then(text => {
          handleInput(text);
      }).catch(err => console.error("Clipboard read failed", err));
      closeContextMenu();
  };

  const handleClear = () => {
      xtermRef.current?.clear();
      closeContextMenu();
  };

  return (
    <div 
        className={`h-full w-full absolute top-0 left-0 transition-opacity duration-300 ${active ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}
        style={{
             padding: '12px 0 0 12px',
             backgroundColor: !theme.backgroundImage ? 'rgba(0,0,0,0)' : undefined
        }}
        onContextMenu={handleContextMenu}
    >
        <div ref={containerRef} className="h-full w-full overflow-hidden outline-none" />

        {/* Context Menu */}
        {contextMenu && (
            <div 
                className="fixed z-50 w-48 bg-[#1e1e1e]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl py-1 text-sm text-gray-200 animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                style={{ top: contextMenu.y, left: contextMenu.x }}
                onClick={(e) => e.stopPropagation()} 
            >
                <button 
                    onClick={handleCopy}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2 group"
                    disabled={!xtermRef.current?.getSelection()}
                >
                    <Copy className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    <span>Copy</span>
                    <span className="ml-auto text-xs text-gray-500">Cmd+C</span>
                </button>
                <button 
                    onClick={handlePaste}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2 group"
                >
                    <ClipboardPaste className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    <span>Paste</span>
                    <span className="ml-auto text-xs text-gray-500">Cmd+V</span>
                </button>
                <div className="h-[1px] bg-white/10 my-1 mx-2"></div>
                <button 
                    onClick={handleClear}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2 group text-red-400 hover:text-red-300"
                >
                    <Eraser className="w-4 h-4" />
                    <span>Clear Buffer</span>
                    <span className="ml-auto text-xs text-gray-500">Cmd+K</span>
                </button>
            </div>
        )}
    </div>
  );
};
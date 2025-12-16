export enum AuthMethod {
  PASSWORD = 'PASSWORD',
  KEY = 'KEY'
}

export interface SshSession {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authMethod: AuthMethod;
  group: string; // e.g., 'PROD', 'DEV'
  privateKeyPath?: string; // stored as string path for simulation
}

export interface TerminalTab {
  id: string;
  sessionId: string;
  title: string;
  status: 'connecting' | 'connected' | 'disconnected';
}

export interface ThemeConfig {
  mode: 'dark' | 'darker' | 'light';
  fontSize: number;
  backgroundImage?: string;
  opacity: number;
}

export const DEFAULT_THEME: ThemeConfig = {
  mode: 'dark',
  fontSize: 14,
  opacity: 0.95
};

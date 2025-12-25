
export enum TranslationMode {
  ENGLISH = 'EN',
  JAPANESE = 'JP',
  DUAL = 'DUAL'
}

export enum SpeechProvider {
  WEB_SPEECH = 'WEB_SPEECH',
  WHISPER_LOCAL = 'WHISPER_LOCAL',
  GEMINI_LIVE = 'GEMINI_LIVE'
}

export interface LocalModel {
  id: string;
  name: string;
  size: string;
  status: 'idle' | 'downloading' | 'installed';
  progress: number;
  description: string;
}

export interface WordFilter {
  id: string;
  pattern: string;
  replacement: string;
  isActive: boolean;
}

export interface TranslationEntry {
  id: string;
  original: string;
  english: string;
  japanese?: string;
  timestamp: number;
}

export interface AppSettings {
  translationMode: TranslationMode;
  provider: SpeechProvider;
  filters: WordFilter[];
  audioDeviceId: string;
  isJapaneseEnabled: boolean;
  fontSize: number;
  animeStyle: boolean;
  localPath: string;
  useGPU: boolean;
}

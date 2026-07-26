// Shot configuration
export interface ShotConfig {
  url: string;
  shotType: ShotType;
  theme: ThemeType;
  decorations: DecorationType[];
  customSize?: CustomSize;
  delay: number;
  quality: number;
}

// Shot result
export interface ShotResult {
  screenshot: string;      // Base64 encoded image
  metadata: Metadata;
  decorations: string[];
  theme: string;
  timestamp: number;
  id: number;
}

// History item
export interface HistoryItem {
  id: number;
  url: string;
  screenshot: string;
  timestamp: number;
  metadata: Metadata;
}

// Types
export type ShotType = 
  | 'desktop' 
  | 'desktop-viewport' 
  | 'tablet' 
  | 'mobile' 
  | 'mobile-viewport' 
  | 'social' 
  | 'custom';

export type ThemeType = 
  | 'modern' 
  | 'minimal' 
  | 'dark' 
  | 'glass' 
  | 'neon' 
  | 'retro';

export type DecorationType = 
  | 'shadow' 
  | 'gradient' 
  | 'glow' 
  | 'corner' 
  | 'frame' 
  | 'polaroid';

export interface CustomSize {
  width: number;
  height: number;
}

export interface Metadata {
  width: number;
  height: number;
  format: string;
  quality: number;
}

// API Responses
export interface ScreenshotResponse {
  screenshot: string;
  metadata: Metadata;
  decorations: string[];
  theme: string;
  timestamp: number;
  id: number;
}

export interface ErrorResponse {
  error: string;
}

export enum ShiftType {
  Off = '休',
  MorningN = '朝N',
  DayMid = '昼中',
  DayN = '昼N',
  CNarre = 'Cナレ',
  CNarre1 = 'Cナレ①',
  CNarre3 = 'Cナレ③',
  NightN = '夜N',
  NightS = '夜S',
  QuakeDrill = '地震訓練',
  CompOff = '必休',
  OffWork = '休(出)',
  
  // 新規追加項目
  CatchM = 'キャッチM',
  CatchS = 'キャッチS',
  CatchE = 'キャッチE',
  AsaDoreM = 'あさドレM',
  AsaDoreS = 'あさドレS',
  Relay1 = 'あ中継①',
  Relay2 = 'あ中継②',
  ComingShadow = 'カミング影',
}

export interface ScheduleEntry {
  date: string; // YYYY-MM-DD
  shifts: ShiftType[]; // Changed from single shift to array for multiple selections
  note: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  schedules: Record<string, ScheduleEntry>; // Key is YYYY-MM-DD
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}
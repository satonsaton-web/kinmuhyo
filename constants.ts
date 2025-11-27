import { ShiftType } from './types';

// デモ用のパスワード設定
// 実際の運用では環境変数やバックエンド認証を使用することを推奨します
export const AUTH_PASSWORDS = {
  VIEW: '1111',
  EDIT: '9999'
};

export const SHIFT_COLORS: Record<ShiftType, string> = {
  // 休み系 (グレー/赤)
  [ShiftType.Off]: 'bg-slate-100 text-slate-500 border-slate-200',
  [ShiftType.CompOff]: 'bg-rose-50 text-rose-400 border-rose-100', // 必休
  [ShiftType.OffWork]: 'bg-slate-200 text-slate-600 border-slate-300', // 休(出)

  // 朝・昼系 (青/水色)
  [ShiftType.MorningN]: 'bg-sky-100 text-sky-700 border-sky-200',
  [ShiftType.DayMid]: 'bg-blue-100 text-blue-700 border-blue-200',
  [ShiftType.DayN]: 'bg-blue-50 text-blue-600 border-blue-200',

  // Cナレ系 (緑/エメラルド)
  [ShiftType.CNarre]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [ShiftType.CNarre1]: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  [ShiftType.CNarre3]: 'bg-teal-100 text-teal-700 border-teal-200',

  // 夜勤系 (インディゴ/紫)
  [ShiftType.NightN]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  [ShiftType.NightS]: 'bg-violet-100 text-violet-700 border-violet-200',

  // キャッチ系 (オレンジ)
  [ShiftType.CatchM]: 'bg-orange-100 text-orange-700 border-orange-200',
  [ShiftType.CatchS]: 'bg-amber-100 text-amber-700 border-amber-200',
  [ShiftType.CatchE]: 'bg-yellow-100 text-yellow-700 border-yellow-200',

  // あさドレ系 (ピンク)
  [ShiftType.AsaDoreM]: 'bg-pink-100 text-pink-700 border-pink-200',
  [ShiftType.AsaDoreS]: 'bg-rose-100 text-rose-700 border-rose-200',

  // 中継・その他
  [ShiftType.Relay1]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  [ShiftType.Relay2]: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  [ShiftType.ComingShadow]: 'bg-purple-100 text-purple-700 border-purple-200', // カミング影
  [ShiftType.QuakeDrill]: 'bg-red-100 text-red-700 border-red-200',
};

export const SHIFT_LABELS = Object.values(ShiftType);

export const MOCK_NAMES = [
  "佐藤 健一", "鈴木 一郎", "高橋 花子", "田中 美咲", "伊藤 翔太",
  "渡辺 謙", "山本 未来", "中村 優", "小林 さくら", "加藤 剛",
  "吉田 輝", "山田 太郎", "佐々木 希", "山口 達也", "松本 潤",
  "井上 真央", "木村 拓哉", "林 修", "清水 翔太", "山崎 賢人",
  "池田 エライザ", "橋本 環奈", "中川 大志", "村上 信五", "近藤 真彦",
  "石川 遼", "長谷川 博己", "藤原 竜也", "岡田 准一", "斎藤 工"
];

export const INITIAL_ROLES = ["部長", "課長", "リーダー", "メンバー"];
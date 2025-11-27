import { Member, ShiftType, ScheduleEntry } from '../types';
import { MOCK_NAMES, INITIAL_ROLES } from '../constants';

const getRandomShifts = (): ShiftType[] => {
  const r = Math.random();
  // 60% chance of single shift, 10% chance of multiple
  if (r < 0.10) return [ShiftType.Off]; // 休み
  
  if (r < 0.20) return [ShiftType.MorningN]; // 朝N
  if (r < 0.30) return [ShiftType.DayMid]; // 昼中
  if (r < 0.35) return [ShiftType.CatchM]; // キャッチM
  if (r < 0.40) return [ShiftType.CatchS]; // キャッチS
  if (r < 0.45) return [ShiftType.AsaDoreM]; // あさドレM
  if (r < 0.50) return [ShiftType.NightN]; // 夜N
  if (r < 0.55) return [ShiftType.Relay1]; // あ中継
  
  if (r < 0.65) return [ShiftType.Off]; // More Offs

  // Complex days (Multiple shifts)
  if (r < 0.70) return [ShiftType.CatchM, ShiftType.ComingShadow];
  if (r < 0.75) return [ShiftType.MorningN, ShiftType.Relay2];
  
  // Default remaining
  return [ShiftType.DayN];
};

const generateMonthSchedule = (year: number, month: number): Record<string, ScheduleEntry> => {
  const schedule: Record<string, ScheduleEntry> = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const shifts = getRandomShifts();
    
    // Add random notes to simulate the 4-line requirement
    let note = "";
    if (shifts.includes(ShiftType.Relay1)) {
      note = "機材搬入\n14:00〜リハ";
    } else if (shifts.includes(ShiftType.CatchM)) {
      note = "取材A";
    } else if (Math.random() > 0.8) {
      note = "13:00 会議\n第2会議室";
    }

    schedule[dateStr] = {
      date: dateStr,
      shifts: shifts,
      note: note
    };
  }
  return schedule;
};

export const generateMockMembers = (): Member[] => {
  const members: Member[] = [];
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  MOCK_NAMES.forEach((name, index) => {
    members.push({
      id: `member-${index}`,
      name: name,
      role: index === 0 ? INITIAL_ROLES[0] : (index < 3 ? INITIAL_ROLES[1] : (index < 8 ? INITIAL_ROLES[2] : INITIAL_ROLES[3])),
      avatarUrl: `https://picsum.photos/seed/${index + 200}/32/32`,
      schedules: generateMonthSchedule(currentYear, currentMonth),
    });
  });

  return members;
};
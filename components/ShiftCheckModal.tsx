import React, { useMemo, useState } from 'react';
import { X, AlertTriangle, Users, CheckCircle2, AlertCircle, HelpCircle, Calendar, BarChart3, ChevronRight, ChevronDown } from 'lucide-react';
import { Member, ShiftType } from '../types';
import { SHIFT_COLORS, SHIFT_LABELS } from '../constants';

interface ShiftCheckModalProps {
  members: Member[];
  date: Date;
  onClose: () => void;
}

type ViewMode = 'daily' | 'weekly';

// Helper to check if a shift is considered "Working" (not Off/Rest)
const isWorkingShift = (shift: ShiftType) => {
  return !shift.includes('休') && !shift.includes('必休');
};

export const ShiftCheckModal: React.FC<ShiftCheckModalProps> = ({ members, date, onClose }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  // --- Date Logic ---
  
  // Daily Date
  const dailyDateStr = useMemo(() => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, [date]);

  // Weekly Range (Sunday to Saturday)
  const weekRange = useMemo(() => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Go to Sunday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        dateObj: d,
        dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dayName: ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
      });
    }
    return days;
  }, [date]);

  // --- Stats Calculation Helper ---

  const calculateDailyStats = (targetDateStr: string) => {
    const missing: Member[] = [];
    const multiple: { member: Member; shifts: ShiftType[] }[] = [];
    const counts: Record<string, number> = {};

    SHIFT_LABELS.forEach(label => counts[label] = 0);

    members.forEach(member => {
      const entry = member.schedules[targetDateStr];
      const shifts = entry ? entry.shifts : [];

      if (!entry || shifts.length === 0) {
        missing.push(member);
      }

      if (shifts.length > 1) {
        multiple.push({ member, shifts });
      }

      if (shifts.length > 0) {
        shifts.forEach(shift => {
          counts[shift] = (counts[shift] || 0) + 1;
        });
      }
    });

    // Find shift types with 0 count (excluding 'Off' types)
    const zeroCountShifts = SHIFT_LABELS.filter(label => 
      counts[label] === 0 && !label.includes('休')
    );

    return { missing, multiple, counts, zeroCountShifts, hasIssues: missing.length > 0 || multiple.length > 0 || zeroCountShifts.length > 0 };
  };

  // --- Stats Data ---

  // 1. Daily Data
  const dailyStats = useMemo(() => calculateDailyStats(dailyDateStr), [members, dailyDateStr]);

  // 2. Weekly Data
  const weeklyStats = useMemo(() => {
    // Aggregated daily issues
    const dailyIssues = weekRange.map(day => ({
      day,
      stats: calculateDailyStats(day.dateStr)
    })).filter(item => item.stats.hasIssues);

    // Workload (Total shifts per member)
    const workload = members.map(member => {
      let workDays = 0;
      let offDays = 0;
      
      weekRange.forEach(day => {
        const entry = member.schedules[day.dateStr];
        const shifts = entry ? entry.shifts : [];
        // If they have ANY working shift that day, count as 1 work day
        if (shifts.some(s => isWorkingShift(s))) {
          workDays++;
        } else {
          offDays++;
        }
      });

      return { member, workDays, offDays };
    }).sort((a, b) => b.workDays - a.workDays); // Sort by busiest

    return { dailyIssues, workload };
  }, [members, weekRange]);


  const toggleDayExpand = (dateStr: string) => {
    setExpandedDays(prev => 
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };


  // --- Render Components ---

  const renderIssuesList = (stats: ReturnType<typeof calculateDailyStats>) => (
    <div className="space-y-4">
      {/* Zero Counts */}
      {stats.zeroCountShifts.length > 0 && (
         <div className="bg-slate-100 border border-slate-200 rounded-lg p-3">
           <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm">
             <HelpCircle size={16} />
             <span>配置なし ({stats.zeroCountShifts.length})</span>
           </div>
           <div className="flex flex-wrap gap-2">
               {stats.zeroCountShifts.map(s => (
                 <span key={s} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded text-slate-500">
                   {s}
                 </span>
               ))}
           </div>
         </div>
      )}

      {/* Multiple Shifts */}
      {stats.multiple.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-sm">
            <AlertCircle size={16} />
            <span>複数シフト ({stats.multiple.length}名)</span>
          </div>
          <div className="space-y-1">
            {stats.multiple.map(({ member, shifts }) => (
              <div key={member.id} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-amber-100 text-xs">
                <span>{member.name}</span>
                <div className="flex gap-1">
                  {shifts.map(s => (
                    <span key={s} className={`px-1 rounded border ${SHIFT_COLORS[s]}`}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Input */}
      {stats.missing.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2 text-rose-700 font-bold text-sm">
            <AlertTriangle size={16} />
            <span>未入力 ({stats.missing.length}名)</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {stats.missing.map((member) => (
              <span key={member.id} className="bg-white px-2 py-1 rounded border border-rose-100 text-xs text-slate-700">
                {member.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="text-emerald-400" size={24} />
              <div>
                <h2 className="text-lg font-bold">シフトチェック</h2>
                <p className="text-slate-300 text-xs">不整合や漏れを確認します</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-slate-700/50 rounded-lg w-fit">
            <button
              onClick={() => setViewMode('daily')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                viewMode === 'daily' 
                  ? 'bg-white text-slate-800 shadow-md' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Calendar size={16} />
              日次チェック
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                viewMode === 'weekly' 
                  ? 'bg-white text-slate-800 shadow-md' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <BarChart3 size={16} />
              週次レポート
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          
          {/* --- DAILY VIEW --- */}
          {viewMode === 'daily' && (
            <div className="p-6 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-xl font-bold text-slate-800">
                  {date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日 ({['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})
                </h3>
                {!dailyStats.hasIssues && (
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <CheckCircle2 size={16} /> 問題なし
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                 {/* Issues Column */}
                 <div>
                   <h4 className="font-bold text-slate-700 mb-3">アラート一覧</h4>
                   {dailyStats.hasIssues ? (
                     renderIssuesList(dailyStats)
                   ) : (
                     <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                       <CheckCircle2 size={48} className="mx-auto mb-2 text-emerald-200" />
                       <p>この日の配置に問題は見つかりませんでした</p>
                     </div>
                   )}
                 </div>

                 {/* Counts Column */}
                 <div>
                    <h4 className="font-bold text-slate-700 mb-3">シフト集計</h4>
                    <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      {SHIFT_LABELS.map(type => {
                        const count = dailyStats.counts[type] || 0;
                        if (count === 0) return null;
                        return (
                          <div key={type} className="flex justify-between items-center border-b border-slate-50 last:border-0 pb-1 mb-1 last:pb-0 last:mb-0">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${SHIFT_COLORS[type]}`}>
                              {type}
                            </span>
                            <span className="font-bold text-slate-700">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* --- WEEKLY VIEW --- */}
          {viewMode === 'weekly' && (
             <div className="p-6 space-y-8">
               <div className="border-b border-slate-200 pb-4">
                 <h3 className="text-xl font-bold text-slate-800">
                   週間レポート ({weekRange[0].dateStr.slice(5)} 〜 {weekRange[6].dateStr.slice(5)})
                 </h3>
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                 {/* Left: Daily Issues Accordion */}
                 <div>
                   <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                     <AlertCircle size={18} className="text-amber-500" />
                     日別アラート
                   </h4>
                   <div className="space-y-3">
                     {weeklyStats.dailyIssues.length === 0 ? (
                       <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                         期間中の配置エラーはありません
                       </div>
                     ) : (
                       weeklyStats.dailyIssues.map(({ day, stats }) => (
                         <div key={day.dateStr} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                           <button 
                             onClick={() => toggleDayExpand(day.dateStr)}
                             className={`w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 transition-colors ${
                               expandedDays.includes(day.dateStr) ? 'bg-slate-50' : ''
                             }`}
                           >
                             <div className="flex items-center gap-2">
                               <span className={`font-bold ${day.dayName === '日' ? 'text-rose-500' : day.dayName === '土' ? 'text-blue-500' : 'text-slate-700'}`}>
                                 {day.dateStr.slice(5)} ({day.dayName})
                               </span>
                               <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                                 {stats.missing.length + stats.multiple.length + stats.zeroCountShifts.length} 件のアラート
                               </span>
                             </div>
                             {expandedDays.includes(day.dateStr) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                           </button>
                           
                           {expandedDays.includes(day.dateStr) && (
                             <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                               {renderIssuesList(stats)}
                             </div>
                           )}
                         </div>
                       ))
                     )}
                   </div>
                 </div>

                 {/* Right: Workload Analysis */}
                 <div>
                   <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                     <BarChart3 size={18} className="text-brand-500" />
                     週間稼働状況
                   </h4>
                   <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                     <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                       <table className="w-full text-sm">
                         <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 sticky top-0">
                           <tr>
                             <th className="px-4 py-2 text-left">氏名</th>
                             <th className="px-4 py-2 text-center">出勤日数</th>
                             <th className="px-4 py-2 text-center">休日数</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                           {weeklyStats.workload.map(({ member, workDays, offDays }) => (
                             <tr key={member.id} className="hover:bg-slate-50">
                               <td className="px-4 py-2 flex items-center gap-2">
                                 <img src={member.avatarUrl} className="w-6 h-6 rounded-full" alt="" />
                                 <span className="text-slate-700">{member.name}</span>
                               </td>
                               <td className="px-4 py-2 text-center">
                                 <span className={`font-bold ${workDays >= 6 ? 'text-rose-600' : workDays === 0 ? 'text-slate-400' : 'text-slate-700'}`}>
                                   {workDays}日
                                 </span>
                                 {workDays >= 7 && <span className="ml-1 text-[10px] bg-rose-100 text-rose-600 px-1 rounded">連勤</span>}
                               </td>
                               <td className="px-4 py-2 text-center">
                                 <span className={`${offDays < 1 ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                                   {offDays}日
                                 </span>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
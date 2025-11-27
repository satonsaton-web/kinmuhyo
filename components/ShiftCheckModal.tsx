import React, { useMemo } from 'react';
import { X, AlertTriangle, Users, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { Member, ShiftType } from '../types';
import { SHIFT_COLORS, SHIFT_LABELS } from '../constants';

interface ShiftCheckModalProps {
  members: Member[];
  date: Date;
  onClose: () => void;
}

export const ShiftCheckModal: React.FC<ShiftCheckModalProps> = ({ members, date, onClose }) => {
  const dateStr = useMemo(() => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }, [date]);

  const stats = useMemo(() => {
    const missing: Member[] = [];
    const multiple: { member: Member; shifts: ShiftType[] }[] = [];
    const counts: Record<string, number> = {};

    // Initialize counts
    SHIFT_LABELS.forEach(label => counts[label] = 0);

    members.forEach(member => {
      const entry = member.schedules[dateStr];
      const shifts = entry ? entry.shifts : [];

      // Check Missing (Empty array or no entry implies Off? Usually explicit Off is preferred)
      // If shifts array is empty, we treat it as missing/undefined
      if (!entry || shifts.length === 0) {
        missing.push(member);
      }

      // Check Multiple
      if (shifts.length > 1) {
        multiple.push({ member, shifts });
      }

      // Count types
      if (shifts.length > 0) {
        shifts.forEach(shift => {
          counts[shift] = (counts[shift] || 0) + 1;
        });
      }
    });

    const zeroCountShifts = SHIFT_LABELS.filter(label => counts[label] === 0 && !label.includes('休'));

    return { missing, multiple, counts, zeroCountShifts };
  }, [members, dateStr]);

  const hasWarnings = stats.missing.length > 0 || stats.multiple.length > 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-400" size={24} />
            <div>
              <h2 className="text-lg font-bold">シフトチェック</h2>
              <p className="text-slate-300 text-xs">{date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日の集計</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
          
          {/* Warnings Section */}
          <div className="grid md:grid-cols-2 gap-6">
             {/* Missing Roles Warning (Zero counts) */}
             <div className="bg-slate-100 border border-slate-200 rounded-xl p-4">
               <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold border-b border-slate-200 pb-2">
                 <HelpCircle size={18} />
                 <span>配置なしの勤務内容 ({stats.zeroCountShifts.length})</span>
               </div>
               <div className="flex flex-wrap gap-2">
                 {stats.zeroCountShifts.length > 0 ? (
                   stats.zeroCountShifts.map(s => (
                     <span key={s} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded text-slate-500">
                       {s}
                     </span>
                   ))
                 ) : (
                   <span className="text-sm text-slate-500">全ての主要シフトに人員が配置されています</span>
                 )}
               </div>
             </div>

            {/* Multiple Shifts Warning */}
            {stats.multiple.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 text-amber-700 font-bold border-b border-amber-100 pb-2">
                  <AlertCircle size={18} />
                  <span>複数シフト登録 ({stats.multiple.length}名)</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {stats.multiple.map(({ member, shifts }) => (
                    <div key={member.id} className="flex items-center justify-between bg-white p-2 rounded border border-amber-100 text-sm">
                      <div className="flex items-center gap-2">
                        <img src={member.avatarUrl} className="w-6 h-6 rounded-full" alt="" />
                        <span className="font-medium text-slate-700">{member.name}</span>
                      </div>
                      <div className="flex gap-1">
                        {shifts.map(s => (
                          <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded border ${SHIFT_COLORS[s]}`}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Missing Shifts Warning */}
          {stats.missing.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 text-rose-700 font-bold border-b border-rose-100 pb-2">
                <AlertTriangle size={18} />
                <span>シフト未入力 ({stats.missing.length}名)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                {stats.missing.map((member) => (
                  <div key={member.id} className="flex items-center gap-2 bg-white p-2 rounded border border-rose-100 text-sm">
                    <img src={member.avatarUrl} className="w-6 h-6 rounded-full" alt="" />
                    <span className="font-medium text-slate-700">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Counts Section */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
              <Users size={20} />
              <span>シフト内訳</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {SHIFT_LABELS.map(type => {
                const count = stats.counts[type] || 0;
                if (count === 0) return null; // Skip 0 counts here as they are shown in "Missing Roles"
                
                return (
                  <div key={type} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded w-fit mb-1 border ${SHIFT_COLORS[type]}`}>
                        {type}
                      </span>
                    </div>
                    <span className="text-xl font-bold text-slate-700">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

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
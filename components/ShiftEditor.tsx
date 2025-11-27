import React, { useState, useEffect } from 'react';
import { ShiftType, ScheduleEntry } from '../types';
import { SHIFT_LABELS, SHIFT_COLORS } from '../constants';
import { X, Check } from 'lucide-react';

interface ShiftEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: ScheduleEntry) => void;
  initialEntry: ScheduleEntry;
  memberName: string;
}

export const ShiftEditor: React.FC<ShiftEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntry,
  memberName,
}) => {
  // Use array for shifts to support multiple selections
  const [selectedShifts, setSelectedShifts] = useState<ShiftType[]>([]);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Handle legacy data (single shift) vs new data (array)
      if (Array.isArray(initialEntry.shifts)) {
        setSelectedShifts(initialEntry.shifts);
      } else if ((initialEntry as any).shift) {
        // Migration for old data structure
        setSelectedShifts([(initialEntry as any).shift]);
      } else {
        setSelectedShifts([]);
      }
      setNote(initialEntry.note || '');
    }
  }, [isOpen, initialEntry]);

  if (!isOpen) return null;

  const toggleShift = (type: ShiftType) => {
    setSelectedShifts(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        // Restriction removed: Allow unlimited selections
        return [...prev, type];
      }
    });
  };

  const handleSave = () => {
    onSave({ 
      ...initialEntry, 
      shifts: selectedShifts.length > 0 ? selectedShifts : [ShiftType.Off], // Default to Off if nothing selected
      note 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">予定編集</h3>
            <p className="text-sm text-slate-500">{memberName} - {initialEntry.date}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">勤務内容 (複数選択可)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {SHIFT_LABELS.map((type) => {
                const isSelected = selectedShifts.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleShift(type)}
                    className={`
                      px-2 py-3 rounded-lg text-xs font-bold border transition-all truncate
                      ${isSelected 
                        ? `${SHIFT_COLORS[type]} ring-2 ring-offset-1 ring-blue-400 shadow-md` 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }
                    `}
                    title={type}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">備考 (任意)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例: 13:00から会議&#13;&#10;場所: A会議室"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm h-24 resize-none"
              maxLength={60}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{note.length}/60</p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
          >
            <Check size={16} /> 保存
          </button>
        </div>
      </div>
    </div>
  );
};
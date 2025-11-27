
import React from 'react';
import { X, Calendar, MessageSquare, Edit3, Sparkles } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-brand-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">ようこそ StaffSync AI へ</h2>
            <p className="text-brand-100 text-sm">次世代の勤務表管理を体験しましょう</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex gap-4 items-start">
            <div className="bg-blue-100 p-3 rounded-xl text-brand-600 shrink-0">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">見やすいカレンダー</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                部員30名の予定を一目で確認できます。土日は色分けされ、直感的に把握できます。
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600 shrink-0">
              <Edit3 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">かんたん編集</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                日付のセルをクリックするだけで、シフト（日勤・夜勤など）や短いメモ（会議時間など）をすぐに編集・保存できます。
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600 shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">AI アシスタント</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                画面右下のキラキラボタンを押して質問してみましょう。「明日の夜勤は誰？」「来週空いている人は？」など、AIが即座に答えます。
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl transform active:scale-95 transition-all"
          >
            はじめる
          </button>
        </div>
      </div>
    </div>
  );
};

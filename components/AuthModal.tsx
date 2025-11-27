import React, { useState } from 'react';
import { Lock, Unlock, AlertCircle } from 'lucide-react';
import { AUTH_PASSWORDS } from '../constants';

interface AuthModalProps {
  mode: 'view' | 'edit';
  isOpen: boolean;
  onSuccess: () => void;
  onClose?: () => void; // Optional for edit mode cancel
}

export const AuthModal: React.FC<AuthModalProps> = ({ mode, isOpen, onSuccess, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPassword = mode === 'view' ? AUTH_PASSWORDS.VIEW : AUTH_PASSWORDS.EDIT;
    
    if (password === targetPassword) {
      onSuccess();
      setPassword('');
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className={`p-6 text-white flex justify-center ${mode === 'view' ? 'bg-slate-700' : 'bg-brand-600'}`}>
          <div className="bg-white/20 p-4 rounded-full">
            {mode === 'view' ? <Lock size={32} /> : <Unlock size={32} />}
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-center text-xl font-bold text-slate-800 mb-2">
            {mode === 'view' ? '閲覧制限' : '編集制限'}
          </h2>
          <p className="text-center text-slate-500 text-sm mb-6">
            {mode === 'view' 
              ? '勤務表を閲覧するにはパスワードを入力してください。(初期: 1111)' 
              : '変更を保存するには管理者パスワードを入力してください。(初期: 9999)'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className="w-full px-4 py-3 text-center text-lg tracking-widest border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                placeholder="パスワード"
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-1 text-rose-500 text-xs mt-2 justify-center font-medium">
                  <AlertCircle size={12} />
                  <span>パスワードが間違っています</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50"
                >
                  キャンセル
                </button>
              )}
              <button
                type="submit"
                className={`flex-1 py-2 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all
                  ${mode === 'view' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-brand-600 hover:bg-brand-700'}
                `}
              >
                解除する
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
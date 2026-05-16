import { X } from 'lucide-react';
import { useState } from 'react';
import { authStore } from '../stores/auth-store';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setUsername('');
    setPassword('');
    setError('');
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await authStore.login(username, password);
      } else {
        await authStore.register(username, password);
      }
      reset();
      onClose();
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={handleClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl z-50 p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`text-lg pb-1 border-b-2 transition-colors ${tab === 'login' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
              登录
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`text-lg pb-1 border-b-2 transition-colors ${tab === 'register' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
              注册
            </button>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
              placeholder="请输入用户名"
              required
              minLength={3}
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
              placeholder="请输入密码"
              required
              minLength={6}
              maxLength={32}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '请稍候...' : tab === 'login' ? '登录' : '注册'}
          </button>
        </form>

        {tab === 'login' && (
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
              忘记密码？
            </a>
          </div>
        )}
      </div>
    </>
  );
}

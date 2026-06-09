import { X } from 'lucide-react';
import { useState } from 'react';
import { authStore } from '../../stores/auth-store';
import { BaseModal } from '../ui/BaseModal';
import { Tooltip } from '../ui/Tooltip';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * LoginDialog 组件/功能描述
 */
export function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setUsername('');
    setPassword('');
    setError('');
    setSuccessMessage('');
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await authStore.login(username, password);
        reset();
        onClose();
      } else if (tab === 'register') {
        await authStore.register(username, password);
        reset();
        onClose();
      }
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
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      animationType="scale"
      position="center"
      containerClassName="w-full max-w-md glass-panel rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-8"
      overlayClassName="bg-black/60 dark:bg-black/75 backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => { setTab('login'); setError(''); setSuccessMessage(''); }}
            className={`text-lg font-semibold pb-1 border-b-2 transition-all duration-300 ${
              tab === 'login'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 scale-105'
                : 'text-gray-400 dark:text-neutral-500 border-transparent hover:text-gray-600 dark:hover:text-neutral-300 hover:scale-102'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); setSuccessMessage(''); }}
            className={`text-lg font-semibold pb-1 border-b-2 transition-all duration-300 ${
              tab === 'register'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 scale-105'
                : 'text-gray-400 dark:text-neutral-500 border-transparent hover:text-gray-600 dark:hover:text-neutral-300 hover:scale-102'
            }`}
          >
            注册
          </button>
        </div>
        <Tooltip content="关闭" side="left">
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-200 transition-colors" />
          </button>
        </Tooltip>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50/80 dark:bg-red-950/45 border border-red-200/50 dark:border-red-900/30 rounded-2xl text-xs text-red-600 dark:text-red-400 shadow-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 px-4 py-3 bg-green-50/80 dark:bg-green-950/45 border border-green-200/50 dark:border-green-900/30 rounded-2xl text-xs text-green-600 dark:text-green-400 shadow-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-neutral-400 mb-1.5 ml-1">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50/50 dark:bg-neutral-800/40 border border-gray-200/80 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-neutral-200 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all duration-200 shadow-inner"
            placeholder="请输入用户名"
            required
            minLength={3}
            maxLength={20}
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-neutral-400 mb-1.5 ml-1">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50/50 dark:bg-neutral-800/40 border border-gray-200/80 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-neutral-200 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all duration-200 shadow-inner"
            placeholder="请输入密码"
            required
            minLength={6}
            maxLength={32}
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700 text-white font-medium text-sm rounded-full transition-all duration-200 shadow-[0_4px_12px_rgba(37,99,235,0.2)] dark:shadow-[0_4px_12px_rgba(59,130,246,0.15)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)] dark:hover:shadow-[0_6px_20px_rgba(59,130,246,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading ? '请稍候...' : tab === 'login' ? '登录' : '注册'}
        </button>
      </form>
    </BaseModal>
  );
}

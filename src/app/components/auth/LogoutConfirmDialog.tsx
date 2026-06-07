import { LogOut, X, Key } from 'lucide-react';
import { useState, useEffect } from 'react';
import { authStore } from '../../stores/auth-store';

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username?: string;
}

/**
 * 账号管理与确认登出提示对话框组件。
 * 提供账号确认、修改密码与登出操作。
 */
export function LogoutConfirmDialog({ isOpen, onClose, onConfirm, username }: LogoutConfirmDialogProps) {
  const [view, setView] = useState<'confirm' | 'changePassword'>('confirm');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // 当对话框关闭时，重置所有状态
  useEffect(() => {
    if (!isOpen) {
      setView('confirm');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) return;

    if (newPassword !== confirmPassword) {
      setError('两次输入新密码不一致');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authStore.changePassword(oldPassword, newPassword);
      setSuccess('密码修改成功！');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // 成功后延迟切回主面板
      setTimeout(() => {
        setView('confirm');
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || '原密码错误或修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm glass-panel rounded-3xl shadow-2xl dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] z-50 p-8 text-center animate-scale-in transition-all duration-300">
        <div className="flex justify-end absolute top-4 right-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-neutral-400" />
          </button>
        </div>

        {view === 'confirm' ? (
          <>
            <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-4">
              <LogOut className="w-8 h-8 text-red-500" />
            </div>

            <h3 className="text-xl font-medium text-gray-800 dark:text-neutral-100 mb-2">账号管理</h3>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">
              {username ? `当前登录账号为 ${username}` : '已登录'}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setView('changePassword')}
                className="w-full py-3 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full transition-all duration-200 font-medium text-sm border border-blue-100 dark:border-blue-900/50 flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                修改密码
              </button>
              
              <div className="flex gap-4 mt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-850 dark:text-neutral-200 rounded-full transition-all duration-200 font-medium text-sm border border-gray-200 dark:border-neutral-700"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 font-medium text-sm shadow-lg shadow-red-100/50 dark:shadow-none hover:shadow-red-200/50"
                >
                  退出登录
                </button>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleChangePassword} className="text-left space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-neutral-800">
              <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">修改密码</h3>
            </div>

            {error && (
              <div className="px-4 py-2.5 bg-red-50 dark:bg-red-950/45 border border-red-200/50 dark:border-red-900/30 rounded-xl text-xs text-red-600 dark:text-red-400 shadow-sm animate-in fade-in duration-200">
                {error}
              </div>
            )}

            {success && (
              <div className="px-4 py-2.5 bg-green-50 dark:bg-green-950/45 border border-green-200/50 dark:border-green-900/30 rounded-xl text-xs text-green-600 dark:text-green-400 shadow-sm animate-in fade-in duration-200">
                {success}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-neutral-400 mb-1 ml-1">原密码</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-800/40 border border-gray-200/80 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-neutral-200 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all duration-200"
                  placeholder="请输入当前密码"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-neutral-400 mb-1 ml-1">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-800/40 border border-gray-200/80 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-neutral-200 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all duration-200"
                  placeholder="请输入新密码"
                  required
                  minLength={6}
                  maxLength={32}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-neutral-400 mb-1 ml-1">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-neutral-800/40 border border-gray-200/80 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-neutral-200 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-neutral-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all duration-200"
                  placeholder="请再次输入新密码"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setView('confirm')}
                className="flex-1 py-3 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-850 dark:text-neutral-200 rounded-full transition-all duration-200 font-medium text-sm border border-gray-200 dark:border-neutral-700 text-center"
              >
                返回
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 active:bg-blue-800 text-white rounded-full transition-all duration-200 font-medium text-sm shadow-lg shadow-blue-100/50 dark:shadow-none hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '保存中...' : '确认修改'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

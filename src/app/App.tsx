import { Search, Mail, Youtube, Twitter, Github, Linkedin, Instagram, Facebook, ShoppingCart, Film, Music, MessageCircle, Video, MessageSquare, Slack, Dribbble, Settings, User, Plus, Edit3, X as XIcon, Save, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SearchEngineSelect, searchEngines } from './components/SearchEngineSelect';
import { SettingsDialog } from './components/SettingsDialog';
import { LoginDialog } from './components/LoginDialog';
import { AddShortcutDialog } from './components/AddShortcutDialog';
import { EditShortcutDialog } from './components/EditShortcutDialog';
import { authStore } from './stores/auth-store';

const defaultShortcuts = [
  // First row - 9 icons
  { name: 'Google', icon: Search, color: '#4285F4', url: 'https://google.com' },
  { name: 'YouTube', icon: Youtube, color: '#FF0000', url: 'https://youtube.com' },
  { name: 'Facebook', icon: Facebook, color: '#1877F2', url: 'https://facebook.com' },
  { name: 'Twitter', icon: Twitter, color: '#1DA1F2', url: 'https://twitter.com' },
  { name: 'Instagram', icon: Instagram, color: '#E4405F', url: 'https://instagram.com' },
  { name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', url: 'https://linkedin.com' },
  { name: 'GitHub', icon: Github, color: '#181717', url: 'https://github.com' },
  { name: 'Amazon', icon: ShoppingCart, color: '#FF9900', url: 'https://amazon.com' },
  { name: 'Netflix', icon: Film, color: '#E50914', url: 'https://netflix.com' },
  // Second row - 7 icons
  { name: 'Spotify', icon: Music, color: '#1DB954', url: 'https://spotify.com' },
  { name: 'Reddit', icon: MessageCircle, color: '#FF4500', url: 'https://reddit.com' },
  { name: 'Gmail', icon: Mail, color: '#EA4335', url: 'https://gmail.com' },
  { name: 'Twitch', icon: Video, color: '#9146FF', url: 'https://twitch.tv' },
  { name: 'Discord', icon: MessageSquare, color: '#5865F2', url: 'https://discord.com' },
  { name: 'Slack', icon: Slack, color: '#4A154B', url: 'https://slack.com' },
  { name: 'Dribbble', icon: Dribbble, color: '#EA4C89', url: 'https://dribbble.com' },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEngine, setSearchEngine] = useState('google');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAddShortcutOpen, setIsAddShortcutOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<{ index: number; shortcut: any } | null>(null);
  
  // Auth state from store
  const [authState, setAuthState] = useState(authStore.getState());
  
  useEffect(() => {
    const unsubscribe = authStore.subscribe((state) => {
      setAuthState(state);
    });
    return unsubscribe;
  }, []);

  const [shortcuts, setShortcuts] = useState(defaultShortcuts);
  const [tempShortcuts, setTempShortcuts] = useState(defaultShortcuts);
  const [backgroundImage, setBackgroundImage] = useState('https://images.unsplash.com/photo-1598439473183-42c9301db5dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2400');
  const [settings, setSettings] = useState({
    searchBoxWidth: 100,
    searchBoxHeight: 64,
    searchBoxMarginTop: 192,
    iconSize: 64,
    iconRadius: 50,
    iconSpacingX: 32,
    iconSpacingY: 48,
    iconTextGap: 12,
    textSize: 14,
    iconsMarginTop: 64,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const engine = searchEngines.find(e => e.value === searchEngine);
      if (engine) {
        window.location.href = `${engine.url}${encodeURIComponent(searchQuery)}`;
      }
    }
  };

  const handleLogin = async (username: string) => {
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    authStore.logout();
  };

  // On mount: try to fetch user info if token exists
  useEffect(() => {
    authStore.fetchUser();
  }, []);

  // Listen for forced logout from api-client
  useEffect(() => {
    const handler = () => authStore.logout();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const handleAddShortcuts = (newShortcuts: { name: string; icon: any; color: string; url: string }[]) => {
    setShortcuts([...shortcuts, ...newShortcuts]);
    setTempShortcuts([...shortcuts, ...newShortcuts]);
  };

  const handleStartEdit = () => {
    setTempShortcuts([...shortcuts]);
    setIsEditMode(true);
  };

  const handleSaveEdits = () => {
    setShortcuts([...tempShortcuts]);
    setIsEditMode(false);
  };

  const handleCancelEdits = () => {
    setTempShortcuts([...shortcuts]);
    setIsEditMode(false);
    setEditingShortcut(null);
  };

  const handleDeleteShortcut = (index: number) => {
    setTempShortcuts(tempShortcuts.filter((_, i) => i !== index));
  };

  const handleEditShortcut = (index: number) => {
    setEditingShortcut({ index, shortcut: tempShortcuts[index] });
  };

  const handleSaveEdit = (updatedShortcut: { name: string; url: string; iconUrl?: string }) => {
    if (editingShortcut) {
      const newShortcuts = [...tempShortcuts];
      newShortcuts[editingShortcut.index] = {
        ...newShortcuts[editingShortcut.index],
        name: updatedShortcut.name,
        url: updatedShortcut.url,
      };
      setTempShortcuts(newShortcuts);
      setEditingShortcut(null);
    }
  };

  const iconInnerSize = settings.iconSize * 0.5;
  const borderRadius = `${settings.iconRadius}%`;

  // Use tempShortcuts in edit mode, shortcuts otherwise
  const displayShortcuts = isEditMode ? tempShortcuts : shortcuts;

  return (
    <div className="size-full relative flex flex-col items-center justify-start overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full px-8" style={{ paddingTop: `${settings.searchBoxMarginTop}px` }}>
        {/* Search Box */}
        <form onSubmit={handleSearch} style={{ marginBottom: `${settings.iconsMarginTop}px` }}>
          <div className="relative mx-auto flex items-center" style={{ maxWidth: `${(settings.searchBoxWidth / 100) * 768}px` }}>
            {/* Search Input with embedded icons */}
            <div className="relative w-full">
              {/* Left: Search Engine Select */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <SearchEngineSelect value={searchEngine} onChange={setSearchEngine} />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索或输入网址..."
                className="w-full px-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white placeholder-white/70 text-lg outline-none focus:bg-white/25 focus:border-white/40 transition-all"
                style={{ height: `${settings.searchBoxHeight}px` }}
              />

              {/* Right: Search Button */}
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </form>

        {/* Shortcuts Grid */}
        <div className="flex flex-col items-center" style={{ gap: `${settings.iconSpacingY}px` }}>
          {/* Render all shortcuts dynamically */}
          {Array.from({ length: Math.ceil(displayShortcuts.length / 9) + 1 }, (_, rowIndex) => {
            const startIdx = rowIndex * 9;
            const endIdx = Math.min(startIdx + 9, displayShortcuts.length);
            const rowShortcuts = displayShortcuts.slice(startIdx, endIdx);

            // Show add button on the row after all shortcuts (but not in edit mode)
            const showAddButton = !isEditMode && (startIdx === displayShortcuts.length || (rowShortcuts.length > 0 && rowShortcuts.length < 9));

            if (rowShortcuts.length === 0 && !showAddButton) return null;

            return (
              <div key={rowIndex} className="flex items-center" style={{ gap: `${settings.iconSpacingX}px` }}>
                {rowShortcuts.map((shortcut, idx) => {
                  const globalIndex = startIdx + idx;
                  return (
                    <div
                      key={`${shortcut.name}-${globalIndex}`}
                      className="flex flex-col items-center group relative"
                      style={{ gap: `${settings.iconTextGap}px` }}
                    >
                      {/* Delete button in edit mode */}
                      {isEditMode && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteShortcut(globalIndex);
                          }}
                          className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all"
                        >
                          <XIcon className="w-3 h-3 text-white" strokeWidth={3} />
                        </button>
                      )}

                      <a
                        href={isEditMode ? undefined : shortcut.url}
                        target={isEditMode ? undefined : "_blank"}
                        rel={isEditMode ? undefined : "noopener noreferrer"}
                        onClick={(e) => {
                          if (isEditMode) {
                            e.preventDefault();
                            handleEditShortcut(globalIndex);
                          }
                        }}
                        className={`flex flex-col items-center ${isEditMode ? 'cursor-pointer' : ''}`}
                        style={{ gap: `${settings.iconTextGap}px` }}
                      >
                        <div
                          className="bg-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200"
                          style={{
                            width: `${settings.iconSize}px`,
                            height: `${settings.iconSize}px`,
                            borderRadius: borderRadius
                          }}
                        >
                          <shortcut.icon
                            style={{ color: shortcut.color, width: `${iconInnerSize}px`, height: `${iconInnerSize}px` }}
                            strokeWidth={2}
                          />
                        </div>
                        <span
                          className="text-white font-light tracking-wide drop-shadow-lg"
                          style={{ fontSize: `${settings.textSize}px` }}
                        >
                          {shortcut.name}
                        </span>
                      </a>
                    </div>
                  );
                })}

                {/* Add Shortcut Button */}
                {showAddButton && (
                  <button
                    onClick={() => setIsAddShortcutOpen(true)}
                    className="flex flex-col items-center group"
                    style={{ gap: `${settings.iconTextGap}px` }}
                  >
                    <div
                      className="bg-white/80 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 cursor-pointer hover:bg-white"
                      style={{
                        width: `${settings.iconSize}px`,
                        height: `${settings.iconSize}px`,
                        borderRadius: borderRadius
                      }}
                    >
                      <Plus
                        className="text-gray-400 group-hover:text-gray-600 transition-colors"
                        style={{ width: `${iconInnerSize}px`, height: `${iconInnerSize}px` }}
                        strokeWidth={2}
                      />
                    </div>
                    <span
                      className="text-white font-light tracking-wide drop-shadow-lg opacity-0"
                      style={{ fontSize: `${settings.textSize}px` }}
                    >
                      添加
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Right Controls */}
      <div className="fixed bottom-8 right-8 flex items-center gap-4 z-30">
        {/* Edit Mode Buttons */}
        {isEditMode ? (
          <>
            {/* Cancel Button */}
            <button
              onClick={handleCancelEdits}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <XCircle className="w-5 h-5 text-white" />
            </button>

            {/* Save Button */}
            <button
              onClick={handleSaveEdits}
              className="w-12 h-12 rounded-full bg-green-500 backdrop-blur-xl border border-green-400 flex items-center justify-center hover:bg-green-600 hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <Save className="w-5 h-5 text-white" />
            </button>
          </>
        ) : (
          <>
            {/* Edit Button */}
            <button
              onClick={handleStartEdit}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <Edit3 className="w-5 h-5 text-white" />
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>

            {/* Account Button */}
            <button
              onClick={() => authState.isLoggedIn ? handleLogout() : setIsLoginOpen(true)}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg relative"
            >
              {authState.isLoggedIn && authState.user ? (
                <span className="text-white text-sm font-medium">{authState.user.username.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
              {authState.isLoggedIn && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Dialogs */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        backgroundImage={backgroundImage}
        onBackgroundChange={setBackgroundImage}
      />
      <LoginDialog
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
      <AddShortcutDialog
        isOpen={isAddShortcutOpen}
        onClose={() => setIsAddShortcutOpen(false)}
        onAdd={handleAddShortcuts}
        iconSize={settings.iconSize}
        iconRadius={settings.iconRadius}
      />
      {editingShortcut && (
        <EditShortcutDialog
          isOpen={!!editingShortcut}
          onClose={() => setEditingShortcut(null)}
          onSave={handleSaveEdit}
          shortcut={editingShortcut.shortcut}
        />
      )}
    </div>
  );
}
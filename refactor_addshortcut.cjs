const fs = require('fs');
const path = 'E:/workspace/navatation/navatation-web/src/app/components/shortcut/AddShortcutDialog.tsx';
let code = fs.readFileSync(path, 'utf8');

const searchHookBlock = `  const [rowLoadingStatus, setRowLoadingStatus] = useState<Record<string, boolean>>({});
  const [rowDetectedIcons, setRowDetectedIcons] = useState<Record<string, string[]>>({});
  const rowDetectedIconsRef = useRef<Record<string, string[]>>({});
  const [isAllRefreshing, setIsAllRefreshing] = useState(false);

  useEffect(() => {
    rowDetectedIconsRef.current = rowDetectedIcons;
  }, [rowDetectedIcons]);`;

const hookReplacement = `  const {
    rowLoadingStatus,
    rowDetectedIcons,
    isAllRefreshing,
    setRowLoadingStatus,
    setRowDetectedIcons,
    handleDetectRowIcon,
    handleBatchRefreshCategoryIcons,
    handleBatchRefreshAllIcons
  } = useFaviconDetector(batchEditData, setBatchEditData, updateBatchEditSite);`;

code = code.replace(searchHookBlock, hookReplacement);

const regexFns = /  const handleDetectRowIcon = async [\s\S]*?setIsAllRefreshing\(false\);\n    }\n  };/m;
code = code.replace(regexFns, '');

const searchTabBlock = `                  <div className="p-8">
                    <div className="max-w-xl mx-auto space-y-6">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">网址链接 *</label>
                        <input
                          type="text"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          onBlur={() => !iconFromUpload && triggerSearch(customUrl)}
                          placeholder="https://example.com"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-blue-500 focus:bg-card transition-all placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">网址名称 *</label>
                        <input
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="网站名称"
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:border-blue-500 focus:bg-card transition-all placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                          网址图标链接
                        </label>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={customIconUrl}
                              onChange={(e) => {
                                setCustomIconUrl(e.target.value);
                                if (e.target.value) {
                                  setFaviconStatus('idle');
                                  setIconFromUpload(false);
                                }
                              }}
                              readOnly={detectedIcons.length > 0 && detectedIcons.includes(customIconUrl)}
                              placeholder="https://example.com/icon.png"
                              className={\`w-full px-4 py-3 pr-10 bg-background border border-border rounded-xl outline-none transition-all h-[46px] \${
                                detectedIcons.length > 0 && detectedIcons.includes(customIconUrl)
                                  ? 'text-gray-400 cursor-text'
                                  : 'text-foreground focus:border-blue-500 focus:bg-card placeholder-gray-400 dark:placeholder-gray-500'
                              }\`}
                              disabled={!!customIconFile}
                              title={(detectedIcons.length > 0 && detectedIcons.includes(customIconUrl)) ? "搜索结果不可编辑，可双击复制" : "网址图标链接"}
                            />
                            {(faviconStatus === 'loading' || faviconStatus === 'uploading') && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
                            )}
                            {faviconStatus === 'detected' && (
                              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                            )}
                            {faviconStatus === 'error' && (
                              <Link className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setCustomIconUrl('');
                              setDetectedIcons([]);
                              setIconFromUpload(false);
                              setCustomIconFile(null);
                              setTimeout(() => {
                                triggerSearch(customUrl);
                              }, 0);
                            }}
                            disabled={!isValidDomainOrUrl(customUrl) || faviconStatus === 'loading' || faviconStatus === 'uploading'}
                            className="p-3 bg-background border border-border hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer h-[46px] w-[46px] flex-shrink-0"
                            title="重新检测网址图标"
                          >
                            <RotateCw className={\`w-4 h-4 \${faviconStatus === 'loading' ? 'animate-spin' : ''}\`} />
                          </button>

                          <label className={\`px-4 py-3 rounded-xl cursor-pointer flex items-center gap-2 transition-colors h-[46px] flex-shrink-0 \${
                              faviconStatus === 'uploading'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 cursor-not-allowed'
                                : 'bg-background border border-border hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'
                            }\`}>
                            {faviconStatus === 'uploading' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span className="text-sm">{faviconStatus === 'uploading' ? '上传中' : '上传'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCustomIconUpload}
                              className="hidden"
                              disabled={faviconStatus === 'uploading'}
                            />
                          </label>
                        </div>
                        {detectedIcons.length > 0 && (
                          <div className="mt-3">
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-neutral-800">
                              {detectedIcons.map((url, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCustomIconUrl(url);
                                  }}
                                  className={\`w-12 h-12 flex-shrink-0 bg-card shadow-sm border rounded-xl flex items-center justify-center overflow-hidden transition-all cursor-pointer \${
                                    customIconUrl === url ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-border hover:border-gray-400 dark:hover:border-gray-500'
                                  }\`}
                                >
                                  <img
                                    src={url}
                                    alt="Icon Option"
                                    className="w-6 h-6 object-contain"
                                  />
                                </button>
                              ))}
                              {customIconUrl && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCustomIconUrl('');
                                    setDetectedIcons([]);
                                    setIconFromUpload(false);
                                  }}
                                  className="w-12 h-12 flex-shrink-0 bg-red-50/50 dark:bg-red-950/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                                  title="清除图标"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
                              <span>*</span> 提示：可点击上方检测出的图标进行切换选择
                            </p>
                          </div>
                        )}
                        {uploadError && (
                          <p className="mt-2 text-xs text-red-500">{uploadError}</p>
                        )}
                      </div>

                      <button
                        onClick={handleAddCustomToPending}
                        disabled={!customName.trim() || !customUrl.trim()}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:bg-gray-200 dark:disabled:bg-neutral-800 disabled:text-gray-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed cursor-pointer"
                      >
                        添加到本次
                      </button>
                    </div>
                  </div>`;

const tabReplacement = `                  <CustomShortcutTab
                    customName={customName}
                    setCustomName={setCustomName}
                    customUrl={customUrl}
                    setCustomUrl={setCustomUrl}
                    customIconUrl={customIconUrl}
                    setCustomIconUrl={setCustomIconUrl}
                    faviconStatus={faviconStatus}
                    detectedIcons={detectedIcons}
                    iconFromUpload={iconFromUpload}
                    uploadError={uploadError}
                    handleCustomIconUpload={handleCustomIconUpload}
                    handleAddCustomToPending={handleAddCustomToPending}
                    iconRadius={iconRadius}
                  />`;

code = code.replace(searchTabBlock, tabReplacement);

fs.writeFileSync(path, code);
console.log('Refactored AddShortcutDialog.tsx successfully.');

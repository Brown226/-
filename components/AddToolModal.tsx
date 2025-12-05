
import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, Loader2, FileText, Paperclip } from 'lucide-react';
import { Tool, ToolVersion, UserRole } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: Partial<Tool>, version: ToolVersion, isUpdate: boolean) => void;
  existingTool?: Tool;
}

export const AddToolModal: React.FC<AddToolModalProps> = ({ isOpen, onClose, onSave, existingTool }) => {
  const [name, setName] = useState(existingTool?.name || '');
  const [description, setDescription] = useState(existingTool?.description || '');
  const [category, setCategory] = useState<string>('');
  
  const [versionNumber, setVersionNumber] = useState('');
  const [changelog, setChangelog] = useState('');
  
  const [toolFile, setToolFile] = useState<File | null>(null);
  const [manualFile, setManualFile] = useState<File | null>(null);

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Fetch categories on mount
  useEffect(() => {
    const cats = storageService.getCategories();
    setAvailableCategories(cats);
    if (existingTool) {
      setCategory(existingTool.category);
    } else {
      setCategory(cats[0] || '效率工具');
    }
  }, [existingTool, isOpen]);

  if (!isOpen) return null;

  const handleEnhance = async (field: 'desc' | 'changelog') => {
    const text = field === 'desc' ? description : changelog;
    if (!text) return;
    
    setIsEnhancing(true);
    try {
      const enhanced = await geminiService.enhanceText(text, field === 'desc' ? 'description' : 'changelog');
      if (field === 'desc') setDescription(enhanced);
      else setChangelog(enhanced);
    } catch (e) {
      alert("AI 文本优化失败，请检查 API Key 配置。");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVersion: ToolVersion = {
      id: `v-${Date.now()}`,
      version: versionNumber,
      changelog,
      fileUrl: '#mock-file-url',
      manualUrl: manualFile ? '#mock-manual-url' : undefined,
      createdAt: new Date().toISOString(),
      size: toolFile ? `${(toolFile.size / 1024 / 1024).toFixed(2)} MB` : '1.5 MB'
    };

    const toolData: Partial<Tool> = {
      name,
      description,
      category,
      icon: existingTool?.icon || '📦'
    };

    onSave(toolData, newVersion, !!existingTool);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">
            {existingTool ? `更新版本：${existingTool.name}` : '上传新工具'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Tool Info (Only if new) */}
          {!existingTool && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">工具名称</label>
                  <input 
                    required 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例如：日志分析助手 Pro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">所属分类</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  >
                    {availableCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">工具简介</label>
                  <button 
                    type="button"
                    onClick={() => handleEnhance('desc')}
                    disabled={isEnhancing || !description}
                    className="text-xs flex items-center text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                  >
                    {isEnhancing ? <Loader2 size={12} className="animate-spin mr-1"/> : <Sparkles size={12} className="mr-1"/>}
                    AI 润色
                  </button>
                </div>
                <textarea 
                  required
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  placeholder="简要描述这个工具的主要功能..."
                />
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4">
             <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">版本信息</h4>
             
             <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">版本号</label>
                  <input 
                    required 
                    type="text" 
                    value={versionNumber}
                    onChange={e => setVersionNumber(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：1.2.0"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">程序文件 (支持 .zip, .exe 等)</label>
                  <div className="relative">
                     <input 
                      required={!existingTool}
                      type="file" 
                      onChange={e => setToolFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
             </div>

             <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">使用说明书 (可选，用于帮助用户)</label>
                <div className="flex items-center space-x-2 border border-slate-300 rounded-lg p-2 bg-slate-50">
                   <Paperclip size={18} className="text-slate-400" />
                   <input 
                      type="file" 
                      accept=".pdf,.md,.docx"
                      onChange={e => setManualFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-500 file:hidden"
                    />
                    {manualFile ? (
                      <span className="text-xs font-semibold text-emerald-600 px-2">{manualFile.name}</span>
                    ) : (
                      <span className="text-xs text-slate-400 px-2">点击上传说明书 (.pdf, .md, 或 .docx)</span>
                    )}
                </div>
             </div>

             <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">更新日志 (Changelog)</label>
                  <button 
                    type="button"
                    onClick={() => handleEnhance('changelog')}
                    disabled={isEnhancing || !changelog}
                    className="text-xs flex items-center text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                  >
                    {isEnhancing ? <Loader2 size={12} className="animate-spin mr-1"/> : <Sparkles size={12} className="mr-1"/>}
                    AI 生成日志
                  </button>
                </div>
                <textarea 
                  required
                  rows={4}
                  value={changelog}
                  onChange={e => setChangelog(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="- 修复了若干已知问题&#10;- 优化了用户体验"
                />
              </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg mr-2 transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg shadow-blue-200"
            >
              <Upload size={18} className="mr-2" />
              {existingTool ? '发布新版本' : '确认上传'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

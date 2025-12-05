import React from 'react';
import { X, FileText, Download } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose, title, url }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
               <FileText size={20} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <p className="text-xs text-slate-500">在线预览模式</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 bg-slate-100 overflow-hidden relative flex flex-col items-center justify-center">
            {/* Simulation of a PDF Viewer */}
            <div className="w-full h-full p-8 overflow-y-auto">
               <div className="max-w-3xl mx-auto bg-white shadow-lg min-h-full p-12 text-slate-800">
                  <h1 className="text-3xl font-bold mb-6 border-b pb-4">{title.replace('.pdf', '')}</h1>
                  
                  <div className="space-y-4 text-slate-600 leading-relaxed">
                     <p><strong>注意：</strong> 这是一个模拟的说明书预览界面。</p>
                     <p>在实际生产环境中，此处将嵌入 PDF 阅读器（如 PDF.js）或 Markdown 渲染器来展示真实文件。</p>
                     
                     <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. 简介</h2>
                     <p>本工具旨在帮助团队成员更高效地解决日常开发中的问题...</p>
                     
                     <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. 安装步骤</h2>
                     <ul className="list-disc pl-5 space-y-2">
                        <li>下载最新版本的安装包。</li>
                        <li>运行安装程序并按照提示操作。</li>
                        <li>配置必要的环境变量（如 API Key）。</li>
                     </ul>

                     <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. 常见问题</h2>
                     <p>如果遇到启动失败，请检查端口是否被占用...</p>

                     <div className="mt-12 p-4 bg-slate-50 border border-slate-200 rounded text-sm text-slate-500 text-center">
                        (文档预览结束)
                     </div>
                  </div>
               </div>
            </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl flex justify-end">
           <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg mr-2">关闭</button>
           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700">
              <Download size={16} className="mr-2"/> 下载原文件
           </button>
        </div>
      </div>
    </div>
  );
};

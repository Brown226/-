import React from 'react';
import { Tool } from '../types';
import { Download, Clock, ChevronRight } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
  onClick: (tool: Tool) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  const latestVersion = tool.versions.length > 0 ? tool.versions[tool.versions.length - 1] : null;

  return (
    <div 
      onClick={() => onClick(tool)}
      className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
            {tool.icon || '🛠️'}
          </div>
          <span className="px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded-full">
            {tool.category}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
          {tool.name}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 rounded-b-xl">
        <div className="flex items-center space-x-1">
          <Clock size={14} />
          <span>{latestVersion ? `v${latestVersion.version}` : '暂无版本'}</span>
        </div>
        <div className="flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          查看详情 <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { LogOut, LayoutGrid, User as UserIcon, Users, MessageSquareText, ShieldAlert, Atom, Tags } from 'lucide-react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  title?: string;
  currentRoute?: string;
  onNavigate?: (route: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, title, currentRoute, onNavigate }) => {
  const hasWriteAccess = storageService.hasWriteAccess(user);
  const roleName = {
    [UserRole.ADMIN]: '超级管理员',
    [UserRole.SECONDARY_ADMIN]: '二级管理员',
    [UserRole.USER]: '普通用户'
  }[user?.role || UserRole.USER];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Security Warning Bar (Compliance) - Updated Color */}
      <div className="bg-red-950/95 text-red-50 text-center py-1.5 text-xs font-bold tracking-wider uppercase shadow-md z-50 flex items-center justify-center border-b border-red-900">
         <ShieldAlert className="w-4 h-4 mr-2 text-yellow-500" />
         本系统严禁上传和处理涉密信息
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-32px)]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col shadow-xl z-20 shrink-0">
          <div className="p-6 border-b border-slate-700 flex items-center space-x-3">
            {/* 2. CNNC Logo & Branding */}
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative group">
               <img 
                 src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/China_National_Nuclear_Corporation_logo.svg/200px-China_National_Nuclear_Corporation_logo.svg.png" 
                 alt="CNNC" 
                 className="w-8 h-8 object-contain z-10 relative"
                 onError={(e) => {
                   e.currentTarget.style.display = 'none';
                 }}
               />
               <Atom className="text-blue-900 w-6 h-6 absolute" /> {/* Fallback icon */}
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white leading-tight">
                数智工具港
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">中核集团 | CNNC</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button 
              onClick={() => onNavigate && onNavigate('DASHBOARD')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${currentRoute === 'DASHBOARD' ? 'bg-blue-700 text-white shadow-lg shadow-blue-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <LayoutGrid size={20} />
              <span className="font-medium">工具列表</span>
            </button>
            
            {hasWriteAccess && (
              <>
                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  管理中心
                </div>
                <button 
                  onClick={() => onNavigate && onNavigate('USER_MANAGE')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${currentRoute === 'USER_MANAGE' ? 'bg-blue-700 text-white shadow-lg shadow-blue-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  <Users size={20} />
                  <span className="font-medium">用户管理</span>
                </button>
                <button 
                  onClick={() => onNavigate && onNavigate('CATEGORY_MANAGE')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${currentRoute === 'CATEGORY_MANAGE' ? 'bg-blue-700 text-white shadow-lg shadow-blue-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  <Tags size={20} />
                  <span className="font-medium">分类管理</span>
                </button>
                <button 
                  onClick={() => onNavigate && onNavigate('FEEDBACK_MANAGE')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${currentRoute === 'FEEDBACK_MANAGE' ? 'bg-blue-700 text-white shadow-lg shadow-blue-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  <MessageSquareText size={20} />
                  <span className="font-medium">反馈中心</span>
                </button>
              </>
            )}

            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              当前账户
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-slate-600" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  <UserIcon size={16} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.realName || user?.username}</p>
                <p className="text-xs text-slate-400 truncate">
                  {roleName}
                </p>
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-slate-700">
            <button 
              onClick={onLogout}
              className="flex items-center space-x-3 text-slate-400 hover:text-red-400 w-full p-2 transition-colors text-sm"
            >
              <LogOut size={18} />
              <span>退出登录</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden relative">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
            <h2 className="text-xl font-semibold text-slate-800">{title || '仪表盘'}</h2>
            
            {/* Action Area */}
            <div className="flex items-center space-x-4">
              {hasWriteAccess && (
                <span className={`hidden md:inline text-xs font-medium px-2 py-1 rounded border ${user?.role === UserRole.ADMIN ? 'text-purple-600 bg-purple-50 border-purple-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                  {roleName}模式
                </span>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6 relative">
            <div className="max-w-7xl mx-auto w-full pb-10">
              {children}
            </div>
          </div>
          
          {/* 3. Department Signature Watermark (Bottom LEFT) - Updated Position */}
          <div className="absolute bottom-4 left-6 pointer-events-none z-0 opacity-40 select-none">
             <div className="flex items-center space-x-2 text-slate-500">
                <Atom size={16} />
                <span className="text-xs font-bold tracking-wide">设计管理部数字化管理科出品</span>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

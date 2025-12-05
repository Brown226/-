
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { User, Tool, UserRole, ToolVersion, Feedback, DownloadLog } from './types';
import { storageService } from './services/storageService';
import { ToolCard } from './components/ToolCard';
import { AddToolModal } from './components/AddToolModal';
import { ManualModal } from './components/ManualModal';
import { Search, Plus, FileText, Download, ArrowLeft, History, Archive, ShieldAlert, Star, Send, Eye, Calendar, User as UserIcon, MessageSquare, TrendingUp, AlertCircle, Shield, Check, Atom, Trash2, Tag } from 'lucide-react';

type Route = 'LOGIN' | 'REGISTER' | 'DASHBOARD' | 'TOOL_DETAIL' | 'USER_MANAGE' | 'FEEDBACK_MANAGE' | 'CATEGORY_MANAGE';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [route, setRoute] = useState<Route>('LOGIN');
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | undefined>(undefined);

  // Manual Viewer State
  const [manualViewer, setManualViewer] = useState<{isOpen: boolean, title: string, url: string}>({
    isOpen: false, title: '', url: ''
  });

  // Feedback Form State
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [toolFeedbacks, setToolFeedbacks] = useState<Feedback[]>([]);

  // Admin Data State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserLogs, setSelectedUserLogs] = useState<{user: User, logs: DownloadLog[]} | null>(null);
  const [allFeedbacks, setAllFeedbacks] = useState<Feedback[]>([]);

  // Category Manage State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRealName, setAuthRealName] = useState('');
  const [authDepartment, setAuthDepartment] = useState('');
  const [authError, setAuthError] = useState('');

  // Permissions
  const hasWriteAccess = storageService.hasWriteAccess(user);
  const hasRootAccess = storageService.hasRootAccess(user);

  useEffect(() => {
    const currentUser = storageService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setRoute('DASHBOARD');
    }
    setTools(storageService.getTools());
    setAvailableCategories(storageService.getCategories());
  }, []);

  // Fetch data when route changes
  useEffect(() => {
    if (route === 'USER_MANAGE' && hasWriteAccess) {
      setAllUsers(storageService.getUsers());
    }
    if (route === 'FEEDBACK_MANAGE' && hasWriteAccess) {
      setAllFeedbacks(storageService.getFeedback());
    }
    if (route === 'CATEGORY_MANAGE' && hasWriteAccess) {
      setAvailableCategories(storageService.getCategories());
    }
    if (route === 'DASHBOARD') {
      setTools(storageService.getTools());
      setAvailableCategories(storageService.getCategories());
    }
  }, [route, hasWriteAccess]);

  // Fetch feedbacks when tool is selected
  useEffect(() => {
    if (selectedToolId) {
      setToolFeedbacks(storageService.getFeedback(selectedToolId));
    }
  }, [selectedToolId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPassword) {
      setAuthError('请输入密码');
      return;
    }
    const foundUser = storageService.login(authEmail, authPassword);
    if (foundUser) {
      setUser(foundUser);
      storageService.setCurrentUser(foundUser);
      setRoute('DASHBOARD');
      setAuthError('');
      setAuthPassword('');
    } else {
      setAuthError('邮箱或密码错误');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPassword) {
      setAuthError('请设置密码');
      return;
    }
    if (!authRealName || !authDepartment) {
      setAuthError('请完善个人信息（姓名和部门）');
      return;
    }

    const users = storageService.getUsers();
    if (users.some(u => u.email === authEmail)) {
      setAuthError('该邮箱已被注册，请直接登录。');
      return;
    }
    const newUser: User = {
      id: `u-${Date.now()}`,
      username: authEmail.split('@')[0],
      email: authEmail,
      realName: authRealName,
      department: authDepartment,
      password: authPassword,
      role: users.length === 0 ? UserRole.ADMIN : UserRole.USER,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authEmail}`,
      joinedAt: new Date().toISOString()
    };
    storageService.registerUser(newUser);
    setUser(newUser);
    storageService.setCurrentUser(newUser);
    setRoute('DASHBOARD');
    setAuthError('');
    setAuthPassword('');
    setAuthRealName('');
    setAuthDepartment('');
  };

  const handleLogout = () => {
    setUser(null);
    storageService.setCurrentUser(null);
    setRoute('LOGIN');
    setAuthEmail('');
    setAuthPassword('');
  };

  const handleChangeRole = (targetUserId: string, newRole: UserRole) => {
    if (!hasRootAccess) {
      alert("权限不足：只有超级管理员可以修改用户角色。");
      return;
    }
    if (targetUserId === user?.id) {
       alert("为了安全起见，您不能修改自己的管理员权限。");
       return;
    }
    storageService.updateUserRole(targetUserId, newRole);
    setAllUsers(storageService.getUsers()); // Refresh list
  };

  const handleViewManual = (url: string, title: string) => {
    if (user && selectedToolId) {
      const tool = tools.find(t => t.id === selectedToolId);
      if (tool) {
        storageService.addDownloadLog({
          id: `l-${Date.now()}`,
          userId: user.id,
          username: user.username,
          toolId: tool.id,
          toolName: tool.name,
          version: title.split('-v')[1]?.split('-')[0] || 'Unknown',
          type: '说明书',
          downloadedAt: new Date().toISOString()
        });
      }
    }
    setManualViewer({ isOpen: true, title, url });
  };

  const handleDownload = (fileUrl: string, fileName: string, fileType: '软件' | '说明书', versionStr: string) => {
    if (user && selectedToolId) {
      const tool = tools.find(t => t.id === selectedToolId);
      if (tool) {
        storageService.addDownloadLog({
          id: `l-${Date.now()}`,
          userId: user.id,
          username: user.username,
          toolId: tool.id,
          toolName: tool.name,
          version: versionStr,
          type: fileType,
          downloadedAt: new Date().toISOString()
        });
      }
    }
    alert(`正在开始下载${fileType}：\n${fileName}\n\n(模拟下载链接: ${fileUrl})\n\n后台已记录此次下载操作。`);
  };

  const handleSaveTool = (toolData: Partial<Tool>, version: ToolVersion, isUpdate: boolean) => {
    if (!hasWriteAccess) {
      alert("权限不足：只有管理员可以执行此操作。");
      return;
    }

    if (isUpdate && editingTool) {
      const updatedTool: Tool = {
        ...editingTool,
        ...toolData,
        updatedAt: new Date().toISOString(),
        versions: [...editingTool.versions, version]
      };
      storageService.saveTool(updatedTool);
    } else if (user) {
      const newTool: Tool = {
        id: `t-${Date.now()}`,
        name: toolData.name!,
        description: toolData.description!,
        category: toolData.category!,
        versions: [version],
        authorId: user.id,
        updatedAt: new Date().toISOString(),
        icon: toolData.icon
      };
      storageService.saveTool(newTool);
    }
    setTools(storageService.getTools());
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    storageService.addCategory(newCategoryName.trim());
    setAvailableCategories(storageService.getCategories());
    setNewCategoryName('');
  };

  const handleDeleteCategory = (catName: string) => {
    // Check if used
    const isUsed = tools.some(t => t.category === catName);
    if (isUsed) {
      alert(`无法删除分类 "${catName}"，因为它已被使用。请先修改相关工具的分类。`);
      return;
    }
    if (confirm(`确定要删除分类 "${catName}" 吗？`)) {
      storageService.deleteCategory(catName);
      setAvailableCategories(storageService.getCategories());
    }
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedToolId) return;

    const newFeedback: Feedback = {
      id: `f-${Date.now()}`,
      toolId: selectedToolId,
      userId: user.id,
      username: user.username,
      rating: feedbackRating,
      content: feedbackContent,
      createdAt: new Date().toISOString()
    };
    storageService.addFeedback(newFeedback);
    setToolFeedbacks([newFeedback, ...toolFeedbacks]);
    setFeedbackContent('');
    setFeedbackRating(5);
  };

  const filteredTools = tools.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedTool = tools.find(t => t.id === selectedToolId);

  // --- RENDER ---

  if (route === 'LOGIN' || route === 'REGISTER') {
     return (
      <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518364538800-6bae3c2db0f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
        </div>

        {/* Security Banner */}
        <div className="absolute top-0 w-full bg-red-950/90 text-red-50 text-center py-2 text-xs font-bold tracking-wider uppercase shadow-md flex items-center justify-center border-b border-red-800 z-50">
           <ShieldAlert className="w-4 h-4 mr-2 text-yellow-500" />
           本系统严禁上传和处理涉密信息
        </div>

        {/* Auth Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10 mx-4">
            <div className="text-center mb-8">
              {/* Login Logo Area */}
              <div className="mx-auto w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <img 
                   src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/China_National_Nuclear_Corporation_logo.svg/200px-China_National_Nuclear_Corporation_logo.svg.png" 
                   alt="CNNC" 
                   className="w-10 h-10 object-contain"
                   onError={(e) => { e.currentTarget.style.display = 'none'; }}
                 />
                 <Atom className="text-blue-900 w-8 h-8 absolute opacity-20" /> 
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">数智工具港</h1>
              <p className="text-xs text-blue-200 font-bold uppercase tracking-widest mb-4">中核集团 | CNNC</p>

              <p className="text-slate-300">
                {route === 'LOGIN' ? '请登录以访问内部资源' : '创建新的团队成员账户'}
              </p>
            </div>

            <form onSubmit={route === 'LOGIN' ? handleLogin : handleRegister} className="space-y-4">
              
              {route === 'REGISTER' && (
                <>
                   <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">真实姓名</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition-all"
                      placeholder="例如：张三"
                      value={authRealName}
                      onChange={e => setAuthRealName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">部门名称</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition-all"
                      placeholder="例如：数字化管理科"
                      value={authDepartment}
                      onChange={e => setAuthDepartment(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">电子邮箱</label>
                <input 
                  type="email" 
                  required 
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition-all"
                  placeholder="name@team.com"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">密码</label>
                <input 
                  type="password" 
                  required 
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                />
              </div>
              {authError && <p className="text-red-300 text-sm bg-red-900/50 border border-red-800 p-2 rounded flex items-center"><AlertCircle size={14} className="mr-1"/> {authError}</p>}
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-900/50 mt-2">
                {route === 'LOGIN' ? '立即登录' : '注册账户'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <button onClick={() => { setRoute(route === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setAuthError(''); setAuthPassword(''); }} className="text-blue-300 hover:text-white hover:underline transition-colors">
                {route === 'LOGIN' ? "没有账号？点击注册" : "已有账号？点击登录"}
              </button>
            </div>
        </div>

        {/* Department Signature Watermark (Bottom Left) */}
        <div className="absolute bottom-4 left-6 text-white/40 flex items-center space-x-2 select-none z-10">
            <Atom size={14} />
            <span className="text-xs font-medium">设计管理部数字化管理科出品</span>
        </div>
      </div>
    );
  }

  // --- ADMIN: CATEGORY MANAGEMENT ---
  if (route === 'CATEGORY_MANAGE' && hasWriteAccess) {
    return (
      <Layout user={user} onLogout={handleLogout} title="分类管理" currentRoute={route} onNavigate={setRoute}>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">添加新分类</h3>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="输入分类名称..."
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                添加
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-200 font-medium text-slate-700">
               现有分类列表
             </div>
             <div className="divide-y divide-slate-100">
               {availableCategories.map((cat, idx) => (
                 <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
                   <div className="flex items-center space-x-3">
                     <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                       <Tag size={18} />
                     </div>
                     <span className="font-medium text-slate-800">{cat}</span>
                   </div>
                   <button 
                    onClick={() => handleDeleteCategory(cat)}
                    className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除分类"
                   >
                     <Trash2 size={18} />
                   </button>
                 </div>
               ))}
               {availableCategories.length === 0 && (
                 <div className="p-8 text-center text-slate-400">暂无分类</div>
               )}
             </div>
          </div>
        </div>
      </Layout>
    );
  }

  // --- ADMIN: USER MANAGEMENT ---
  if (route === 'USER_MANAGE' && hasWriteAccess) {
    return (
      <Layout user={user} onLogout={handleLogout} title="用户管理" currentRoute={route} onNavigate={setRoute}>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {selectedUserLogs ? (
             <div className="p-6">
                <button onClick={() => setSelectedUserLogs(null)} className="mb-4 flex items-center text-slate-500 hover:text-slate-800">
                  <ArrowLeft size={16} className="mr-1"/> 返回用户列表
                </button>
                <div className="flex items-center space-x-3 mb-6 p-4 bg-slate-50 rounded-lg">
                   <img src={selectedUserLogs.user.avatar} className="w-12 h-12 rounded-full" alt="avatar"/>
                   <div>
                      <h3 className="font-bold text-lg">{selectedUserLogs.user.realName || selectedUserLogs.user.username}</h3>
                      <p className="text-sm text-slate-500">{selectedUserLogs.user.department} | {selectedUserLogs.user.email}</p>
                   </div>
                </div>
                <h4 className="font-bold text-slate-800 mb-4 flex items-center"><History size={18} className="mr-2"/> 下载记录</h4>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                         <tr>
                            <th className="p-3">工具名称</th>
                            <th className="p-3">版本</th>
                            <th className="p-3">类型</th>
                            <th className="p-3">时间</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {selectedUserLogs.logs.length > 0 ? selectedUserLogs.logs.map(log => (
                           <tr key={log.id}>
                              <td className="p-3 font-medium">{log.toolName}</td>
                              <td className="p-3">{log.version}</td>
                              <td className="p-3">
                                 <span className={`px-2 py-0.5 rounded text-xs ${log.type === '软件' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                   {log.type}
                                 </span>
                              </td>
                              <td className="p-3 text-slate-500">{new Date(log.downloadedAt).toLocaleString()}</td>
                           </tr>
                         )) : (
                            <tr><td colSpan={4} className="p-4 text-center text-slate-400">暂无下载记录</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-4">姓名 / 部门</th>
                    <th className="p-4">账号信息</th>
                    <th className="p-4">当前角色</th>
                    {hasRootAccess && <th className="p-4">权限设置</th>}
                    <th className="p-4">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                           <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-slate-200"/>
                           <div>
                              <div className="font-bold text-slate-900">{u.realName || u.username}</div>
                              <div className="text-xs text-slate-500">{u.department || '未填写'}</div>
                           </div>
                        </div>
                      </td>
                      <td className="p-4">
                         <div className="text-sm text-slate-900">{u.username}</div>
                         <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold 
                          ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 
                            u.role === UserRole.SECONDARY_ADMIN ? 'bg-emerald-100 text-emerald-700' : 
                            'bg-slate-100 text-slate-600'}`}>
                          {u.role === UserRole.ADMIN ? '超级管理员' : u.role === UserRole.SECONDARY_ADMIN ? '二级管理员' : '普通用户'}
                        </span>
                      </td>
                      {hasRootAccess && (
                        <td className="p-4">
                          <select 
                            disabled={u.id === user?.id}
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                            className="bg-white border border-slate-300 rounded text-sm px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:bg-slate-100"
                          >
                            <option value={UserRole.USER}>普通用户</option>
                            <option value={UserRole.SECONDARY_ADMIN}>二级管理员</option>
                            <option value={UserRole.ADMIN}>超级管理员</option>
                          </select>
                        </td>
                      )}
                      <td className="p-4">
                        <button 
                          onClick={() => setSelectedUserLogs({ user: u, logs: storageService.getDownloadLogs(u.id) })}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                        >
                          查看下载记录
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!hasRootAccess && (
                 <div className="p-4 bg-yellow-50 text-yellow-800 text-sm text-center border-t border-yellow-100">
                    <Shield size={14} className="inline mr-1"/>
                    您是二级管理员：您可以查看用户信息和日志，但无权修改用户角色。
                 </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // --- ADMIN: FEEDBACK MANAGEMENT ---
  if (route === 'FEEDBACK_MANAGE' && hasWriteAccess) {
     const feedbackGroups: Record<string, Feedback[]> = {};
     allFeedbacks.forEach(fb => {
        if (!feedbackGroups[fb.toolId]) {
           feedbackGroups[fb.toolId] = [];
        }
        feedbackGroups[fb.toolId].push(fb);
     });
     const toolIds = Object.keys(feedbackGroups);

     return (
        <Layout user={user} onLogout={handleLogout} title="反馈中心" currentRoute={route} onNavigate={setRoute}>
           <div className="space-y-8 pb-10">
              {toolIds.length === 0 && (
                 <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <MessageSquare className="mx-auto text-slate-300 mb-3" size={48}/>
                    <h3 className="text-lg font-medium text-slate-900">暂无任何反馈</h3>
                    <p className="text-slate-500">用户提交的评价将会显示在这里</p>
                 </div>
              )}

              {toolIds.map(toolId => {
                 const tool = tools.find(t => t.id === toolId);
                 const feedbacks = feedbackGroups[toolId];
                 const avgRating = (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1);
                 
                 return (
                    <div key={toolId} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                       {/* Tool Header */}
                       <div className="p-5 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                             <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200 text-2xl shadow-sm">
                                {tool?.icon || '📦'}
                             </div>
                             <div>
                                <h3 className="text-lg font-bold text-slate-900">{tool?.name || '已删除的工具'}</h3>
                                <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full mt-1">
                                  {tool?.category || '未知分类'}
                                </span>
                             </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                             <div className="flex items-center space-x-2">
                                <TrendingUp className="text-blue-500" size={18} />
                                <div>
                                   <div className="text-xs text-slate-500">平均评分</div>
                                   <div className="font-bold text-slate-900 flex items-center">
                                      {avgRating} <Star size={12} className="ml-1 text-yellow-400 fill-yellow-400"/>
                                   </div>
                                </div>
                             </div>
                             <div className="h-8 w-px bg-slate-300 hidden md:block"></div>
                             <div>
                                <div className="text-xs text-slate-500">反馈总数</div>
                                <div className="font-bold text-slate-900">{feedbacks.length} 条</div>
                             </div>
                          </div>
                       </div>
                       <div className="divide-y divide-slate-100">
                          {feedbacks.map(fb => (
                             <div key={fb.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                   <div className="flex items-center space-x-2">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                         <UserIcon size={14} className="text-slate-500"/>
                                      </div>
                                      <div>
                                         <p className="text-sm font-bold text-slate-900">{fb.username}</p>
                                         <p className="text-xs text-slate-400">{new Date(fb.createdAt).toLocaleString()}</p>
                                      </div>
                                   </div>
                                   <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                         <Star key={i} size={14} fill={i < fb.rating ? "currentColor" : "none"} className={i < fb.rating ? "text-yellow-400" : "text-slate-200"} />
                                      ))}
                                   </div>
                                </div>
                                <div className="pl-10">
                                   <p className="text-slate-700 text-sm leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                      {fb.content}
                                   </p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 );
              })}
           </div>
        </Layout>
     )
  }

  // --- TOOL DETAIL VIEW ---
  if (selectedToolId && selectedTool) {
    return (
      <Layout user={user} onLogout={handleLogout} title="工具详情" currentRoute={route} onNavigate={(r) => {setSelectedToolId(null); setRoute(r);}}>
         <div className="animate-fade-in pb-10">
          <button onClick={() => setSelectedToolId(null)} className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={18} className="mr-2" /> 返回列表
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Info Card */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-4xl border border-blue-100">
                      {selectedTool.icon || '🛠️'}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900">{selectedTool.name}</h1>
                      <span className="inline-block px-3 py-1 mt-2 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                        {selectedTool.category}
                      </span>
                    </div>
                  </div>
                  {hasWriteAccess && (
                    <button 
                      onClick={() => { setEditingTool(selectedTool); setIsModalOpen(true); }}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                    >
                      <Plus size={16} />
                      <span>发布新版本</span>
                    </button>
                  )}
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">工具介绍</h3>
                  <p className="text-slate-600 leading-relaxed">{selectedTool.description}</p>
                </div>
              </div>

              {/* Version History */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
                  <History className="text-slate-400" />
                  <h3 className="font-bold text-slate-900">版本历史记录</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {[...selectedTool.versions].reverse().map((ver, idx) => (
                    <div key={ver.id} className={`p-6 hover:bg-slate-50 transition-colors ${idx === 0 ? 'bg-blue-50/30' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold text-lg text-slate-800">v{ver.version}</span>
                          {idx === 0 && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">最新</span>}
                          <span className="text-xs text-slate-400">发布于 {new Date(ver.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {ver.manualUrl && (
                             <button 
                                onClick={() => handleViewManual(ver.manualUrl!, `${selectedTool.name}-v${ver.version}-说明书`)}
                                className="flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded border border-slate-200 hover:border-blue-300 bg-white transition-colors"
                              >
                               <Eye size={14} />
                               <span>预览说明书</span>
                             </button>
                          )}
                          <button 
                            onClick={() => handleDownload(ver.fileUrl, `${selectedTool.name}-v${ver.version}`, '软件', ver.version)}
                            className="flex items-center space-x-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded transition-colors shadow-sm"
                          >
                            <Download size={14} />
                            <span>下载软件 ({ver.size})</span>
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 pl-2 border-l-2 border-slate-200">
                        <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{ver.changelog}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">用户反馈与评价</h3>
                  </div>
                  
                  {/* Feedback List */}
                  <div className="p-6 space-y-6">
                     {toolFeedbacks.length > 0 ? toolFeedbacks.map(fb => (
                        <div key={fb.id} className="flex space-x-4">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                             <UserIcon size={20} className="text-slate-400"/>
                           </div>
                           <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                 <span className="font-medium text-slate-900">{fb.username}</span>
                                 <span className="text-slate-300 text-xs">•</span>
                                 <span className="text-xs text-slate-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex text-yellow-400 mb-2">
                                 {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill={i < fb.rating ? "currentColor" : "none"} className={i < fb.rating ? "" : "text-slate-200"} />
                                 ))}
                              </div>
                              <p className="text-sm text-slate-700">{fb.content}</p>
                           </div>
                        </div>
                     )) : (
                        <p className="text-center text-slate-400 text-sm py-4">暂无反馈，快来发表第一条评价吧！</p>
                     )}
                  </div>

                  {/* Add Feedback Form */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100">
                     <h4 className="text-sm font-bold text-slate-700 mb-3">提交您的反馈</h4>
                     <form onSubmit={handleSubmitFeedback}>
                        <div className="mb-3 flex items-center space-x-2">
                           <span className="text-sm text-slate-600">评分：</span>
                           <div className="flex space-x-1 cursor-pointer">
                              {[1, 2, 3, 4, 5].map((star) => (
                                 <Star 
                                    key={star} 
                                    size={20} 
                                    onClick={() => setFeedbackRating(star)}
                                    className={`${star <= feedbackRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                                 />
                              ))}
                           </div>
                        </div>
                        <textarea 
                           required
                           value={feedbackContent}
                           onChange={e => setFeedbackContent(e.target.value)}
                           className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                           placeholder="您对这个工具有什么建议或发现了什么Bug？"
                           rows={3}
                        />
                        <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center">
                           <Send size={14} className="mr-2" /> 提交反馈
                        </button>
                     </form>
                  </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">快速统计</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">版本总数</span>
                    <span className="font-medium">{selectedTool.versions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">最后更新</span>
                    <span className="font-medium">{new Date(selectedTool.updatedAt).toLocaleDateString()}</span>
                  </div>
                   <div className="flex justify-between text-sm">
                    <span className="text-slate-500">维护者</span>
                    <span className="font-medium text-blue-600">团队管理员</span>
                  </div>
                </div>
              </div>

               {!hasWriteAccess && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
                  <ShieldAlert className="text-blue-600 shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-blue-800 mb-1">访客模式</h4>
                    <p className="text-xs text-blue-600">您当前处于只读模式，仅可浏览、下载软件及查阅文档。如需上传权限请联系管理员。</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <AddToolModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTool} existingTool={editingTool} />
        <ManualModal isOpen={manualViewer.isOpen} onClose={() => setManualViewer({ ...manualViewer, isOpen: false })} title={manualViewer.title} url={manualViewer.url} />
      </Layout>
    );
  }

  // --- DASHBOARD (Default) ---
  return (
    <Layout user={user} onLogout={handleLogout} title="仪表盘" currentRoute={route} onNavigate={setRoute}>
      <div className="space-y-8 animate-fade-in">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search & Filter */}
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="搜索工具名称或描述..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm min-w-[140px]"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">全部分类</option>
                {availableCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            {hasWriteAccess && (
              <button 
                onClick={() => { setEditingTool(undefined); setIsModalOpen(true); }}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-200 transition-all font-medium"
              >
                <Plus size={20} />
                <span>上传新工具</span>
              </button>
            )}
          </div>

          {/* Grid */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTools.map(tool => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  onClick={(t) => { setSelectedToolId(t.id); setRoute('TOOL_DETAIL'); }} 
                />
              ))}
            </div>
          ) : (
             <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
               <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <Archive className="text-slate-400" size={32} />
               </div>
               <h3 className="text-lg font-medium text-slate-900">未找到相关工具</h3>
               <p className="text-slate-500 mt-1">请尝试调整搜索关键词或分类筛选</p>
             </div>
          )}
        </div>

        <AddToolModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTool} existingTool={editingTool} />
    </Layout>
  );
}

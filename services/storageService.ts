
import { Tool, User, UserRole, Feedback, DownloadLog } from '../types';
import { INITIAL_TOOLS, MOCK_USERS, INITIAL_FEEDBACK, INITIAL_LOGS, INITIAL_CATEGORIES } from '../constants';

const TOOLS_KEY = 'devtool_hub_tools';
const USERS_KEY = 'devtool_hub_users';
const CURRENT_USER_KEY = 'devtool_hub_current_user';
const FEEDBACK_KEY = 'devtool_hub_feedback';
const LOGS_KEY = 'devtool_hub_logs';
const CATEGORIES_KEY = 'devtool_hub_categories';

export const storageService = {
  // Categories
  getCategories: (): string[] => {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (!data) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(data);
  },

  addCategory: (name: string) => {
    const cats = storageService.getCategories();
    if (!cats.includes(name)) {
      cats.push(name);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
    }
  },

  deleteCategory: (name: string) => {
    let cats = storageService.getCategories();
    cats = cats.filter(c => c !== name);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  },

  // Tools
  getTools: (): Tool[] => {
    const data = localStorage.getItem(TOOLS_KEY);
    if (!data) {
      localStorage.setItem(TOOLS_KEY, JSON.stringify(INITIAL_TOOLS));
      return INITIAL_TOOLS;
    }
    return JSON.parse(data);
  },

  saveTool: (newTool: Tool) => {
    const tools = storageService.getTools();
    const existingIndex = tools.findIndex(t => t.id === newTool.id);
    if (existingIndex >= 0) {
      tools[existingIndex] = newTool;
    } else {
      tools.push(newTool);
    }
    localStorage.setItem(TOOLS_KEY, JSON.stringify(tools));
  },

  getToolById: (id: string): Tool | undefined => {
    const tools = storageService.getTools();
    return tools.find(t => t.id === id);
  },

  // Users (Mock Auth)
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
      return MOCK_USERS;
    }
    return JSON.parse(data);
  },

  registerUser: (user: User) => {
    const users = storageService.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  login: (email: string, password?: string): User | undefined => {
    const users = storageService.getUsers();
    return users.find(u => u.email === email && u.password === password);
  },

  updateUserRole: (userId: string, newRole: UserRole) => {
    const users = storageService.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index >= 0) {
      users[index].role = newRole;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // If updating current user, update session too
      const currentUser = storageService.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.role = newRole;
        storageService.setCurrentUser(currentUser);
      }
    }
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  // Permission & Role Helpers
  hasWriteAccess: (user: User | null): boolean => {
    if (!user) return false;
    return user.role === UserRole.ADMIN || user.role === UserRole.SECONDARY_ADMIN;
  },

  hasRootAccess: (user: User | null): boolean => {
    if (!user) return false;
    return user.role === UserRole.ADMIN;
  },

  // Feedback
  getFeedback: (toolId?: string): Feedback[] => {
    const data = localStorage.getItem(FEEDBACK_KEY);
    let allFeedback: Feedback[] = [];
    
    if (!data) {
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(INITIAL_FEEDBACK));
      allFeedback = INITIAL_FEEDBACK;
    } else {
      allFeedback = JSON.parse(data);
    }

    if (toolId) {
      return allFeedback.filter(f => f.toolId === toolId);
    }
    return allFeedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addFeedback: (feedback: Feedback) => {
    const all = storageService.getFeedback();
    all.unshift(feedback);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all));
  },

  // Logs
  getDownloadLogs: (userId?: string): DownloadLog[] => {
    const data = localStorage.getItem(LOGS_KEY);
    let allLogs: DownloadLog[] = [];

    if (!data) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(INITIAL_LOGS));
      allLogs = INITIAL_LOGS;
    } else {
      allLogs = JSON.parse(data);
    }

    if (userId) {
      return allLogs.filter(l => l.userId === userId).sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
    }
    return allLogs.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
  },

  addDownloadLog: (log: DownloadLog) => {
    const all = storageService.getDownloadLogs();
    all.unshift(log);
    localStorage.setItem(LOGS_KEY, JSON.stringify(all));
  }
};

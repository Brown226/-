
export enum UserRole {
  ADMIN = 'ADMIN', // 超级管理员
  SECONDARY_ADMIN = 'SECONDARY_ADMIN', // 二级管理员
  USER = 'USER', // 普通用户
}

export interface User {
  id: string;
  username: string;
  realName?: string; // 新增：真实姓名
  department?: string; // 新增：部门名称
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  joinedAt?: string;
}

export interface ToolVersion {
  id: string;
  version: string;
  changelog: string;
  fileUrl: string;
  manualUrl?: string;
  createdAt: string;
  size: string;
}

// 将枚举改为类型别名，以支持动态添加
export type ToolCategory = string;

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  versions: ToolVersion[];
  authorId: string;
  icon?: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  toolId: string;
  userId: string;
  username: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface DownloadLog {
  id: string;
  userId: string;
  username: string;
  toolId: string;
  toolName: string;
  version: string;
  type: '软件' | '说明书';
  downloadedAt: string;
}

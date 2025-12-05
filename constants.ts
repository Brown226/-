
import { Tool, User, UserRole, Feedback, DownloadLog } from './types';

export const INITIAL_CATEGORIES = [
  '前端开发',
  '后端 & API',
  '移动端',
  '效率工具',
  '运维 & 部署',
  'UI/UX 设计',
  '核电专用工具'
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'admin',
    realName: '张三',
    department: '数字化管理科',
    email: 'admin@team.com',
    password: '123',
    role: UserRole.ADMIN,
    avatar: 'https://picsum.photos/id/64/200/200',
    joinedAt: new Date(Date.now() - 86400000 * 365).toISOString()
  },
  {
    id: 'u2',
    username: 'dev_wang',
    realName: '王小明',
    department: '研发一部',
    email: 'dev@team.com',
    password: '123',
    role: UserRole.USER,
    avatar: 'https://picsum.photos/id/1005/200/200',
    joinedAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'u3',
    username: 'ops_li',
    realName: '李四',
    department: '运维保障部',
    email: 'ops@team.com',
    password: '123',
    role: UserRole.SECONDARY_ADMIN,
    avatar: 'https://picsum.photos/id/1011/200/200',
    joinedAt: new Date(Date.now() - 86400000 * 60).toISOString()
  }
];

export const INITIAL_TOOLS: Tool[] = [
  {
    id: 't1',
    name: '日志分析专家 (Log Parser)',
    description: '一个强大的服务器日志分析工具，能够快速提取错误模式并生成可视化报告。',
    category: '后端 & API',
    authorId: 'u1',
    updatedAt: new Date().toISOString(),
    icon: '📊',
    versions: [
      {
        id: 'v1.0.0',
        version: '1.0.0',
        changelog: '初始版本发布，支持基础的 CSV 格式解析。',
        fileUrl: '#',
        manualUrl: '#',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        size: '12MB'
      },
      {
        id: 'v1.1.0',
        version: '1.1.0',
        changelog: '新增 JSON 日志格式支持，大幅提升了解析性能。',
        fileUrl: '#',
        manualUrl: '#',
        createdAt: new Date().toISOString(),
        size: '14MB'
      }
    ]
  },
  {
    id: 't2',
    name: '资源压缩助手',
    description: '自动化压缩图片和 SVG 文件的生产力工具，显著减小构建体积。',
    category: '前端开发',
    authorId: 'u1',
    updatedAt: new Date().toISOString(),
    icon: '📦',
    versions: [
      {
        id: 'v2.0',
        version: '2.0.0',
        changelog: '重大更新：核心引擎迁移至 Rust，处理速度提升 10 倍。',
        fileUrl: '#',
        manualUrl: '#',
        createdAt: new Date().toISOString(),
        size: '45MB'
      }
    ]
  }
];

export const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: 'f1',
    toolId: 't1',
    userId: 'u2',
    username: 'dev_wang',
    rating: 5,
    content: '非常好用的工具！帮我节省了大量分析日志的时间，强烈推荐。',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'f2',
    toolId: 't2',
    userId: 'u2',
    username: 'dev_wang',
    rating: 4,
    content: '压缩效果很棒，但是希望能支持更多的图片格式，比如 WebP。',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export const INITIAL_LOGS: DownloadLog[] = [
  {
    id: 'l1',
    userId: 'u2',
    username: 'dev_wang',
    toolId: 't1',
    toolName: '日志分析专家',
    version: '1.1.0',
    type: '软件',
    downloadedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

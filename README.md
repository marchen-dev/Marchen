# Marchen

Marchen 是一个基于 Next.js 19 构建的现代化博客平台，使用 TailwindCSS 进行样式设计，采用 TypeScript 进行类型安全的开发。

## 项目特点

- 🚀 基于 Next.js 19 和 React 19 构建
- 💅 使用 TailwindCSS 和 shadcn/ui 组件库进行美观的界面设计
- 🔍 支持博客文章的分类、推荐和展示功能
- 👨‍💻 包含管理后台功能
- 📱 完全响应式设计，适配各种设备
- 🌙 支持浅色/深色主题切换

## 技术栈

- [Next.js](https://nextjs.org/) - React 框架
- [React](https://react.dev/) - 用户界面库
- [TailwindCSS](https://tailwindcss.com/) - CSS 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript 超集
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [React Query](https://tanstack.com/query/latest) - 服务端状态管理
- [React Hook Form](https://react-hook-form.com/) - 表单处理
- [Zod](https://zod.dev/) - 模式验证

## 开发环境要求

- Node.js >= 20
- pnpm >= 10.6.1

## 快速开始

1. 克隆仓库

```bash
git clone https://github.com/yourusername/marchen.git
cd marchen
```

2. 安装依赖

```bash
pnpm install
```

3. 配置环境变量

```bash
cp .env.template .env
```

4. 启动开发服务器

```bash
pnpm dev
```

应用将在 [http://localhost:23116](http://localhost:23116) 运行。

## 构建项目

```bash
pnpm build
```

## 项目结构

- `src/` - 应用源代码
  - `app/` - Next.js 应用路由
  - `providers/` - React 上下文提供者
  - `layout/` - 应用布局组件
- `domain/` - 领域模块和组件
- `base/` - 基础功能和工具
- `public/` - 静态资源

## 贡献

欢迎提交 Pull Request 和 Issue。

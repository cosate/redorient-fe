# Redorient Frontend

这是一个基于 React + TypeScript + Vite 的现代前端项目，包含搜索功能。

## 🚀 特性

- ⚡️ **Vite** - 快速的构建工具和开发服务器
- ⚛️ **React 18** - 现代化的 React 框架
- 🔷 **TypeScript** - 类型安全的 JavaScript
- 🎨 **CSS3** - 现代化的样式和动画
- 🔍 **搜索功能** - 内置的搜索组件
- 📱 **响应式设计** - 适配各种屏幕尺寸

## 📦 安装

```bash
# 安装依赖
npm install
```

## 🛠️ 开发

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check
```

开发服务器将在 `http://localhost:3000` 启动。

## 🏗️ 构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # React 组件
│   └── SearchBox.tsx   # 搜索框组件
├── App.tsx             # 主应用组件
├── App.css            # 应用样式
├── main.tsx           # 应用入口
└── index.css          # 全局样式
```

## 🔧 技术栈

- **React** - UI 框架
- **TypeScript** - 类型系统
- **Vite** - 构建工具
- **CSS3** - 样式

## 📝 开发说明

### 搜索组件

`SearchBox` 组件提供了一个可重用的搜索界面：

```tsx
<SearchBox 
  placeholder="输入搜索关键词..."
  onSearch={(query) => console.log(query)}
/>
```

### 自定义样式

项目使用纯 CSS 进行样式设计，支持：
- 渐变背景
- 阴影效果
- 响应式布局
- 动画过渡

## 📄 许可证

MIT License
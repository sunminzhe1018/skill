# 天气助手 · 阿里百炼

对话式天气查询网页：通过百炼 **联网搜索**（`enable_search`）获取实时天气，由千问模型整理回答（与控制台体验一致）。

## 快速开始

### 1. 配置密钥

```bash
copy .env.example .env
```

编辑 `.env`，填入百炼 API Key：

```env
DASHSCOPE_API_KEY=sk-你的密钥
DASHSCOPE_MODEL=qwen-plus
ENABLE_SEARCH=true
```

Key 获取：[百炼控制台](https://bailian.console.aliyun.com/) → API-KEY 管理

### 2. 安装并运行

需要 **Node.js 16+**（推荐 18+）。

```bash
npm install
npm start
```

浏览器打开：**http://localhost:3000**

### 3. Cursor Skill

项目内已包含 Skill：`.cursor/skills/weather-bailian/SKILL.md`

## 项目结构

```
├── web/              # 前端页面
├── server/           # 后端（百炼 API 代理，含联网搜索）
├── .env.example      # 密钥模板（复制为 .env）
└── .cursor/skills/   # Agent Skill
```

## API

| 接口 | 说明 |
|------|------|
| `GET /api/health` | 服务、密钥、联网搜索状态 |
| `POST /api/chat` | 对话，`{ "message": "慈溪天气", "history": [] }` |

## 环境变量

| 变量 | 说明 |
|------|------|
| `DASHSCOPE_API_KEY` | 百炼 API Key（必填） |
| `DASHSCOPE_MODEL` | 模型名，需支持联网（如 qwen-plus、qwen3.6-plus） |
| `ENABLE_SEARCH` | 是否开启联网，默认 `true` |
| `DASHSCOPE_BASE_URL` | 兼容模式 Base URL |
| `PORT` | 端口，默认 `3000` |

联网说明：[大模型如何联网搜索](https://help.aliyun.com/zh/model-studio/web-search)

## 许可

MIT

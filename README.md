# PULSE Festival Screen

音乐节 AIGC 互动营销大屏 Web Demo。

核心体验：**今晚，你是哪种音乐人格？**

## 流程

待机吸引页 → 输入昵称 → 选择音乐人格 → 选择视觉风格 → 拍摄人像 → AI 生成 → 海报结果 / 扫码保存 → 自动返回待机页

## 架构

- 前端：React + TypeScript + Vite + Tailwind CSS
- 后端：Vercel Serverless Function（`api/generate.ts`）
- 图片生成：阿里云百炼 通义万相（`wanx2.1-imageedit`），图生图全局风格化

AI 只负责生成「人物主视觉」，昵称、人格名称、品牌 Logo、Festival ID、二维码等仍由前端模板叠加，保证文字与品牌元素准确可控。

## 环境变量

复制 `.env.example` 为 `.env`，并填入真实 Key（`.env` 已被 `.gitignore` 忽略，不会提交到 Git）：

| 变量 | 说明 | 是否必填 |
| --- | --- | --- |
| `DASHSCOPE_API_KEY` | 阿里云百炼 API Key，仅后端读取 | 是 |
| `DASHSCOPE_BASE_URL` | 百炼 API 地址，默认 `https://dashscope.aliyuncs.com/api/v1` | 否 |
| `WANX_MODEL` | 万相图像编辑模型，默认 `wanx2.1-imageedit` | 否 |
| `WANX_STRENGTH` | 风格化强度 0~1，默认 `0.55` | 否 |

> API Key 只存在于后端环境变量，绝不写入 React 前端代码。

## 运行

### 本地完整运行（前端 + 后端）

需要 Vercel CLI：

```bash
npm install
npm i -g vercel
vercel dev
```

`vercel dev` 会同时启动前端（Vite）与 `/api/generate` 函数。浏览器打开终端提示的本地地址。摄像头需要在 localhost 或 HTTPS 下授权。

### 仅运行前端

```bash
npm install
npm run dev
```

此时 `/api/generate` 会被代理到 `http://localhost:3000`（可用 `VITE_API_PROXY_TARGET` 覆盖，例如指向已部署的 Vercel 后端）。

## 后端接口

### `POST /api/generate`

请求体：

```json
{
  "image": "data:image/jpeg;base64,...",
  "persona": { "id": "rock" },
  "style": { "id": "cyberpunk" }
}
```

响应：

```json
{ "image": "data:image/jpeg;base64,..." }
```

后端根据 `persona.id` 与 `style.id` 动态构建 Prompt，调用图片生成 API，并返回生成后的「人物主视觉」。

## Prompt 映射

- `lib/prompts.ts` 中为 6 种音乐人格（rock / edm / poet / soul / healer / party）与 6 种视觉风格（cyberpunk / y2k / film / graffiti / starry / mono）分别建立了独立 Prompt 映射，由 `buildStylePrompt` 组合成风格化提示词。
- 万相风格化会保留原图的人物与构图，提示词聚焦风格与气质，并明确不生成文字 / Logo / 二维码 / 水印。

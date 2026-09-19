# PULSE Festival Screen

音乐节 AIGC 互动营销大屏 Web Demo。

核心体验：**今晚，你是哪种音乐人格？**

## 运行

```bash
npm install
npm run dev
```

浏览器打开终端提示的本地地址（默认 `http://localhost:5173`）。摄像头需要在 localhost 或 HTTPS 下授权。

## 流程

待机吸引页 → 选择音乐人格 → 选择视觉风格 → 拍摄人像 → AI 生成 → 海报结果 / 扫码保存 → 自动返回待机页

第一版海报生成为本地 Canvas 合成（`src/services/generatePoster.ts`），后续可替换为真实 AIGC API。

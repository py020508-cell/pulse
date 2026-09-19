import { buildStylePrompt } from "../lib/prompts";

/**
 * POST /api/generate
 *
 * 接收前端传来的用户照片与选择，调用阿里云百炼「万相通用图像编辑
 * wanx2.1-imageedit」做全局风格化，仅生成「人物主视觉」。
 * 品牌文字、Logo、二维码等仍由前端模板叠加。
 *
 * 请求体：{ image: dataURL, persona: { id }, style: { id } }
 * 响应：  { image: dataURL } 或 { error: string }
 */

interface GenerateBody {
  image?: string;
  persona?: { id?: string };
  style?: { id?: string };
}

interface DashScopeOutput {
  task_id?: string;
  task_status?: string;
  results?: Array<{
    url?: string;
    code?: string;
    message?: string;
  }>;
  message?: string;
  code?: string;
}

interface DashScopeResponse {
  output?: DashScopeOutput;
  code?: string;
  message?: string;
}

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY ?? "";
const DASHSCOPE_BASE_URL = (
  process.env.DASHSCOPE_BASE_URL ?? "https://dashscope.aliyuncs.com/api/v1"
).replace(/\/$/, "");
const WANX_MODEL = process.env.WANX_MODEL ?? "wanx2.1-imageedit";

function parseStrength(value: string | undefined): number {
  const n = Number(value ?? "0.55");
  if (Number.isNaN(n)) return 0.55;
  return Math.min(1, Math.max(0, n));
}
const WANX_STRENGTH = parseStrength(process.env.WANX_STRENGTH);

const MAX_POLLS = 20;
const POLL_INTERVAL_MS = 2000;

function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return json(405, { error: "Method Not Allowed" });
    }

    if (!DASHSCOPE_API_KEY) {
      console.error("[generate] DASHSCOPE_API_KEY is not configured");
      return json(500, { error: "服务未配置，请稍后再试" });
    }

    let body: GenerateBody;
    try {
      body = (await request.json()) as GenerateBody;
    } catch {
      return json(400, { error: "请求格式不正确" });
    }

    const { image, persona, style } = body;
    const personaId = persona?.id;
    const styleId = style?.id;

    if (!image || !personaId || !styleId) {
      return json(400, { error: "缺少生成所需的参数" });
    }

    if (!/^data:image\//.test(image)) {
      return json(400, { error: "图片格式不正确" });
    }

    const prompt = buildStylePrompt(personaId, styleId);

    try {
      // 1. 提交异步任务，获取 task_id
      const submitRes = await fetch(
        `${DASHSCOPE_BASE_URL}/services/aigc/image2image/image-synthesis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
            "X-DashScope-Async": "enable",
          },
          body: JSON.stringify({
            model: WANX_MODEL,
            input: {
              function: "stylization_all",
              prompt,
              base_image_url: image,
            },
            parameters: {
              n: 1,
              strength: WANX_STRENGTH,
              watermark: false,
            },
          }),
        },
      );

      const submitData = (await submitRes.json().catch(() => null)) as
        | DashScopeResponse
        | null;

      if (!submitRes.ok) {
        console.error("[generate] submit error:", submitRes.status, submitData);
        return json(502, { error: "生成服务暂时不可用，请稍后再试" });
      }

      const taskId = submitData?.output?.task_id;
      if (!taskId) {
        console.error("[generate] submit returned no task_id:", submitData);
        return json(502, { error: "生成任务创建失败，请稍后再试" });
      }

      // 2. 轮询任务结果
      let imageUrl: string | undefined;
      let failedMessage: string | undefined;

      for (let i = 0; i < MAX_POLLS; i += 1) {
        await sleep(POLL_INTERVAL_MS);
        const pollRes = await fetch(`${DASHSCOPE_BASE_URL}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${DASHSCOPE_API_KEY}` },
        });
        const pollData = (await pollRes.json().catch(() => null)) as
          | DashScopeResponse
          | null;

        const status = pollData?.output?.task_status;
        if (status === "SUCCEEDED") {
          const first = pollData?.output?.results?.[0];
          if (first?.url) {
            imageUrl = first.url;
          } else {
            failedMessage = first?.message ?? "生成结果为空";
          }
          break;
        }
        if (status === "FAILED" || status === "CANCELED") {
          failedMessage =
            pollData?.output?.message ??
            pollData?.output?.results?.[0]?.message ??
            "生成任务失败";
          break;
        }
      }

      if (failedMessage) {
        console.error("[generate] task failed:", failedMessage);
        return json(502, { error: "这次生成没有成功，再试一次吧" });
      }

      if (!imageUrl) {
        console.error("[generate] task timeout");
        return json(504, { error: "生成超时，请再试一次" });
      }

      // 3. 下载生成图，转成 base64 返回（避免外链 24h 过期、隐私更可控）
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) {
        console.error("[generate] download failed:", imgRes.status);
        return json(502, { error: "生成结果下载失败，请再试一次" });
      }

      const buf = await imgRes.arrayBuffer();
      const mime = imgRes.headers.get("content-type") ?? "image/jpeg";
      const b64 = Buffer.from(buf).toString("base64");

      return json(200, { image: `data:${mime};base64,${b64}` });
    } catch (error) {
      console.error("[generate] failed:", error);
      return json(500, { error: "这次生成没有成功，再试一次吧" });
    }
  },
};

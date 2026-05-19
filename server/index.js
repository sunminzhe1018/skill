import "./loadEnv.js";
import "./polyfill.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.DASHSCOPE_API_KEY;
const MODEL = process.env.DASHSCOPE_MODEL || "qwen-plus";
const BASE_URL =
  process.env.DASHSCOPE_BASE_URL ||
  "https://dashscope.aliyuncs.com/compatible-mode/v1";
const ENABLE_SEARCH = process.env.ENABLE_SEARCH !== "false";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "../web")));

const SYSTEM_PROMPT = `你是专业的天气助手。用户会询问各地天气、穿衣建议、出行是否适合等。
你已开启联网搜索，请根据检索到的实时信息回答，不要编造气温、AQI、风力等具体数值。
若用户反馈与窗外实况不符（如「其实没下雨」），表示理解并以用户当地感受为准。
回答简洁友好，使用中文，可分段列出今日与未来几日预报。`;

/** 健康检查与配置状态 */
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    model: MODEL,
    enableSearch: ENABLE_SEARCH,
    apiKeyConfigured: Boolean(API_KEY && !API_KEY.includes("在此填入")),
  });
});

/** 对话：百炼联网搜索 + 对话模型 */
app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "请提供 message" });
  }

  if (!API_KEY || API_KEY.includes("在此填入")) {
    return res.status(503).json({
      error:
        "尚未配置百炼 API Key。请复制 .env.example 为 .env 并填入 DASHSCOPE_API_KEY。",
    });
  }

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history
        .filter((m) => m.role && m.content)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const body = {
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    };

    if (ENABLE_SEARCH) {
      body.enable_search = true;
    }

    const llmRes = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const llmData = await llmRes.json();

    if (!llmRes.ok) {
      const errMsg =
        llmData.error?.message ||
        llmData.message ||
        `百炼 API 错误 (${llmRes.status})`;
      return res.status(llmRes.status).json({ error: errMsg });
    }

    const reply =
      llmData.choices?.[0]?.message?.content?.trim() || "（模型未返回内容）";

    res.json({
      reply,
      model: MODEL,
      enableSearch: ENABLE_SEARCH,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "对话请求失败" });
  }
});

app.listen(PORT, () => {
  console.log(`天气助手已启动: http://localhost:${PORT}`);
  console.log(`联网搜索: ${ENABLE_SEARCH ? "已开启" : "已关闭"}`);
  if (!API_KEY || API_KEY.includes("在此填入")) {
    console.warn("⚠ 请在 .env 中配置 DASHSCOPE_API_KEY");
  }
});

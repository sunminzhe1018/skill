const chatEl = document.getElementById("chat");
const formEl = document.getElementById("form");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const statusBadge = document.getElementById("statusBadge");

/** @type {{ role: string, content: string }[]} */
const history = [];

function scrollToBottom() {
  chatEl.scrollTop = chatEl.scrollHeight;
}

function appendMessage(role, content, options = {}) {
  const article = document.createElement("article");
  article.className = `message message--${role === "user" ? "user" : "assistant"}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = role === "user" ? "我" : "AI";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (options.error) bubble.classList.add("bubble--error");
  if (options.typing) bubble.classList.add("bubble--typing");

  const p = document.createElement("p");
  p.textContent = content;
  bubble.appendChild(p);

  article.appendChild(avatar);
  article.appendChild(bubble);
  chatEl.appendChild(article);
  scrollToBottom();
  return article;
}

function removeElement(el) {
  el?.remove();
}

async function checkHealth() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    if (data.apiKeyConfigured) {
      const label = data.enableSearch ? `${data.model || "已就绪"} · 联网` : data.model || "已就绪";
      statusBadge.textContent = label;
      statusBadge.className = "badge badge--ok";
    } else {
      statusBadge.textContent = "待配置密钥";
      statusBadge.className = "badge badge--warn";
    }
  } catch {
    statusBadge.textContent = "后端未启动";
    statusBadge.className = "badge badge--warn";
    statusBadge.title =
      "请在项目目录运行 npm install && npm start，并用 http://localhost:3000 打开";
  }
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = inputEl.value.trim();
  if (!message) return;

  inputEl.value = "";
  inputEl.disabled = true;
  sendBtn.disabled = true;

  appendMessage("user", message);
  history.push({ role: "user", content: message });

  const typingEl = appendMessage("assistant", "正在查询", { typing: true });

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: history.slice(0, -1),
      }),
    });

    const data = await res.json();
    removeElement(typingEl);

    if (!res.ok) {
      appendMessage("assistant", data.error || "请求失败", { error: true });
      history.pop();
      return;
    }

    appendMessage("assistant", data.reply);
    history.push({ role: "assistant", content: data.reply });
  } catch (err) {
    removeElement(typingEl);
    appendMessage("assistant", "网络错误，请确认服务已启动。", { error: true });
    history.pop();
  } finally {
    inputEl.disabled = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }
});

checkHealth();
inputEl.focus();

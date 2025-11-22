(function () {
  window.AutofyWidget = {
    init(config) {
      // 必要設定
      window.__autofy_company_id = config.companyId;
      window.__autofy_api = config.workerUrl;

      console.log("Autofy Widget Loaded for company:", config.companyId);

      // 載入 UI
      loadUI();
    },

    sendMessage(msg) {
      const payload = {
        channel: "WEB_WIDGET",
        company_id: window.__autofy_company_id,
        user_id: getUserId(),
        message: msg
      };

      fetch(window.__autofy_api, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      })
        .then(res => res.json())
        .then(data => showBotMessage(data.reply || "（無回覆）"))
        .catch(() => showBotMessage("伺服器錯誤"));
    }
  };

  // ⬇ 下面都是 UI（你原本泡泡的程式，我壓縮後放這裡）

  function loadUI() {
    document.head.insertAdjacentHTML(
      "beforeend",
      '<link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.16/tailwind.min.css" rel="stylesheet">'
    );

    const style = document.createElement("style");
    style.innerHTML = `
      .hidden { display:none; }
      #autofy-chat-container{ position:fixed; bottom:20px; right:20px; }
      #autofy-chat-popup{ height:70vh; max-height:70vh; overflow:hidden; }
    `;
    document.head.appendChild(style);

    const box = document.createElement("div");
    box.id = "autofy-chat-container";
    box.innerHTML = `
      <div id="autofy-bubble"
        class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer text-3xl">
        💬
      </div>

      <div id="autofy-chat-popup"
        class="hidden absolute bottom-20 right-0 w-96 bg-white rounded-md shadow-md flex flex-col">
        
        <div class="p-4 bg-gray-800 text-white flex justify-between">
          <strong>Autofy 聊天</strong>
          <button id="autofy-close">✕</button>
        </div>

        <div id="autofy-messages" class="flex-1 p-4 overflow-y-auto"></div>

        <div class="p-4 border-t flex">
          <input id="autofy-input" class="flex-1 border px-2 py-1 rounded" placeholder="輸入訊息…">
          <button id="autofy-send" class="ml-2 bg-gray-800 text-white px-4 py-2 rounded">送出</button>
        </div>
      </div>
    `;
    document.body.appendChild(box);

    document.getElementById("autofy-bubble").onclick = togglePopup;
    document.getElementById("autofy-close").onclick = togglePopup;
    document.getElementById("autofy-send").onclick = send;
    document.getElementById("autofy-input").onkeyup = e => e.key === "Enter" && send();
  }

  function togglePopup() {
    document.getElementById("autofy-chat-popup").classList.toggle("hidden");
  }

  function send() {
    const input = document.getElementById("autofy-input");
    const text = input.value.trim();
    if (!text) return;

    showUserMessage(text);
    input.value = "";

    window.AutofyWidget.sendMessage(text);
  }

  function showUserMessage(msg) {
    const box = document.getElementById("autofy-messages");
    box.innerHTML += `<div class="text-right my-2"><span class="bg-gray-800 text-white px-3 py-2 rounded">${msg}</span></div>`;
    box.scrollTop = box.scrollHeight;
  }

  function showBotMessage(msg) {
    const box = document.getElementById("autofy-messages");
    box.innerHTML += `<div class="text-left my-2"><span class="bg-gray-200 px-3 py-2 rounded">${msg}</span></div>`;
    box.scrollTop = box.scrollHeight;
  }

  // 產生 userId（類似 Line UserID）
  function getUserId() {
    let id = localStorage.getItem("__autofy_uid");
    if (!id) {
      id = "web_" + Math.random().toString(36).slice(2);
      localStorage.setItem("__autofy_uid", id);
    }
    return id;
  }
})();

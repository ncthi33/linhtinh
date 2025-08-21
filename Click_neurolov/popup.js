document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const logsDiv = document.getElementById("logs");

    // Gửi tín hiệu start/stop về background
    startBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "start" }, (response) => {
            addLog(response);
        });
    });

    stopBtn.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "stop" }, (response) => {
            addLog(response);
        });
    });

    // Nhận log realtime từ background
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === "LOG") {
            addLog(message.payload);
        }
    });

    // Load log cũ khi mở popup
    chrome.storage.local.get({ logs: [] }, (data) => {
        data.logs.forEach(log => addLog(log));
    });

    function addLog(msg) {
        const div = document.createElement("div");
        div.textContent = msg;
        logsDiv.appendChild(div);
        logsDiv.scrollTop = logsDiv.scrollHeight; // auto scroll xuống cuối
    }
});
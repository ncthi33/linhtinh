document.getElementById("startBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "start" }, (response) => {
    console.log("Start response:", response);
  });
});

document.getElementById("stopBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stop" }, (response) => {
    console.log("Stop response:", response);
  });
});
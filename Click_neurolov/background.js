let isRun = false;
let timeouts = [];
// Lắng nghe sự kiện khi extension được bật
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "start") {
		if (!isRun) {
			isRun = true;
			Click("Start Node");
			onLoop();
			sendResponse("Script started!");
		}
	}
	else if (message.action === "stop") {
		if (isRun) {
			isRun = false;
			clearTimeouts();
		}
		sendResponse ("Script stoped!");
	}
});

function onLoop() {
    addTimeout(() => {
    	Click("Stop Node");
		addTimeout(() => {
			Click("Start Node");
			if (isRun) onLoop();
		}, 30*60*1000); // 30 phút
    }, 238*60*1000); // 238 phút
	// Lặp lại sau 238 phút
}

function Click(node, claimCount = 0) {
    if (!isRun) return;

    // Lấy tất cả tab thỏa url
    chrome.tabs.query({ url: "https://swarm.neurolov.ai/*" }, (tabs) => {
        tabs.forEach((tab) => {
            // Thử click Claim Rewards trước
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (btnText) => {
                    const buttons = document.querySelectorAll('button.inline-flex.rounded-full.font-medium');
                    for (const btn of buttons) {
                        if (btn.textContent.trim() === btnText) {
                            btn.click();
                            return btnText; // Trả về đúng text nút đã click
                        }
                    }
                    return "Not Found";
                },
                args: ["Claim Rewards"]
            }, (results) => {
                if (!results || !results[0]) return;
                const status = results[0].result;

                if (status === "Claim Rewards") {
                    Log("Click " + status);
                    if (claimCount === 3) {
                        Log("Claim hoài đéo được, cook!");
                        isRun = false;
                        return;
                    }
                    if (isRun) {
                        addTimeout(() => {
                            Click(node, claimCount + 1);
                        }, 300000); // 5 phút
                    }
                } else {
                    // Nếu không thấy Claim Rewards thì click node chính (Start/Stop)
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (btnText) => {
                            const buttons = document.querySelectorAll('button.inline-flex.rounded-full.font-medium');
                            for (const btn of buttons) {
                                if (btn.textContent.trim() === btnText) {
                                    btn.click();
                                    return "Click " + btnText;
                                }
                            }
                            return "Not Found " + btnText;
                        },
                        args: [node]
                    }, (results2) => {
                        if (!results2 || !results2[0]) return;
                        Log(results2[0].result);
                    });
                }
            });
        });
    });
}

function Log(msg) {
	const log = msg + " on " + new Date().toLocaleTimeString();
	// Lấy log cũ trong storage
	chrome.storage.local.get({ logs: [] }, (data) => {
		let logs = data.logs;
		// Thêm log mới
		logs.push(log);
		// Giữ lại 10 log mới nhất
		if (logs.length > 10) {
			logs = logs.slice(-10);
		}
		// Lưu lại
		chrome.storage.local.set({ logs });
		// Gửi cho popup nếu nó đang mở
		chrome.runtime.sendMessage({ type: "LOG", payload: log });
	});
}

function addTimeout(fn, delay) {
    const id = setTimeout(fn, delay);
    timeouts.push(id);
    return id;
}

function clearTimeouts() {
    timeouts.forEach(id => clearTimeout(id));
    timeouts = [];
}

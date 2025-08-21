let isRun = false;
let timeoutId = null;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "start") {
		if (!isRun) {
			sendResponse("Script started!");
		}
	}
	else if (message.action === "stop") {
		sendResponse ("Script stoped!");
	}
});
function onLoop() {
    timeoutId = setTimeout(() => {
      Click("Stop Node");
    }, 1*60*1000);
};

function Click(node, claimCout = 0) {
	if (!isRun) return;
	// Lấy tất cả tab thỏa url
	chrome.tabs.query({url: "https://swarm.neurolov.ai/*"}, (tabs) => {
		// Duyệt qua tất cả
		tabs.forEach((tab) => {
			// Đẩy script vào tab
			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				func: (btnText) => {
					// Gán vào buttons tất cả button có selector 'button.inline-flex.rounded-full.font-medium'
					const buttons = document.querySelectorAll('button.inline-flex.rounded-full.font-medium');
					// Duyệt qua tất cả button
					buttons.forEach((btn) => {
						//Check text của button
						if (btn.textContent.trim() === btnText) {
							btn.click();
							Log("Click" + btnText);
							return "Clicked";
						}
					});
					return "Not Found";
				},
				// Dùng args để bridge tham số lên tab vì không thể truyền trực tiếp
				args: ["Claim Rewards"]
			}, (results) => {
				// Kiểm tra kết quả trả về
				if (!results || !results[0]) return;
				const status = results[0].result;
				if (status === "Clicked") {
					if (claimCout == 3) {
						Log("Claim hoài đéo được, cook!");
						isRun = false;
					}
					setTimeout(() => {
						Click(node, claimCout + 1);
					}, 300000); // 5 phút
				} else {
					// Đẩy script vào tab
					chrome.scripting.executeScript({
						target: { tabId: tab.id },
						func: (btnText) => {
							// Gán vào buttons tất cả button có selector 'button.inline-flex.rounded-full.font-medium'
							const buttons = document.querySelectorAll('button.inline-flex.rounded-full.font-medium');
							// Duyệt qua tất cả button
							buttons.forEach((btn) => {
								//Check text của button
								if (btn.textContent.trim() === btnText) {
									btn.click();
									Log("Click" + btnText);
									return "Clicked";
								}
							});
						},
						// Dùng args để bridge tham số lên tab vì không thể truyền trực tiếp
						args: [node]
					});
				}
			});
		});
	});
};

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
};

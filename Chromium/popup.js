let botOn = false;

document.addEventListener("DOMContentLoaded", async () => {
    const data = await chrome.storage.local.get("botOn");
    botOn = !!data.botOn;

    updateUI(botOn);

    const toggleBtn = document.getElementById("toggleBtn");
    toggleBtn.addEventListener("click", switchBotState);
});

async function switchBotState() {
    botOn = !botOn;

    await chrome.storage.local.set({ botOn: botOn });

    updateUI(botOn);

    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        if (tab) {
            await chrome.tabs.sendMessage(tab.id, {
                action: "TOGGLE_BOT",
                enabled: botOn,
            });
        }
    } catch (error) {
        console.error("Messaging failed: ", error);
    }
}

function updateUI(isActive) {
    const stateText = document.getElementById("state");
    const toggleBtn = document.getElementById("toggleBtn");

    stateText.innerText = isActive ? "ON" : "OFF";
    toggleBtn.innerText = isActive ? "Turn OFF" : "Turn ON";
    toggleBtn.className = isActive ? "on" : "off";
}

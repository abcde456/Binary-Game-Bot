const watcher = setInterval(() => {
    const target = document.querySelector(".problem-container");
    if (!target) return;
    const allChildren = target.children;

    for (let child of allChildren) {
        const childrenOfProblem =
            child.firstElementChild.firstElementChild.children;
        let problemIsDigits = false;
        let answerNum = null;
        let bitArray = [];

        let bitsChild = null;
        let digitsChild = null;

        for (let child2 of childrenOfProblem) {
            if (child2.classList.contains("digits")) {
                digitsChild = child2;
                if (child2.classList.contains("isProblem")) {
                    problemIsDigits = true;
                } else {
                    answerNum = parseInt(child2.innerText.trim());
                }
            }

            if (child2.classList.contains("bits")) {
                bitsChild = child2;
                const buttons = child2.querySelectorAll("button.bit");
                bitArray = Array.from(buttons).map((btn) =>
                    parseInt(btn.innerText.trim()),
                );
            }
        }

        if (problemIsDigits) {
            // 1. Guard check
            if (child.hasAttribute("data-solving")) return;
            child.setAttribute("data-solving", "true");

            const correctAnswer = bitsToNum(bitArray);
            const digitString = correctAnswer.toString();

            (async () => {
                // 2. Open the numpad
                clickCenter(digitsChild);

                // 3. WAIT for the game to render the calculator
                await new Promise((r) => setTimeout(r, 150));

                const calculator = child.querySelector(".calculator");
                if (!calculator) {
                    // If it still isn't there, reset the guard so we can try again next tick
                    child.removeAttribute("data-solving");
                    return;
                }

                const calcButtons = calculator.querySelectorAll("button");
                if (calcButtons.length < 3) return;

                const getButtonForDigit = (d) => {
                    const num = parseInt(d);
                    if (num === 0) return calcButtons[1];
                    return calcButtons[num + 2];
                };

                // 4. Input the digits
                for (let char of digitString) {
                    const btn = getButtonForDigit(char);
                    if (btn) {
                        clickCenter(btn);
                        await new Promise((r) => setTimeout(r, 10));
                    }
                }

                // 5. Submit
                clickCenter(calcButtons[2]);
                console.log(`Submitted ${digitString}`);
            })();
        } else {
            // 1. Guard against spamming the same row
            if (child.hasAttribute("data-solving")) return;
            child.setAttribute("data-solving", "true");

            // 2. Convert the decimal answer
            const targetBits = numToBits(answerNum);

            // 3. Find all bit buttons within the bitsChild
            const bitButtons = bitsChild.querySelectorAll("button.bit");

            if (bitButtons.length === 8) {
                (async () => {
                    for (let i = 0; i < 8; i++) {
                        const currentBit = parseInt(
                            bitButtons[i].innerText.trim(),
                        );
                        const targetBit = targetBits[i];

                        // 4. If the button state doesn't match the target, click it
                        if (currentBit !== targetBit) {
                            clickCenter(bitButtons[i]);
                            await new Promise((r) => setTimeout(r, 10));
                        }
                    }
                })();
            }
        }
    }

    // Check for the "Next Level" modal before processing rows
    const modal = document.querySelector(".modal-body");
    if (modal) {
        const nextBtn = Array.from(modal.querySelectorAll("button")).find(
            (btn) => btn.innerText.trim().toUpperCase() === "NEXT LEVEL",
        );

        if (nextBtn) {
            clickCenter(nextBtn);
            console.log("Advancing to Next Level...");
            return;
        }
    }
}, 10);

function numToBits(num) {
    return num.toString(2).padStart(8, "0").split("").map(Number);
}

function bitsToNum(bitArray) {
    return bitArray.reduce((acc, bit) => (acc << 1) | bit, 0);
}

function clickCenter(element) {
    if (!element) return;

    // 1. Get position and dimensions
    const rect = element.getBoundingClientRect();

    // 2. Calculate the center point
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 3. Create and dispatch the event
    const clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: centerX,
        clientY: centerY,
    });

    element.dispatchEvent(clickEvent);
}

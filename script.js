const SECRET = "2027";

const LETTER = {
    title: "С наступающим 2027 годом!",
    body: "Пусть эта зима принесёт в дом тишину, живой свет огня и то редкое чувство, когда никуда не нужно спешить.\n\nЭто письмо может быть абсолютно любой длины. Ты можешь написать сюда целую поэму, огромный текст с поздравлениями, воспоминаниями и пожеланиями.\n\nКогда текст дойдёт до нижнего края экрана, бумага начнёт мягко прокручиваться вниз. Обрати внимание, как красиво растворяются буквы на границах рамки.\n\nТепла, вдохновения, близких людей рядом и светлых дорог в каждом новом дне.",
    sign: "С теплом, в новогоднюю ночь"
};

const gate = document.getElementById("gate");
const hiddenPass = document.getElementById("hidden-pass");
const pinRow = document.getElementById("pin-row");
const slots = Array.from(document.querySelectorAll(".pin-slot"));
const chars = Array.from(document.querySelectorAll(".pin-char"));

const parchmentStage = document.getElementById("parchment-stage");
const writingZone = document.getElementById("writing-zone");
const titleEl = document.getElementById("script-title");
const bodyEl = document.getElementById("script-body");
const signEl = document.getElementById("script-sign");

let isUnlocked = false;

function syncPinUI() {
    const val = hiddenPass.value;
    slots.forEach((slot, i) => {
        if (val[i]) {
            chars[i].textContent = val[i];
            slot.classList.add("filled");
            slot.classList.remove("active");
        } else {
            chars[i].textContent = "";
            slot.classList.remove("filled");
            slot.classList.toggle("active", i === val.length && !isUnlocked);
        }
    });
}

gate.addEventListener("click", () => {
    if (!isUnlocked) hiddenPass.focus();
});

window.addEventListener("keydown", () => {
    if (!isUnlocked && document.activeElement !== hiddenPass) {
        hiddenPass.focus();
    }
});

hiddenPass.addEventListener("focus", syncPinUI);

hiddenPass.addEventListener("input", () => {
    if (isUnlocked) return;
    hiddenPass.value = hiddenPass.value.replace(/[^0-9]/g, "").slice(0, 4);
    syncPinUI();

    if (hiddenPass.value.length === 4) {
        if (hiddenPass.value === SECRET) {
            isUnlocked = true;
            hiddenPass.blur();
            slots.forEach(s => s.classList.remove("active"));

            setTimeout(() => {
                gate.classList.add("unlocked");
                document.body.classList.add("revealed");
            }, 260);

            setTimeout(() => {
                startManuscript();
            }, 1800);
        } else {
            pinRow.classList.remove("wrong");
            void pinRow.offsetWidth;
            pinRow.classList.add("wrong");

            setTimeout(() => {
                hiddenPass.value = "";
                syncPinUI();
            }, 380);
        }
    }
});

syncPinUI();

function writeSection(target, content, baseSpeed) {
    return new Promise((resolve) => {
        let idx = 0;

        function step() {
            if (idx >= content.length) {
                resolve();
                return;
            }

            const ch = content[idx];
            idx++;

            if (ch === "\n") {
                target.appendChild(document.createElement("br"));
                setTimeout(step, baseSpeed * 5);
                return;
            }

            if (ch === " ") {
                target.appendChild(document.createTextNode(" "));
                setTimeout(step, baseSpeed * 1.2);
                return;
            }

            const span = document.createElement("span");
            span.className = "ink-stroke";
            span.textContent = ch;
            target.appendChild(span);

            const zoneBox = writingZone.getBoundingClientRect();
            const glyphBox = span.getBoundingClientRect();
            const distanceToBottom = zoneBox.bottom - glyphBox.bottom;
            
            if (distanceToBottom < 40) {
                writingZone.scrollBy({ top: 40 - distanceToBottom, behavior: 'smooth' });
            }

            requestAnimationFrame(() => {
                span.classList.add("wet");
                setTimeout(() => span.classList.add("dry"), 420);
            });

            let wait = baseSpeed + (Math.random() * 24 - 9);
            if (ch === "." || ch === "!" || ch === "—") wait += 300;
            else if (ch === ",") wait += 150;
            
            setTimeout(step, Math.max(15, wait));
        }
        
        step();
    });
}

async function startManuscript() {
    titleEl.innerHTML = "";
    bodyEl.innerHTML = "";
    signEl.innerHTML = "";

    await writeSection(titleEl, LETTER.title, 45);
    await new Promise(r => setTimeout(r, 400));
    await writeSection(bodyEl, LETTER.body, 32);
    await new Promise(r => setTimeout(r, 450));
    await writeSection(signEl, LETTER.sign, 42);
}

const canvas = document.getElementById("snow-canvas");
const ctx = canvas.getContext("2d");
let cw = 0, ch = 0;

function updateSize() {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
}
window.addEventListener("resize", updateSize);
updateSize();

const embers = Array.from({ length: 55 }, () => ({
    x: Math.random() * cw,
    y: Math.random() * ch,
    r: Math.random() * 2.2 + 0.5,
    vy: -(Math.random() * 0.35 + 0.1),
    vx: (Math.random() - 0.5) * 0.2,
    alpha: Math.random() * 0.45 + 0.1,
    phase: Math.random() * Math.PI * 2,
    warm: Math.random() > 0.25
}));

function drawAmbient() {
    ctx.clearRect(0, 0, cw, ch);
    for (const p of embers) {
        p.phase += 0.018;
        p.x += p.vx + Math.sin(p.phase) * 0.15;
        p.y += p.vy;

        if (p.y < -10) {
            p.y = ch + 10;
            p.x = Math.random() * cw;
        }
        if (p.x < -10) p.x = cw + 10;
        if (p.x > cw + 10) p.x = -10;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.warm ? `rgba(255, 210, 135, ${currentAlpha})` : `rgba(255, 245, 230, ${currentAlpha * 0.8})`;
        ctx.fill();
    }
    requestAnimationFrame(drawAmbient);
}
drawAmbient();

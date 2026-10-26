const SECRET = "2027";

const LETTER = {
    title: "С наступающим 2027 годом!",
    body: "Бла бла бла бла ыыыыыыыыыы аыдадывадыда хахахахах лол бла балб алала ба бл.\n\nЧувак убери этот ствол от меня, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь, я боюсь.\n\nБла бла бла бла ыыыыыыыыыы аыдадывадыда хахахахах лол бла балб алала ба бл.",
    sign: "С теплом, ктота напишу патом"
};

const gate = document.getElementById("gate");
const hiddenPass = document.getElementById("hidden-pass");
const pinRow = document.getElementById("pin-row");
const slots = Array.from(document.querySelectorAll(".pin-slot"));
const chars = Array.from(document.querySelectorAll(".pin-char"));

const writingZone = document.getElementById("writing-zone");
const titleEl = document.getElementById("script-title");
const bodyEl = document.getElementById("script-body");
const signEl = document.getElementById("script-sign");
const pen = document.getElementById("fountain-pen");
const penBody = document.getElementById("pen-body");

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

window.addEventListener("keydown", (e) => {
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
            }, 1500);
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

let penState = {
    x: 80,
    y: 60,
    tx: 80,
    ty: 60,
    angle: 0,
    tAngle: 0,
    lift: 0,
    tLift: 0
};

function animatePenPhysics() {
    penState.x += (penState.tx - penState.x) * 0.28;
    penState.y += (penState.ty - penState.y) * 0.28;
    penState.angle += (penState.tAngle - penState.angle) * 0.22;
    penState.lift += (penState.tLift - penState.lift) * 0.25;

    const px = penState.x - 2;
    const py = penState.y - 138 - penState.lift;

    pen.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
    penBody.style.transform = `rotate(${penState.angle.toFixed(2)}deg)`;

    requestAnimationFrame(animatePenPhysics);
}

animatePenPhysics();

function setPenTarget(glyphSpan, isSpace = false) {
    const zoneBox = writingZone.getBoundingClientRect();
    const glyphBox = glyphSpan.getBoundingClientRect();

    penState.tx = glyphBox.right - zoneBox.left;
    penState.ty = glyphBox.bottom - zoneBox.top + writingZone.scrollTop - 3;

    if (isSpace) {
        penState.tLift = 5.5;
        penState.tAngle = -4;
    } else {
        penState.tLift = 0;
        penState.tAngle = (Math.random() - 0.45) * 6.5;
    }
}

function writeSection(target, content, baseSpeed) {
    return new Promise((resolve) => {
        let idx = 0;
        pen.classList.add("writing");

        function step() {
            if (idx >= content.length) {
                penState.tLift = 8;
                resolve();
                return;
            }

            const ch = content[idx];
            idx++;

            if (ch === "\n") {
                target.appendChild(document.createElement("br"));
                penState.tLift = 10;
                penState.tAngle = -6;
                setTimeout(step, baseSpeed * 6.2);
                return;
            }

            if (ch === " ") {
                const spaceNode = document.createElement("span");
                spaceNode.textContent = " ";
                target.appendChild(spaceNode);
                setPenTarget(spaceNode, true);
                setTimeout(step, baseSpeed * 1.35);
                return;
            }

            const span = document.createElement("span");
            span.className = "ink-stroke";
            span.textContent = ch;
            target.appendChild(span);

            requestAnimationFrame(() => {
                span.classList.add("wet");
                setPenTarget(span, false);

                setTimeout(() => {
                    span.classList.add("dry");
                }, 420);
            });

            let wait = baseSpeed + (Math.random() * 24 - 9);

            if (ch === "." || ch === "!" || ch === "—") {
                penState.tLift = 7;
                wait += 340;
            } else if (ch === ",") {
                penState.tLift = 4;
                wait += 170;
            }

            setTimeout(step, Math.max(18, wait));
        }

        step();
    });
}

async function startManuscript() {
    titleEl.innerHTML = "";
    bodyEl.innerHTML = "";
    signEl.innerHTML = "";

    await writeSection(titleEl, LETTER.title, 54);
    await new Promise(r => setTimeout(r, 420));
    await writeSection(bodyEl, LETTER.body, 38);
    await new Promise(r => setTimeout(r, 480));
    await writeSection(signEl, LETTER.sign, 48);

    pen.classList.remove("writing");
}

const canvas = document.getElementById("snow-canvas");
const ctx = canvas.getContext("2d");
let cw = 0;
let ch = 0;

function updateSize() {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
}

window.addEventListener("resize", updateSize);
updateSize();

const flakes = Array.from({ length: 75 }, () => ({
    x: Math.random() * cw,
    y: Math.random() * ch,
    r: Math.random() * 2.1 + 0.6,
    vy: Math.random() * 0.65 + 0.25,
    vx: (Math.random() - 0.5) * 0.25,
    alpha: Math.random() * 0.5 + 0.15,
    drift: Math.random() * Math.PI * 2
}));

function drawSnow() {
    ctx.clearRect(0, 0, cw, ch);

    for (const f of flakes) {
        f.drift += 0.012;
        f.x += f.vx + Math.sin(f.drift) * 0.22;
        f.y += f.vy;

        if (f.y > ch + 10) {
            f.y = -10;
            f.x = Math.random() * cw;
        }
        if (f.x < -10) f.x = cw + 10;
        if (f.x > cw + 10) f.x = -10;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235, 243, 255, ${f.alpha})`;
        ctx.fill();
    }

    requestAnimationFrame(drawSnow);
}

drawSnow();
/* ---------------------------------------------------------
   PlateWise — In-Restaurant Menu Scan prototype
   Sample data only. No real menu OCR — this simulates the
   scan-to-recommendation flow for demo purposes.
--------------------------------------------------------- */

const MENU = [
  {
    category: "Starters",
    items: [
      { name: "Burrata, heirloom tomato", price: "€9", tag: null },
      { name: "Fried calamari, lemon aioli", price: "€11", tag: null }
    ]
  },
  {
    category: "Mains",
    items: [
      {
        name: "Chicken Saltimbocca",
        price: "€19",
        tag: "best",
        reason: "38g protein, grilled not fried — fits your muscle-building goal better than anything else on this menu.",
        confidence: "92% fit"
      },
      {
        name: "Tagliatelle al ragù",
        price: "€16",
        tag: "okay",
        altReason: "Hearty, but carb-heavy for today's goal"
      },
      {
        name: "Branzino, lemon butter",
        price: "€23",
        tag: "good",
        altReason: "Lean and light — a solid second pick"
      },
      { name: "Wild mushroom risotto", price: "€17", tag: null }
    ]
  }
];

const STATUS_STEPS = [
  "Reading menu…",
  "Checking your goal: Build muscle",
  "Comparing 6 dishes…",
  "Ranking by protein and prep…"
];

/* ---------- state ---------- */
let currentScreen = "scan";
let cameraStream = null;
let timerHandle = null;
let timerStart = null;

/* ---------- elements ---------- */
const screens = {
  scan: document.getElementById("screen-scan"),
  analyzing: document.getElementById("screen-analyzing"),
  result: document.getElementById("screen-result")
};
const viewfinder = document.getElementById("viewfinder");
const cameraEl = document.getElementById("camera");
const shutterBtn = document.getElementById("shutterBtn");
const timerText = document.getElementById("timerText");
const analyzingSheet = document.getElementById("analyzingSheet");
const statusText = document.getElementById("statusText");
const resultSheet = document.getElementById("resultSheet");
const recCard = document.getElementById("recCard");
const recName = document.getElementById("recName");
const recReason = document.getElementById("recReason");
const orderBtn = document.getElementById("orderBtn");
const ctaConfirm = document.getElementById("ctaConfirm");
const altList = document.getElementById("altList");
const rescanBtn = document.getElementById("rescanBtn");

/* ---------- screen switching ---------- */
function goTo(name) {
  currentScreen = name;
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle("active", key === name);
  });
}

/* ---------- timer on the scan screen ---------- */
function startTimer() {
  timerStart = Date.now();
  clearInterval(timerHandle);
  timerHandle = setInterval(() => {
    const secs = Math.floor((Date.now() - timerStart) / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    timerText.textContent = `${m}:${String(s).padStart(2, "0")}`;
  }, 250);
}
function stopTimer() {
  clearInterval(timerHandle);
}

/* ---------- camera ---------- */
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });
    cameraEl.srcObject = cameraStream;
    viewfinder.classList.add("has-camera");
  } catch (err) {
    // No camera / permission denied — the sample-menu empty state stays visible.
    viewfinder.classList.remove("has-camera");
  }
}
function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((t) => t.stop());
    cameraStream = null;
  }
  viewfinder.classList.remove("has-camera");
}

/* ---------- render: analyzing screen (lines fading in) ---------- */
function renderAnalyzing() {
  analyzingSheet.querySelectorAll(".menu-cat, .menu-item").forEach((n) => n.remove());
  let delay = 0.35;
  MENU.forEach((section) => {
    const cat = document.createElement("div");
    cat.className = "menu-cat";
    cat.textContent = section.category;
    cat.style.animationDelay = `${delay}s`;
    analyzingSheet.appendChild(cat);
    delay += 0.12;

    section.items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "menu-item";
      row.style.animationDelay = `${delay}s`;
      row.innerHTML = `<span class="menu-item-name">${item.name}</span><span class="menu-item-price">${item.price}</span>`;
      analyzingSheet.appendChild(row);
      delay += 0.11;
    });
  });
}

function cycleStatus() {
  let i = 0;
  statusText.textContent = STATUS_STEPS[0];
  const handle = setInterval(() => {
    i++;
    if (i >= STATUS_STEPS.length) {
      clearInterval(handle);
      return;
    }
    statusText.textContent = STATUS_STEPS[i];
  }, 560);
}

/* ---------- render: result screen ---------- */
function renderResult() {
  resultSheet.querySelectorAll(".menu-cat, .menu-item, .highlight-circle").forEach((n) => n.remove());
  recCard.classList.remove("is-in");
  orderBtn.classList.remove("is-done");
  orderBtn.textContent = "Tell the waiter";
  ctaConfirm.textContent = "";

  let bestEl = null;
  const alts = [];

  MENU.forEach((section) => {
    const cat = document.createElement("div");
    cat.className = "menu-cat";
    cat.textContent = section.category;
    resultSheet.appendChild(cat);

    section.items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "menu-item" + (item.tag === "best" ? " is-best" : "");
      row.innerHTML = `<span class="menu-item-name">${item.name}</span><span class="menu-item-price">${item.price}</span>`;
      resultSheet.appendChild(row);
      if (item.tag === "best") {
        bestEl = row;
        recName.textContent = item.name;
        recReason.textContent = item.reason;
        document.querySelector(".rec-confidence").textContent = item.confidence;
      }
      if (item.tag === "good" || item.tag === "okay") {
        alts.push(item);
      }
    });
  });

  altList.innerHTML = "";
  alts.forEach((item) => {
    const row = document.createElement("div");
    row.className = "alt-item";
    row.innerHTML = `
      <span class="alt-dot ${item.tag}"></span>
      <span class="alt-name">${item.name}</span>
      <span class="alt-tag">${item.altReason}</span>
    `;
    altList.appendChild(row);
  });

  // Draw the hand-drawn highlight around the best row, once it's in the DOM.
  requestAnimationFrame(() => drawHighlight(bestEl));

  requestAnimationFrame(() => recCard.classList.add("is-in"));
}

function drawHighlight(targetEl) {
  if (!targetEl) return;
  const sheetRect = resultSheet.getBoundingClientRect();
  const rect = targetEl.getBoundingClientRect();

  const pad = 8;
  const x = rect.left - sheetRect.left - pad;
  const y = rect.top - sheetRect.top - pad;
  const w = rect.width + pad * 2;
  const h = rect.height + pad * 2;

  const cx = w / 2, cy = h / 2, rx = w / 2, ry = h / 2;

  // Slightly wobbly hand-drawn ellipse, four cubic segments with small jitter.
  const j = () => (Math.random() - 0.5) * 5;
  const p = [
    [cx, cy - ry], [cx + rx, cy - ry * 0.4], [cx + rx, cy + ry * 0.4], [cx, cy + ry],
    [cx - rx, cy + ry * 0.4], [cx - rx, cy - ry * 0.4], [cx, cy - ry]
  ].map(([px, py]) => [px + j(), py + j()]);

  const d = `M ${p[0][0]} ${p[0][1]}
             C ${p[1][0]} ${p[1][1]}, ${p[1][0]} ${p[1][1]}, ${p[2][0]} ${p[2][1]}
             C ${p[3][0]} ${p[3][1]}, ${p[3][0]} ${p[3][1]}, ${p[3][0]} ${p[3][1]}
             C ${p[4][0]} ${p[4][1]}, ${p[4][0]} ${p[4][1]}, ${p[5][0]} ${p[5][1]}
             C ${p[6][0]} ${p[6][1]}, ${p[6][0]} ${p[6][1]}, ${p[0][0]} ${p[0][1]}`;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "highlight-circle");
  svg.setAttribute("style", `left:${x}px; top:${y}px; width:${w}px; height:${h}px;`);
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
  resultSheet.appendChild(svg);
}

/* ---------- flow control ---------- */
function beginScanFlow() {
  stopTimer();
  goTo("analyzing");
  renderAnalyzing();
  cycleStatus();
  setTimeout(() => {
    goTo("result");
    renderResult();
  }, 2500);
}

function resetToScan() {
  goTo("scan");
  timerText.textContent = "0:00";
  startTimer();
  if (!cameraStream) setupCamera();
}

/* ---------- events ---------- */
shutterBtn.addEventListener("click", beginScanFlow);
rescanBtn.addEventListener("click", resetToScan);

orderBtn.addEventListener("click", () => {
  orderBtn.classList.add("is-done");
  orderBtn.textContent = "Got it";
  ctaConfirm.textContent = "Nice choice — enjoy.";
});

/* ---------- init ---------- */
startTimer();
setupCamera();

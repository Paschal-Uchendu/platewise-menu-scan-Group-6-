/* ---------------------------------------------------------
   Dishy — personal portfolio prototype
   Sample/mock data throughout. No real auth, no real payment,
   no real backend — this is a UI/interaction demo.
--------------------------------------------------------- */

const state = {
  goal: null,
  prefs: [],
  build: null,
  billingCycle: "monthly",
  selectedPlan: "free",
  planLabel: "Free plan",
  points: 0,
  scans: 0,
  streak: 1,
  paywallFrom: "onboarding"
};

const GOAL_LABELS = {
  lose: "Lose weight", maintain: "Maintain weight", muscle: "Build muscle",
  sugar: "Manage blood sugar", glp1: "GLP-1 support"
};
const PREF_LABELS = {
  veg: "Vegetarian", vegan: "Vegan", pescatarian: "Pescatarian",
  gluten: "Gluten-free", dairy: "Dairy-free", none: "No restrictions"
};
const BUILD_LABELS = { lean: "Lean", athletic: "Athletic", broader: "Broader", skip: "Prefer not to say" };

/* ---------- menu + goal-aware recommendation ---------- */
const MENU = [
  { category: "Starters", items: [
    { name: "Burrata, heirloom tomato", price: "€9" },
    { name: "Fried calamari, lemon aioli", price: "€11" }
  ]},
  { category: "Mains", items: [
    { name: "Chicken Saltimbocca", price: "€19" },
    { name: "Tagliatelle al ragù", price: "€16" },
    { name: "Branzino, lemon butter", price: "€23" },
    { name: "Wild mushroom risotto", price: "€17" }
  ]}
];

const GOAL_REASONS = {
  muscle: { best: "Chicken Saltimbocca", confidence: "92% fit",
    reason: "38g protein, grilled not fried — fits your muscle-building goal better than anything else here.",
    alts: [{ name: "Branzino, lemon butter", tag: "good", altReason: "Lean and light — solid second pick" },
           { name: "Tagliatelle al ragù", tag: "okay", altReason: "Tasty, but light on protein" }] },
  lose: { best: "Branzino, lemon butter", confidence: "88% fit",
    reason: "Lean white fish, lighter prep — keeps calories down without leaving you hungry.",
    alts: [{ name: "Chicken Saltimbocca", tag: "good", altReason: "Great protein, slightly richer" },
           { name: "Wild mushroom risotto", tag: "okay", altReason: "Comforting, but calorie-dense" }] },
  sugar: { best: "Branzino, lemon butter", confidence: "85% fit",
    reason: "Low-carb and protein-forward — pairs well with a short walk after to help manage the post-meal rise.",
    alts: [{ name: "Chicken Saltimbocca", tag: "good", altReason: "Also low-carb, a touch richer" },
           { name: "Tagliatelle al ragù", tag: "okay", altReason: "Refined carbs — ask for a smaller portion" }] },
  glp1: { best: "Chicken Saltimbocca", confidence: "90% fit",
    reason: "High protein in a smaller portion, grilled not greasy — easier on appetite suppression and less likely to trigger nausea.",
    alts: [{ name: "Branzino, lemon butter", tag: "good", altReason: "Light and easy to finish" },
           { name: "Fried calamari, lemon aioli", tag: "okay", altReason: "Fried food is more likely to cause discomfort right now" }] },
  maintain: { best: "Chicken Saltimbocca", confidence: "87% fit",
    reason: "A balanced plate — solid protein without tipping into a heavy, over-full feeling.",
    alts: [{ name: "Branzino, lemon butter", tag: "good", altReason: "Equally balanced, lighter finish" },
           { name: "Wild mushroom risotto", tag: "okay", altReason: "Save this one for a lower-activity day" }] }
};

/* ---------- leaderboard mock data ---------- */
const FRIENDS_WEEK = [
  { name: "Marco", points: 340 }, { name: "Elena", points: 275 },
  { name: "Jonas", points: 210 }, { name: "Priya", points: 150 }, { name: "Sam", points: 90 }
];
const FRIENDS_ALLTIME = [
  { name: "Marco", points: 2140 }, { name: "Elena", points: 1890 },
  { name: "Jonas", points: 1420 }, { name: "Priya", points: 980 }, { name: "Sam", points: 640 }
];
let boardRange = "week";

/* =====================================================
   TOP-LEVEL SCREEN SWITCHING
===================================================== */
const topScreens = ["splash", "login", "onboard", "paywall", "app"];
function goTop(name) {
  topScreens.forEach((s) => document.getElementById("scr-" + s).classList.toggle("active", s === name));
}

/* =====================================================
   SPLASH
===================================================== */
let splashEntered = false;
function enterFromSplash() {
  if (splashEntered) return;
  splashEntered = true;
  const wipe = document.getElementById("wipe");
  wipe.classList.add("is-wiping");
  setTimeout(() => {
    goTop("login");
    wipe.classList.add("is-fading");
    setTimeout(() => {
      wipe.classList.remove("is-wiping", "is-fading");
    }, 420);
  }, 600);
}
// Bind on several event types in case something on the page (an extension,
// an overlay) swallows one kind of event — belt and suspenders.
["click", "pointerup", "touchend"].forEach((evt) => {
  document.getElementById("splashEnter").addEventListener(evt, enterFromSplash);
});
document.getElementById("scr-splash").addEventListener("click", (e) => {
  if (e.target.id === "scr-splash") enterFromSplash();
});
// Safety net: if nothing fires the transition within 6s (e.g. a stubborn
// extension blocking clicks), advance automatically so no one gets stuck.
setTimeout(() => { if (!splashEntered) enterFromSplash(); }, 6000);

/* =====================================================
   LOGIN
===================================================== */
const toggleLogin = document.getElementById("toggleLogin");
const toggleSignup = document.getElementById("toggleSignup");
toggleLogin.addEventListener("click", () => {
  toggleLogin.classList.add("is-on"); toggleSignup.classList.remove("is-on");
});
toggleSignup.addEventListener("click", () => {
  toggleSignup.classList.add("is-on"); toggleLogin.classList.remove("is-on");
});
document.getElementById("authContinue").addEventListener("click", () => {
  goTop("onboard");
  setObStep(1);
});
document.querySelectorAll(".social-btn").forEach((btn) => {
  btn.addEventListener("click", () => { goTop("onboard"); setObStep(1); });
});

/* =====================================================
   ONBOARDING
===================================================== */
let obStep = 1;
const OB_STEPS = 3;
const obBack = document.getElementById("obBack");
const obNext = document.getElementById("obNext");

function setObStep(n) {
  obStep = n;
  document.querySelectorAll(".ob-step").forEach((el) => el.classList.remove("is-active"));
  document.getElementById("ob-step-" + n).classList.add("is-active");
  document.querySelectorAll(".ob-dot").forEach((dot) => {
    const step = Number(dot.dataset.step);
    dot.classList.toggle("is-done", step < n);
    dot.classList.toggle("is-on", step === n);
  });
  obBack.classList.toggle("is-visible", n > 1);
  obNext.textContent = n === OB_STEPS ? "Continue" : "Next";
  updateNextEnabled();
}
function updateNextEnabled() {
  if (obStep === 1) obNext.disabled = !state.goal;
  else if (obStep === 2) obNext.disabled = false; // preferences optional
  else obNext.disabled = false; // build optional
}

document.getElementById("goalChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".ob-chip");
  if (!chip) return;
  document.querySelectorAll("#goalChips .ob-chip").forEach((c) => c.classList.remove("is-selected"));
  chip.classList.add("is-selected");
  state.goal = chip.dataset.value;
  updateNextEnabled();
});

document.getElementById("prefChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".ob-chip");
  if (!chip) return;
  const val = chip.dataset.value;
  if (val === "none") {
    document.querySelectorAll("#prefChips .ob-chip").forEach((c) => c.classList.remove("is-selected"));
    chip.classList.add("is-selected");
    state.prefs = ["none"];
  } else {
    document.querySelector('#prefChips .ob-chip[data-value="none"]').classList.remove("is-selected");
    chip.classList.toggle("is-selected");
    state.prefs = state.prefs.filter((p) => p !== "none");
    if (chip.classList.contains("is-selected")) state.prefs.push(val);
    else state.prefs = state.prefs.filter((p) => p !== val);
  }
});

document.getElementById("buildChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".ob-chip");
  if (!chip) return;
  document.querySelectorAll("#buildChips .ob-chip").forEach((c) => c.classList.remove("is-selected"));
  chip.classList.add("is-selected");
  state.build = chip.dataset.value;
});

obBack.addEventListener("click", () => { if (obStep > 1) setObStep(obStep - 1); });
obNext.addEventListener("click", () => {
  if (obStep < OB_STEPS) setObStep(obStep + 1);
  else {
    state.paywallFrom = "onboarding";
    goTop("paywall");
    resetPaywallUI();
  }
});

/* =====================================================
   PAYWALL
===================================================== */
const payForm = document.getElementById("payForm");
const paywallContinue = document.getElementById("paywallContinue");

document.querySelectorAll(".billing-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".billing-btn").forEach((b) => b.classList.remove("is-on"));
    btn.classList.add("is-on");
    state.billingCycle = btn.dataset.cycle;
    document.querySelectorAll(".plan-price[data-monthly]").forEach((priceEl) => {
      const val = state.billingCycle === "annual" ? priceEl.dataset.annual : priceEl.dataset.monthly;
      priceEl.innerHTML = val + "<small>/mo</small>";
    });
  });
});

document.getElementById("plans").addEventListener("click", (e) => {
  const card = e.target.closest(".plan-card");
  if (!card) return;
  document.querySelectorAll(".plan-card").forEach((c) => c.classList.remove("is-selected"));
  card.classList.add("is-selected");
  state.selectedPlan = card.dataset.plan;
  const isFree = state.selectedPlan === "free";
  payForm.classList.toggle("is-open", !isFree);
  paywallContinue.textContent = isFree ? "Continue for free" : "Start free trial";
});

function resetPaywallUI() {
  document.querySelectorAll(".plan-card").forEach((c) => c.classList.remove("is-selected"));
  payForm.classList.remove("is-open");
  paywallContinue.textContent = "Continue for free";
  state.selectedPlan = "free";
}

document.getElementById("cardNumber").addEventListener("input", (e) => {
  let digits = e.target.value.replace(/\D/g, "").slice(0, 16);
  e.target.value = digits.replace(/(.{4})/g, "$1 ").trim();
});

document.getElementById("paywallClose").addEventListener("click", () => {
  if (state.paywallFrom === "profile") goTop("app");
  else setObStep(OB_STEPS);
  if (state.paywallFrom === "onboarding") goTop("onboard");
});

paywallContinue.addEventListener("click", () => {
  const planNames = { free: "Free plan", plus: "Plus plan", pro: "Pro plan" };
  state.planLabel = planNames[state.selectedPlan];
  document.getElementById("profilePlan").textContent = state.planLabel;
  if (state.paywallFrom === "profile") {
    goTop("app");
  } else {
    enterApp();
  }
});

/* =====================================================
   MAIN APP SHELL
===================================================== */
function enterApp() {
  goTop("app");
  renderProfile();
  renderBoard();
  document.getElementById("pointsVal").textContent = state.points;
}

/* tab switching */
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const tab = btn.dataset.tab;
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("is-active"));
    document.getElementById("tab-" + tab).classList.add("is-active");
    if (tab === "board") renderBoard();
    if (tab === "profile") renderProfile();
  });
});

/* ---------- Scan sub-flow ---------- */
const miniScreens = ["scanScreen", "analyzingScreen", "resultScreen"];
function goMini(id) {
  miniScreens.forEach((s) => document.getElementById(s).classList.toggle("is-active", s === id));
}
const analyzingSheet = document.getElementById("analyzingSheet");
const statusText = document.getElementById("statusText");
const resultSheet = document.getElementById("resultSheet");
const recCard = document.getElementById("recCard");
const recName = document.getElementById("recName");
const recReason = document.getElementById("recReason");
const recConf = document.getElementById("recConf");
const orderBtn = document.getElementById("orderBtn");
const ctaConfirm = document.getElementById("ctaConfirm");

const STATUS_STEPS = ["Reading menu…", "Checking your goal…", "Comparing 6 dishes…", "Ranking by fit…"];

function renderAnalyzing() {
  analyzingSheet.querySelectorAll(".menu-cat,.menu-item").forEach((n) => n.remove());
  let delay = 0.3;
  MENU.forEach((section) => {
    const cat = document.createElement("div");
    cat.className = "menu-cat"; cat.textContent = section.category;
    cat.style.animationDelay = delay + "s"; analyzingSheet.appendChild(cat); delay += 0.1;
    section.items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "menu-item"; row.style.animationDelay = delay + "s";
      row.innerHTML = `<span class="menu-item-name">${item.name}</span><span class="menu-item-price">${item.price}</span>`;
      analyzingSheet.appendChild(row); delay += 0.1;
    });
  });
}
function cycleStatus() {
  let i = 0; statusText.textContent = STATUS_STEPS[0];
  const h = setInterval(() => { i++; if (i >= STATUS_STEPS.length) { clearInterval(h); return; } statusText.textContent = STATUS_STEPS[i]; }, 500);
}
function drawHighlight(targetEl) {
  if (!targetEl) return;
  const sheetRect = resultSheet.getBoundingClientRect();
  const rect = targetEl.getBoundingClientRect();
  const pad = 7;
  const x = rect.left - sheetRect.left - pad, y = rect.top - sheetRect.top - pad;
  const w = rect.width + pad * 2, h = rect.height + pad * 2;
  const cx = w / 2, cy = h / 2, rx = w / 2, ry = h / 2;
  const j = () => (Math.random() - 0.5) * 4;
  const p = [[cx, cy - ry], [cx + rx, cy - ry * 0.4], [cx + rx, cy + ry * 0.4], [cx, cy + ry],
             [cx - rx, cy + ry * 0.4], [cx - rx, cy - ry * 0.4], [cx, cy - ry]].map(([px, py]) => [px + j(), py + j()]);
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
function renderResult() {
  resultSheet.querySelectorAll(".menu-cat,.menu-item,.highlight-circle").forEach((n) => n.remove());
  recCard.classList.remove("is-in");
  orderBtn.classList.remove("is-done");
  orderBtn.textContent = "Tell the waiter";
  ctaConfirm.textContent = "";

  const goalKey = state.goal || "muscle";
  const rec = GOAL_REASONS[goalKey];
  let bestEl = null;

  MENU.forEach((section) => {
    const cat = document.createElement("div");
    cat.className = "menu-cat"; cat.textContent = section.category;
    resultSheet.appendChild(cat);
    section.items.forEach((item) => {
      const isBest = item.name === rec.best;
      const row = document.createElement("div");
      row.className = "menu-item" + (isBest ? " is-best" : "");
      row.innerHTML = `<span class="menu-item-name">${item.name}</span><span class="menu-item-price">${item.price}</span>`;
      resultSheet.appendChild(row);
      if (isBest) bestEl = row;
    });
  });

  recName.textContent = rec.best;
  recReason.textContent = rec.reason;
  recConf.textContent = rec.confidence;

  requestAnimationFrame(() => drawHighlight(bestEl));
  requestAnimationFrame(() => recCard.classList.add("is-in"));

  // award points for the scan
  state.points += 10;
  state.scans += 1;
  document.getElementById("pointsVal").textContent = state.points;
}

document.getElementById("shutterBtn").addEventListener("click", () => {
  goMini("analyzingScreen");
  renderAnalyzing();
  cycleStatus();
  setTimeout(() => { goMini("resultScreen"); renderResult(); }, 2300);
});
document.getElementById("rescanBtn").addEventListener("click", () => goMini("scanScreen"));
orderBtn.addEventListener("click", () => {
  orderBtn.classList.add("is-done");
  orderBtn.textContent = "Got it";
  ctaConfirm.textContent = "Nice choice — enjoy.";
});

/* ---------- Leaderboard ---------- */
function renderBoard() {
  const listEl = document.getElementById("boardList");
  listEl.innerHTML = "";
  const friends = boardRange === "week" ? FRIENDS_WEEK : FRIENDS_ALLTIME;
  const yourPoints = boardRange === "week" ? state.points : state.points + 480;
  const rows = [...friends, { name: "You", points: yourPoints, isYou: true }]
    .sort((a, b) => b.points - a.points);

  rows.forEach((row, i) => {
    const el = document.createElement("div");
    el.className = "board-row" + (row.isYou ? " is-you" : "");
    const initials = row.name.slice(0, 1).toUpperCase();
    el.innerHTML = `
      <span class="board-rank">#${i + 1}</span>
      <span class="board-avatar">${initials}</span>
      <span class="board-name">${row.name}${row.isYou ? " (you)" : ""}</span>
      <span class="board-pts">${row.points} pts</span>
    `;
    listEl.appendChild(el);
  });
}
document.querySelectorAll(".range-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".range-btn").forEach((b) => b.classList.remove("is-on"));
    btn.classList.add("is-on");
    boardRange = btn.dataset.range;
    renderBoard();
  });
});

/* ---------- Add friend modal ---------- */
const friendModal = document.getElementById("friendModalBackdrop");
document.getElementById("addFriendBtn").addEventListener("click", () => friendModal.classList.add("is-open"));
document.getElementById("closeFriendModal").addEventListener("click", () => friendModal.classList.remove("is-open"));
document.getElementById("copyCodeBtn").addEventListener("click", () => {
  const code = document.getElementById("inviteCode").textContent;
  const btn = document.getElementById("copyCodeBtn");
  const done = () => { btn.textContent = "Copied!"; setTimeout(() => (btn.textContent = "Copy code"), 1400); };
  if (navigator.clipboard) navigator.clipboard.writeText(code).then(done).catch(done);
  else done();
});

/* ---------- Profile ---------- */
function renderProfile() {
  document.getElementById("statPoints").textContent = state.points;
  document.getElementById("statStreak").textContent = state.streak;
  document.getElementById("statScans").textContent = state.scans;
  document.getElementById("profileGoal").textContent = state.goal ? GOAL_LABELS[state.goal] : "Not set";
  document.getElementById("profilePrefs").textContent = state.prefs.length
    ? state.prefs.map((p) => PREF_LABELS[p]).join(", ") : "None set";
  document.getElementById("profileBuild").textContent = state.build ? BUILD_LABELS[state.build] : "Not set";
  document.getElementById("profilePlan").textContent = state.planLabel;
}
document.getElementById("manageSubBtn").addEventListener("click", () => {
  state.paywallFrom = "profile";
  goTop("paywall");
  resetPaywallUI();
});
document.getElementById("logoutBtn").addEventListener("click", () => {
  // reset to a fresh session
  state.goal = null; state.prefs = []; state.build = null;
  state.points = 0; state.scans = 0; state.planLabel = "Free plan";
  goTop("splash");
});

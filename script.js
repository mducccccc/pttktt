/* ===================== NAV ===================== */
function show(id, el) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (el) el.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function switchTab(el, contentId) {
  const section = el.closest(".section");
  section.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  section
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));
  el.classList.add("active");
  document.getElementById(contentId).classList.add("active");
}

/* ===================== GREEDY: SCHEDULE VIZ ===================== */
(function () {
  // Jobs sorted by finish time: {id, s, f, color}
  const JOBS = [
    { id: "A", s: 1, f: 3, color: "#3b82f6" },
    { id: "B", s: 2, f: 4, color: "#f97316" },
    { id: "C", s: 3, f: 5, color: "#a855f7" },
    { id: "D", s: 4, f: 6, color: "#14b8a6" },
    { id: "E", s: 5, f: 7, color: "#f59e0b" },
    { id: "F", s: 7, f: 9, color: "#22c55e" },
  ];
  const MAX_T = 10;

  let steps = [],
    stepIdx = -1;
  let started = false;

  function buildSteps() {
    steps = [];
    steps.push({
      type: "init",
      msg: '<span class="info">Đã sắp xếp công việc theo thời gian kết thúc tăng dần.</span>',
    });
    let lastFinish = -1;
    for (let i = 0; i < JOBS.length; i++) {
      const j = JOBS[i];
      steps.push({
        type: "consider",
        idx: i,
        lastFinish,
        msg: `<span class="info">Xét job ${j.id} [s=${j.s}, f=${j.f}]: s=${j.s} ${j.s >= lastFinish ? "≥" : "&lt;"} lastFinish=${lastFinish}</span>`,
      });
      if (j.s >= lastFinish) {
        steps.push({
          type: "select",
          idx: i,
          lastFinish: j.f,
          msg: `<span class="ok">✓ Chọn job ${j.id}! Cập nhật lastFinish = ${j.f}</span>`,
        });
        lastFinish = j.f;
      } else {
        steps.push({
          type: "reject",
          idx: i,
          lastFinish,
          msg: `<span class="no">✗ Bỏ qua job ${j.id} (chồng với công việc đã chọn)</span>`,
        });
      }
    }
    steps.push({
      type: "done",
      msg: '<span class="ok">✅ Hoàn thành! Các job được chọn: A, C, E, F</span>',
    });
  }

  function renderArena(states) {
    const arena = document.getElementById("sch-arena");
    // Remove old bars
    arena.querySelectorAll(".sched-bar").forEach((b) => b.remove());

    const W = arena.offsetWidth || 580;
    const usableW = W - 32;
    const scale = usableW / MAX_T;

    // ticks
    const ticks = document.getElementById("sch-ticks");
    if (ticks.children.length === 0) {
      for (let t = 0; t <= MAX_T; t++) {
        const tk = document.createElement("div");
        tk.className = "sched-tick";
        tk.textContent = t;
        tk.style.left = 16 + t * scale + "px";
        ticks.appendChild(tk);
      }
    }

    const COLORS = [
      "#3b82f6",
      "#f97316",
      "#a855f7",
      "#14b8a6",
      "#f59e0b",
      "#22c55e",
    ];
    JOBS.forEach((j, i) => {
      const bar = document.createElement("div");
      bar.className = "sched-bar " + (states[i] || "pending");
      bar.style.left = 16 + j.s * scale + "px";
      bar.style.width = (j.f - j.s) * scale - 2 + "px";
      bar.style.background = COLORS[i];
      bar.style.top = states[i] === "selected" ? "24px" : "38px";
      bar.textContent = j.id;
      arena.appendChild(bar);
    });
  }

  function applyStep(idx) {
    const s = steps[idx];
    const states = new Array(JOBS.length).fill("pending");

    // Build states up to current step
    for (let k = 0; k <= idx; k++) {
      const st = steps[k];
      if (st.type === "select") states[st.idx] = "selected";
      if (st.type === "reject") states[st.idx] = "rejected";
    }
    if (s.type === "consider") states[s.idx] = "current";

    renderArena(states);
    document.getElementById("sch-log").innerHTML = s.msg;
    document.getElementById("sch-step-info").textContent =
      `Bước ${idx + 1}/${steps.length}`;
  }

  function init() {
    buildSteps();
    stepIdx = -1;
    started = false;
    document.getElementById("sch-play").disabled = false;
    document.getElementById("sch-next").disabled = true;
    document.getElementById("sch-step-info").textContent = "Nhấn Bắt đầu";
    document.getElementById("sch-log").innerHTML =
      "Nhấn <strong>Bắt đầu</strong> để xem thuật toán tham lam từng bước.";
    const arena = document.getElementById("sch-arena");
    arena.querySelectorAll(".sched-bar").forEach((b) => b.remove());
    const ticks = document.getElementById("sch-ticks");
    ticks.innerHTML = "";
    renderArena(new Array(JOBS.length).fill("pending"));
  }

  document.getElementById("sch-play").addEventListener("click", function () {
    if (!started) {
      started = true;
      buildSteps();
    }
    stepIdx = 0;
    this.disabled = true;
    document.getElementById("sch-next").disabled = false;
    applyStep(stepIdx);
  });
  document.getElementById("sch-next").addEventListener("click", function () {
    stepIdx++;
    if (stepIdx >= steps.length) {
      this.disabled = true;
      return;
    }
    applyStep(stepIdx);
    if (stepIdx >= steps.length - 1) this.disabled = true;
  });
  document.getElementById("sch-reset").addEventListener("click", init);

  window.addEventListener("load", () => setTimeout(init, 100));
})();

/* ===================== GREEDY: DANCE VIZ ===================== */
(function () {
  const M_RAW = [180, 170, 165, 160];
  const F_RAW = [178, 130, 175, 150];
  const M = [...M_RAW].sort((a, b) => b - a);
  const F = [...F_RAW].sort((a, b) => b - a);

  let steps = [],
    stepIdx = -1,
    started = false;

  function buildSteps() {
    steps = [];
    steps.push({
      type: "init",
      msg: `<span class="info">Sắp xếp giảm dần: Nam=[${M.join(",")}], Nữ=[${F.join(",")}]</span>`,
      paired: [],
      currI: -1,
      currJ: -1,
      skippedJ: [],
      res: 0,
    });

    let j = 0;
    let res = 0;
    let paired = [];
    let skippedJ = [];

    for (let i = 0; i < M.length; i++) {
      steps.push({
        type: "consider",
        currI: i,
        currJ: j < F.length ? j : -1,
        msg: `<span class="info">Xét Nam ${M[i]} (i=${i}): Tìm nữ thấp hơn bắt đầu từ j=${j}</span>`,
        paired: [...paired],
        skippedJ: [...skippedJ],
        res: res,
      });

      while (j < F.length && F[j] >= M[i]) {
        steps.push({
          type: "skip",
          currI: i,
          currJ: j,
          msg: `<span class="no">✗ Nữ ${F[j]} >= Nam ${M[i]} → Bỏ qua nữ ở vị trí j=${j}</span>`,
          paired: [...paired],
          skippedJ: [...skippedJ],
          res: res,
        });
        skippedJ.push(j);
        j++;
      }

      if (j < F.length) {
        paired.push({ m: i, f: j });
        steps.push({
          type: "match",
          currI: i,
          currJ: j,
          msg: `<span class="ok">✓ Nam ${M[i]} > Nữ ${F[j]} → Ghép cặp (i=${i}, j=${j})! Số cặp = ${res + 1}</span>`,
          paired: [...paired],
          skippedJ: [...skippedJ],
          res: res + 1,
        });
        res++;
        j++;
      } else {
        steps.push({
          type: "fail",
          currI: i,
          currJ: -1,
          msg: `<span class="no">✗ Không còn nữ nào thấp hơn Nam ${M[i]}</span>`,
          paired: [...paired],
          skippedJ: [...skippedJ],
          res: res,
        });
      }
    }

    steps.push({
      type: "done",
      msg: `<span class="ok">✅ Thuật toán kết thúc! Tổng số cặp ghép được: ${res}</span>`,
      paired: [...paired],
      currI: -1,
      currJ: -1,
      skippedJ: [...skippedJ],
      res: res,
    });
  }

  function renderDance(state) {
    const arena = document.getElementById("dance-arena");
    let html = '<div style="display:flex; flex-direction:column; gap:20px;">';

    // Mảng Nam
    html += '<div style="display:flex; gap:10px; align-items:flex-end;">';
    html +=
      '<div style="width:60px; font-weight:bold; color:#93c5fd; padding-bottom:5px;">Nam (a):</div>';
    for (let i = 0; i < M.length; i++) {
      const active = i === state.currI;
      const isPaired = state.paired.some((p) => p.m === i);
      const color = isPaired ? "#22c55e" : active ? "#4a9eff" : "#2d3748";

      html += `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
              <div style="background:${color};border-radius:4px;width:38px;display:flex;align-items:center;justify-content:center;height:28px;border:1px solid ${isPaired ? "#22c55e" : active ? "#4a9eff" : "#374151"};color:${isPaired || active ? "#111" : "#e2e8f0"};font-size:13px;font-weight:bold;transition:all 0.3s;">
                ${M[i]}
              </div>
              <div style="font-size:11px;color:#64748b">i=${i}</div>
            </div>`;
    }
    html += "</div>";

    // Mảng Nữ
    html += '<div style="display:flex; gap:10px; align-items:flex-end;">';
    html +=
      '<div style="width:60px; font-weight:bold; color:#fca5a5; padding-bottom:5px;">Nữ (b):</div>';
    for (let j = 0; j < F.length; j++) {
      const active = j === state.currJ;
      const isPaired = state.paired.some((p) => p.f === j);
      const isSkipped = state.skippedJ.includes(j);
      const color = isPaired
        ? "#22c55e"
        : isSkipped
          ? "#ef4444"
          : active
            ? "#fca5a5"
            : "#2d3748";
      const textColor = isPaired || isSkipped || active ? "#111" : "#e2e8f0";

      html += `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
              <div style="background:${color};border-radius:4px;width:38px;display:flex;align-items:center;justify-content:center;height:28px;border:1px solid ${isPaired ? "#22c55e" : isSkipped ? "#ef4444" : active ? "#fca5a5" : "#374151"};color:${textColor};font-size:13px;font-weight:bold;transition:all 0.3s;">
                ${F[j]}
              </div>
              <div style="font-size:11px;color:#64748b">j=${j}</div>
            </div>`;
    }
    html += "</div>";

    // Danh sách các cặp
    if (state.paired.length > 0) {
      html +=
        `<div style="margin-top:10px; font-size:14px; color:#a7f3d0; background:#064e3b; padding:8px 12px; border-radius:6px; border:1px solid #059669;">
              <strong>Các cặp đã ghép:</strong> ` +
        state.paired.map((p) => `(${M[p.m]}, ${F[p.f]})`).join(" | ") +
        `</div>`;
    }

    html += "</div>";
    arena.innerHTML = html;
  }

  function applyStep(idx) {
    const s = steps[idx];
    renderDance(s);
    document.getElementById("dance-log").innerHTML = s.msg;
    document.getElementById("dance-step-info").textContent =
      `Bước ${idx + 1}/${steps.length}`;
  }

  function init() {
    buildSteps();
    stepIdx = -1;
    started = false;
    document.getElementById("dance-play").disabled = false;
    document.getElementById("dance-next").disabled = true;
    document.getElementById("dance-step-info").textContent = "Nhấn Bắt đầu";
    document.getElementById("dance-log").innerHTML =
      "Nhấn <strong>Bắt đầu</strong> để xem thuật toán từng bước.";
    renderDance({
      currI: -1,
      currJ: -1,
      paired: [],
      skippedJ: [],
      res: 0,
    });
  }

  document.getElementById("dance-play").addEventListener("click", function () {
    buildSteps();
    started = true;
    stepIdx = 0;
    this.disabled = true;
    document.getElementById("dance-next").disabled = false;
    applyStep(stepIdx);
  });
  document.getElementById("dance-next").addEventListener("click", function () {
    stepIdx++;
    if (stepIdx >= steps.length) {
      this.disabled = true;
      return;
    }
    applyStep(stepIdx);
    if (stepIdx >= steps.length - 1) this.disabled = true;
  });
  document.getElementById("dance-reset").addEventListener("click", init);
  window.addEventListener("load", () => setTimeout(init, 200));
})();

/* ===================== BACKTRACKING: N-QUEENS TREE ===================== */
(function () {
  // N=4, precomputed tree structure with steps
  // Nodes: {id, label, x, y, parent, state}
  // States progress: inactive → active → success/pruned
  const N = 4;

  // Build a simplified tree (2 levels deep to show pruning)
  const n = 4;
  let nodes = [];
  let steps = [];
  let xOffset = 20;

  function buildTree() {
    nodes = [];
    steps = [];
    let currentId = 0;
    nodes.push({
      id: 0,
      label: "root",
      depth: 0,
      parent: -1,
      state: "inactive",
      children: [],
    });

    function dfs(k, parentId, board) {
      if (k === n) {
        let sol = board.map((t, i) => `(${i + 1},${t + 1})`).join(" ");
        steps.push({
          activate: [],
          success: [parentId],
          msg: `<span class="ok">✅ Đạt k=4 → Lời giải: ${sol}</span>`,
        });
        return;
      }

      let curNodes = [];
      for (let t = 0; t < n; t++) {
        currentId++;
        let myId = currentId;
        let isSafe = true;
        for (let i = 0; i < k; i++) {
          if (board[i] === t || Math.abs(k - i) === Math.abs(t - board[i])) {
            isSafe = false;
            break;
          }
        }
        nodes.push({
          id: myId,
          label: `k${k},t${t}`,
          depth: k + 1,
          parent: parentId,
          state: "inactive",
          children: [],
          isSafe: isSafe,
        });
        nodes[parentId].children.push(myId);
        curNodes.push(myId);
      }

      steps.push({
        activate: curNodes,
        msg: `<span class="info">TRY(${k}): Duyệt 4 cột t=0,1,2,3</span>`,
      });

      for (let t = 0; t < n; t++) {
        let myId = curNodes[t];
        if (!nodes[myId].isSafe) {
          steps.push({
            prune: [myId],
            msg: `<span class="no">✗ TRY(${k}): Thử t=${t} — xung đột, quay lui</span>`,
          });
        } else {
          steps.push({
            activate: [myId],
            msg: `<span class="info">TRY(${k}): Thử t=${t} — an toàn, gọi TRY(${k + 1})</span>`,
          });
          board.push(t);
          dfs(k + 1, myId, board);
          board.pop();
        }
      }
      if (k > 0) {
        steps.push({
          msg: `<span class="info">↩ Duyệt xong TRY(${k}), quay lui về TRY(${k - 1})</span>`,
        });
      }
    }

    dfs(0, 0, []);
    steps.push({
      msg: `<span class="ok">✅ Hoàn thành! In ra:<br>1 (1,2) (2,4) (3,1) (4,3)<br>2 (1,3) (2,1) (3,4) (4,2)</span>`,
    });

    xOffset = 20;
    function layout(nodeId) {
      let node = nodes[nodeId];
      node.y = node.depth * 65 + 25;
      if (node.children.length === 0) {
        node.x = xOffset;
        xOffset += 24;
      } else {
        let sumX = 0;
        node.children.forEach((childId) => {
          layout(childId);
          sumX += nodes[childId].x;
        });
        node.x = sumX / node.children.length;
      }
    }
    layout(0);
  }

  buildTree();

  let stepIdx = -1;
  let nodeStates = {};
  let started = false;

  function resetStates() {
    nodeStates = {};
    nodes.forEach((n) => (nodeStates[n.id] = "inactive"));
  }

  function renderTree() {
    const svg = document.getElementById("bt-svg");
    svg.setAttribute("width", Math.max(640, xOffset + 20));
    svg.setAttribute("viewBox", `0 0 ${Math.max(640, xOffset + 20)} 340`);

    const edgesG = document.getElementById("bt-edges");
    const nodesG = document.getElementById("bt-nodes");
    edgesG.innerHTML = "";
    nodesG.innerHTML = "";

    // Draw edges
    nodes.forEach((n) => {
      if (n.parent < 0) return;
      const p = nodes[n.parent];
      const ns = nodeStates[n.id];
      const ps = nodeStates[n.parent];
      let cls = "bt-edge";
      if (ns === "success" || ps === "success") cls += " success";
      else if (ns === "pruned") cls += " pruned";
      else if (ns === "active") cls += " active";
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", p.x);
      line.setAttribute("y1", p.y + 11);
      line.setAttribute("x2", n.x);
      line.setAttribute("y2", n.y - 11);
      line.setAttribute("class", cls);
      edgesG.appendChild(line);
    });

    // Draw nodes
    nodes.forEach((n) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "bt-node " + nodeStates[n.id]);

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", n.x);
      circle.setAttribute("cy", n.y);
      circle.setAttribute("r", 12);
      g.appendChild(circle);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("x", n.x);
      text.setAttribute("y", n.y + 1);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("font-size", "7.5");
      text.textContent =
        n.label === "root"
          ? "root"
          : n.label.replace("k", "").replace("t", "").replace(",", "|");
      g.appendChild(text);

      nodesG.appendChild(g);
    });
  }

  function applyStep(idx) {
    const s = steps[idx];
    if (s.activate)
      s.activate.forEach((id) => {
        nodeStates[id] = "active";
      });
    if (s.activate2)
      s.activate2.forEach((id) => {
        nodeStates[id] = "active";
      });
    if (s.prune)
      s.prune.forEach((id) => {
        nodeStates[id] = "pruned";
      });
    if (s.success)
      s.success.forEach((id) => {
        nodeStates[id] = "success";
      });
    renderTree();
    document.getElementById("bt-log").innerHTML = s.msg || "";
    document.getElementById("bt-step-info").textContent =
      `Bước ${idx + 1}/${steps.length}`;
  }

  function init() {
    resetStates();
    stepIdx = -1;
    started = false;
    document.getElementById("bt-play").disabled = false;
    document.getElementById("bt-next").disabled = true;
    document.getElementById("bt-step-info").textContent = "Nhấn Bắt đầu";
    document.getElementById("bt-log").innerHTML =
      "Nhấn <strong>Bắt đầu</strong> để xem cây quay lui được xây dựng từng bước.";
    renderTree();
  }

  document.getElementById("bt-play").addEventListener("click", function () {
    started = true;
    stepIdx = 0;
    this.disabled = true;
    document.getElementById("bt-next").disabled = false;
    applyStep(stepIdx);
  });
  document.getElementById("bt-next").addEventListener("click", function () {
    stepIdx++;
    if (stepIdx >= steps.length) {
      this.disabled = true;
      return;
    }
    applyStep(stepIdx);
    if (stepIdx >= steps.length - 1) this.disabled = true;
  });
  document.getElementById("bt-reset").addEventListener("click", init);
  window.addEventListener("load", () => setTimeout(init, 300));
})();

/* ===================== BACKTRACKING: DIVIDE TREE ===================== */
(function () {
  const a = [47, 28, 16, 20];
  const n = 4;
  let T = 111;

  let nodes = [];
  let steps = [];
  let xOffset = 30;

  function buildTree() {
    nodes = [];
    steps = [];
    let currentId = 0;
    let res = 1e9;
    nodes.push({
      id: 0,
      label: "(0,0)",
      depth: 0,
      parent: -1,
      state: "inactive",
      children: [],
    });

    steps.push({
      activate: [0],
      msg: `<span class="info">Khởi tạo: a=[47, 28, 16, 20], T=111, res=∞. Bắt đầu TRY(k=0, A=0, B=0)</span>`,
    });

    function dfs(k, A, B, parentId) {
      if (k === n) {
        res = B - A;
        steps.push({
          success: [parentId],
          msg: `<span class="ok">✅ Đã chia xong n=4 vật. Cập nhật res = B - A = ${B} - ${A} = ${res}</span>`,
        });
        return;
      }

      let c1 = A + a[k] <= Math.floor(T / 2);
      let displayRes = res > 100000 ? "∞" : res;
      let c2_val = res > 100000 ? 1000000 : Math.floor((T + res) / 2);
      let c2 = B + a[k] < c2_val;

      let msg = `<span class="info">TRY(k=${k}, A=${A}, B=${B}): Xét đồ vật a[${k}]=${a[k]}</span><br>`;

      steps.push({
        activate: [parentId],
        msg:
          msg +
          `<span style="font-size:12px;color:#9ca3af">T/2 = ${Math.floor(T / 2)}, (T+res)/2 = ${displayRes === "∞" ? "∞" : Math.floor((T + res) / 2)}</span>`,
      });

      if (c1) {
        currentId++;
        let childId = currentId;
        nodes.push({
          id: childId,
          label: `(${A + a[k]},${B})`,
          depth: k + 1,
          parent: parentId,
          state: "inactive",
          children: [],
        });
        nodes[parentId].children.push(childId);

        steps.push({
          activate: [childId],
          msg: `<span class="info">↳ Người 1: A+a[k] = ${A + a[k]} ≤ ${Math.floor(T / 2)} (T/2) → Chọn cho 1: TRY(${k + 1}, ${A + a[k]}, ${B})</span>`,
        });
        dfs(k + 1, A + a[k], B, childId);
      } else {
        currentId++;
        let childId = currentId;
        nodes.push({
          id: childId,
          label: `(${A + a[k]},${B})`,
          depth: k + 1,
          parent: parentId,
          state: "pruned",
          children: [],
        });
        nodes[parentId].children.push(childId);
        steps.push({
          prune: [childId],
          msg: `<span class="no">✗ Người 1: A+a[k] = ${A + a[k]} > ${Math.floor(T / 2)} (T/2) → CẮT NHÁNH</span>`,
        });
      }

      // Re-evaluate c2 because res might have changed
      let newRes = res > 100000 ? "∞" : res;
      let newC2Val = res > 100000 ? 1000000 : Math.floor((T + res) / 2);
      let c2_now = B + a[k] < newC2Val;

      if (c2_now) {
        currentId++;
        let childId = currentId;
        nodes.push({
          id: childId,
          label: `(${A},${B + a[k]})`,
          depth: k + 1,
          parent: parentId,
          state: "inactive",
          children: [],
        });
        nodes[parentId].children.push(childId);

        steps.push({
          activate: [childId],
          msg: `<span class="info">↳ Người 2: B+a[k] = ${B + a[k]} < ${newRes === "∞" ? "∞" : newC2Val} ((T+res)/2) → Chọn cho 2: TRY(${k + 1}, ${A}, ${B + a[k]})</span>`,
        });
        dfs(k + 1, A, B + a[k], childId);
      } else {
        currentId++;
        let childId = currentId;
        nodes.push({
          id: childId,
          label: `(${A},${B + a[k]})`,
          depth: k + 1,
          parent: parentId,
          state: "pruned",
          children: [],
        });
        nodes[parentId].children.push(childId);
        steps.push({
          prune: [childId],
          msg: `<span class="no">✗ Người 2: B+a[k] = ${B + a[k]} ≥ ${newRes === "∞" ? "∞" : newC2Val} ((T+res)/2) → CẮT NHÁNH</span>`,
        });
      }

      if (k > 0) {
        steps.push({
          msg: `<span class="info">↩ Quay lui về TRY(${k - 1})</span>`,
        });
      }
    }

    dfs(0, 0, 0, 0);

    steps.push({
      msg: `<span class="ok">✅ Thuật toán kết thúc! Chênh lệch nhỏ nhất: ${res}</span>`,
    });

    xOffset = 30;
    function layout(nodeId) {
      let node = nodes[nodeId];
      node.y = node.depth * 55 + 20;
      if (node.children.length === 0) {
        node.x = xOffset;
        xOffset += 45;
      } else {
        let sumX = 0;
        node.children.forEach((childId) => {
          layout(childId);
          sumX += nodes[childId].x;
        });
        node.x = sumX / node.children.length;
      }
    }
    layout(0);
  }

  buildTree();

  let stepIdx = -1;
  let nodeStates = {};

  function reset() {
    nodeStates = {};
    nodes.forEach(
      (n) =>
        (nodeStates[n.id] =
          n.state === "pruned" && stepIdx < 0 ? "inactive" : "inactive"),
    );
  }

  function renderTree() {
    const svg = document.getElementById("div-svg");
    svg.setAttribute("width", Math.max(580, xOffset + 30));
    svg.setAttribute("viewBox", `0 0 ${Math.max(580, xOffset + 30)} 280`);

    const edgesG = document.getElementById("div-edges");
    const nodesG = document.getElementById("div-nodes");
    edgesG.innerHTML = "";
    nodesG.innerHTML = "";

    nodes.forEach((n) => {
      if (n.parent < 0) return;
      const p = nodes[n.parent];
      const ns = nodeStates[n.id];
      const ps = nodeStates[n.parent];
      let cls = "bt-edge";
      if (ns === "success" || ps === "success") cls += " success";
      else if (ns === "pruned") cls += " pruned";
      else if (ns === "active") cls += " active";
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", p.x);
      line.setAttribute("y1", p.y + 16);
      line.setAttribute("x2", n.x);
      line.setAttribute("y2", n.y - 16);
      line.setAttribute("class", cls);
      edgesG.appendChild(line);
    });

    nodes.forEach((n) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "bt-node " + nodeStates[n.id]);
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", n.x);
      circle.setAttribute("cy", n.y);
      circle.setAttribute("r", 17);
      g.appendChild(circle);
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("x", n.x);
      text.setAttribute("y", n.y + 1);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("font-size", "9.5");
      text.textContent = n.label;
      g.appendChild(text);
      nodesG.appendChild(g);
    });
  }

  function applyStep(idx) {
    const s = steps[idx];
    if (s.activate) s.activate.forEach((id) => (nodeStates[id] = "active"));
    if (s.prune) s.prune.forEach((id) => (nodeStates[id] = "pruned"));
    if (s.success) s.success.forEach((id) => (nodeStates[id] = "success"));

    renderTree();

    document.getElementById("div-log").innerHTML =
      (s.msg || "") +
      `<br><span style="color:#64748b">Nút hiển thị: (A, B) — Tổng của người 1 và người 2</span>`;
    document.getElementById("div-step-info").textContent =
      `Bước ${idx + 1}/${steps.length}`;
  }

  function init() {
    buildTree();
    reset();
    stepIdx = -1;
    document.getElementById("div-play").disabled = false;
    document.getElementById("div-next").disabled = true;
    document.getElementById("div-step-info").textContent = "Nhấn Bắt đầu";
    document.getElementById("div-log").innerHTML =
      'Nhấn <strong>Bắt đầu</strong> để xem cây quay lui.<br><span style="color:#fcd34d">a=[47, 28, 16, 20], T=111. Nút hiển thị (A, B).</span>';
    renderTree();
  }

  document.getElementById("div-play").addEventListener("click", function () {
    buildTree();
    stepIdx = 0;
    this.disabled = true;
    document.getElementById("div-next").disabled = false;
    applyStep(stepIdx);
  });
  document.getElementById("div-next").addEventListener("click", function () {
    stepIdx++;
    if (stepIdx >= steps.length) {
      this.disabled = true;
      return;
    }
    applyStep(stepIdx);
    if (stepIdx >= steps.length - 1) this.disabled = true;
  });
  document.getElementById("div-reset").addEventListener("click", init);
  window.addEventListener("load", () => setTimeout(init, 400));
})();

/* ===================== DP: COINS TABLE (2D) ===================== */
(function () {
  const coins = [5, 1, 7, 3],
    m = 18;
  const n = coins.length;
  const INF = 999;
  let C = [],
    steps = [],
    stepIdx = -1;

  function buildSteps() {
    C = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(INF));
    for (let i = 0; i <= n; i++) C[i][0] = 0;

    steps = [];
    steps.push({
      i: -1,
      j: -1,
      msg: '<span class="info">Khởi tạo: C[i][0] = 0 (cột 0), C[0][j] = ∞ (hàng 0)</span>',
      snap: C.map((r) => [...r]),
    });

    for (let i = 1; i <= n; i++) {
      const a_i = coins[i - 1];
      for (let j = 1; j <= m; j++) {
        let prev = C[i - 1][j];
        let take = j >= a_i ? 1 + C[i][j - a_i] : INF;
        let best = Math.min(prev, take);
        C[i][j] = best;

        let msg = "";
        if (a_i > j) {
          msg = `<span class="info">a[${i}]=${a_i} > j=${j} → C[${i}][${j}] = C[${i - 1}][${j}] = ${best === INF ? "∞" : best}</span>`;
        } else {
          msg = `<span class="info">C[${i}][${j}] = min(C[${i - 1}][${j}], 1+C[${i}][${j - a_i}]) = min(${prev === INF ? "∞" : prev}, ${take === INF ? "∞" : take}) = ${best}</span>`;
        }

        steps.push({
          i,
          j,
          a_i,
          prev,
          take,
          msg: msg,
          snap: C.map((r) => [...r]),
        });
      }
    }
    steps.push({
      i: -1,
      j: -1,
      done: true,
      msg: `<span class="ok">✅ Hoàn thành! Số tờ ít nhất để đổi ${m} đồng là ${C[n][m]}</span>`,
      snap: C.map((r) => [...r]),
    });
  }

  function initTable() {
    const tbl = document.getElementById("dpc-table");
    if (!tbl) return;
    let html = "<thead><tr><th>i\\j</th>";
    for (let j = 0; j <= m; j++) html += `<th>${j}</th>`;
    html += "</tr></thead><tbody>";
    for (let i = 0; i <= n; i++) {
      const lbl = i === 0 ? "0" : `${i}(a=${coins[i - 1]})`;
      html += `<tr><td style="color:#4a9eff;font-weight:700;background:#0a0e1a;font-size:11px">${lbl}</td>`;
      for (let j = 0; j <= m; j++) {
        html += `<td id="dpc-2d-${i}-${j}">?</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody>";
    tbl.innerHTML = html;
  }

  function renderStep(idx) {
    const s = steps[idx];
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= m; j++) {
        const cell = document.getElementById(`dpc-2d-${i}-${j}`);
        if (!cell) continue;
        cell.className = "";
        const val = s.snap[i][j];
        cell.textContent = val === INF ? "∞" : val;
        if (val !== INF) cell.classList.add("dp-filled");

        if (i === s.i && j === s.j) cell.classList.add("dp-current");
        else if (i === s.i - 1 && j === s.j) cell.classList.add("dp-source");
        else if (s.i !== -1 && i === s.i && j === s.j - s.a_i)
          cell.classList.add("dp-source");

        if (s.done && i === n && j === m) cell.classList.add("dp-done");
      }
    }
    document.getElementById("dpc-log").innerHTML = s.msg;
    document.getElementById("dpc-step-info").textContent =
      `Bước ${idx + 1}/${steps.length}`;
  }

  function init() {
    buildSteps();
    stepIdx = -1;
    document.getElementById("dpc-play").disabled = false;
    document.getElementById("dpc-next").disabled = true;
    document.getElementById("dpc-step-info").textContent = "Nhấn Bắt đầu";
    document.getElementById("dpc-log").innerHTML =
      "Nhấn <strong>Bắt đầu</strong> để xem bảng ma trận QHĐ được điền từng ô.";
    initTable();
  }

  document.getElementById("dpc-play").addEventListener("click", function () {
    buildSteps();
    stepIdx = 0;
    this.disabled = true;
    document.getElementById("dpc-next").disabled = false;
    renderStep(stepIdx);
  });
  document.getElementById("dpc-next").addEventListener("click", function () {
    stepIdx++;
    if (stepIdx >= steps.length) {
      this.disabled = true;
      return;
    }
    renderStep(stepIdx);
    if (stepIdx >= steps.length - 1) this.disabled = true;
  });
  document.getElementById("dpc-reset").addEventListener("click", init);
  window.addEventListener("load", () => setTimeout(init, 500));
})();

/* ===================== DP: LCS TABLE ===================== */
(function () {
  const X = "ABCB",
    Y = "BDCAB";
  const m = X.length,
    n = Y.length;
  let dp = [],
    steps = [],
    stepIdx = -1;

  function buildDP() {
    dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  }

  function buildSteps() {
    buildDP();
    steps = [];
    steps.push({
      i: -1,
      j: -1,
      msg: '<span class="info">Khởi tạo: dp[0][*] = dp[*][0] = 0</span>',
      snapshot: dp.map((r) => [...r]),
    });
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (X[i - 1] === Y[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
        const match = X[i - 1] === Y[j - 1];
        steps.push({
          i,
          j,
          match,
          msg: match
            ? `<span class="ok">X[${i - 1}]='${X[i - 1]}' == Y[${j - 1}]='${Y[j - 1]}' → dp[${i}][${j}] = dp[${i - 1}][${j - 1}]+1 = ${dp[i][j]}</span>`
            : `<span class="info">X[${i - 1}]='${X[i - 1]}' ≠ Y[${j - 1}]='${Y[j - 1]}' → dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}</span>`,
          snapshot: dp.map((r) => [...r]),
        });
      }
    }
    steps.push({
      i: -1,
      j: -1,
      done: true,
      msg: `<span class="ok">✅ LCS dài ${dp[m][n]} — truy vết ngược để tìm "BCB"</span>`,
      snapshot: dp.map((r) => [...r]),
    });
  }

  function initTable() {
    const tbl = document.getElementById("lcs-table");
    tbl.innerHTML = "";
    // Header row
    let head = "<thead><tr><th></th><th></th>";
    for (let j = 0; j < n; j++) head += `<th>${Y[j]}</th>`;
    head += "</tr></thead>";

    let body = "<tbody>";
    for (let i = 0; i <= m; i++) {
      body += `<tr><td style="color:#4a9eff;font-weight:700;background:#0a0e1a">${i === 0 ? "" : X[i - 1]}</td>`;
      for (let j = 0; j <= n; j++) {
        body += `<td id="lcs-${i}-${j}">?</td>`;
      }
      body += "</tr>";
    }
    body += "</tbody>";
    tbl.innerHTML = head + body;
  }

  function renderStep(idx) {
    const s = steps[idx];
    const snap = s.snapshot;
    for (let i = 0; i <= m; i++) {
      for (let j = 0; j <= n; j++) {
        const cell = document.getElementById(`lcs-${i}-${j}`);
        if (!cell) continue;
        cell.className = "";
        cell.textContent = snap[i][j];
        if (snap[i][j] > 0 || i === 0 || j === 0)
          cell.classList.add("dp-filled");
        if (i === s.i && j === s.j) cell.classList.add("dp-current");
        else if (
          (i === s.i - 1 && j === s.j - 1 && s.match) ||
          (!s.match &&
            ((i === s.i - 1 && j === s.j) || (i === s.i && j === s.j - 1)))
        )
          cell.classList.add("dp-source");
        if (s.done && snap[i][j] > 0) cell.classList.add("dp-done");
      }
    }
    document.getElementById("lcs-log").innerHTML = s.msg;
    document.getElementById("lcs-step-info").textContent =
      `Bước ${idx + 1}/${steps.length}`;
  }

  function init() {
    buildSteps();
    stepIdx = -1;
    document.getElementById("lcs-play").disabled = false;
    document.getElementById("lcs-next").disabled = true;
    document.getElementById("lcs-step-info").textContent = "Nhấn Bắt đầu";
    document.getElementById("lcs-log").innerHTML =
      "Nhấn <strong>Bắt đầu</strong> để xem bảng LCS được điền từng ô.";
    initTable();
    // init all cells to 0
    buildDP();
    for (let i = 0; i <= m; i++)
      for (let j = 0; j <= n; j++) {
        const cell = document.getElementById(`lcs-${i}-${j}`);
        if (cell) {
          cell.textContent = "0";
          cell.className = "dp-filled";
        }
      }
  }

  document.getElementById("lcs-play").addEventListener("click", function () {
    buildSteps();
    stepIdx = 0;
    this.disabled = true;
    document.getElementById("lcs-next").disabled = false;
    renderStep(stepIdx);
  });
  document.getElementById("lcs-next").addEventListener("click", function () {
    stepIdx++;
    if (stepIdx >= steps.length) {
      this.disabled = true;
      return;
    }
    renderStep(stepIdx);
    if (stepIdx >= steps.length - 1) this.disabled = true;
  });
  document.getElementById("lcs-reset").addEventListener("click", init);
  window.addEventListener("load", () => setTimeout(init, 600));
})();

/* ===================== DP: KNAPSACK TABLE ===================== */
(function () {
  const items = [
    { w: 2, v: 3 },
    { w: 3, v: 4 },
    { w: 4, v: 5 },
  ];
  const W = 5,
    n = items.length;
  let dp = [],
    steps = [],
    stepIdx = -1;

  function buildSteps() {
    dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
    steps = [];
    steps.push({
      i: -1,
      j: -1,
      msg: '<span class="info">Khởi tạo: dp[0][*] = 0</span>',
      snap: dp.map((r) => [...r]),
    });
    for (let i = 1; i <= n; i++) {
      const { w, v } = items[i - 1];
      for (let j = 0; j <= W; j++) {
        dp[i][j] = dp[i - 1][j];
        let took = false;
        if (j >= w && dp[i - 1][j - w] + v > dp[i][j]) {
          dp[i][j] = dp[i - 1][j - w] + v;
          took = true;
        }
        steps.push({
          i,
          j,
          took,
          w,
          v,
          msg: took
            ? `<span class="ok">dp[${i}][${j}]: lấy vật ${i} (w=${w},v=${v}) → dp[${i - 1}][${j - w}]+${v} = ${dp[i][j]}</span>`
            : `<span class="info">dp[${i}][${j}]: không lấy vật ${i} → dp[${i - 1}][${j}] = ${dp[i][j]}</span>`,
          snap: dp.map((r) => [...r]),
        });
      }
    }
    steps.push({
      i: -1,
      j: -1,
      done: true,
      msg: `<span class="ok">✅ Giá trị tối đa = dp[${n}][${W}] = ${dp[n][W]}</span>`,
      snap: dp.map((r) => [...r]),
    });
  }

  function initTable() {
    const tbl = document.getElementById("kp-table");
    let html = "<thead><tr><th>i\\j</th>";
    for (let j = 0; j <= W; j++) html += `<th>${j}</th>`;
    html += "</tr></thead><tbody>";
    for (let i = 0; i <= n; i++) {
      const lbl =
        i === 0 ? "0" : `${i}(w=${items[i - 1].w},v=${items[i - 1].v})`;
      html += `<tr><td style="color:#4a9eff;font-weight:700;background:#0a0e1a;font-size:11px">${lbl}</td>`;
      for (let j = 0; j <= W; j++) html += `<td id="kp-${i}-${j}">0</td>`;
      html += "</tr>";
    }
    html += "</tbody>";
    tbl.innerHTML = html;
  }

  function renderStep(idx) {
    const s = steps[idx];
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= W; j++) {
        const cell = document.getElementById(`kp-${i}-${j}`);
        if (!cell) continue;
        cell.className = "";
        cell.textContent = s.snap[i][j];
        if (s.snap[i][j] > 0) cell.classList.add("dp-filled");
        if (i === s.i && j === s.j) cell.classList.add("dp-current");
        else if (
          s.took &&
          ((i === s.i - 1 && j === s.j - s.w) || (i === s.i - 1 && j === s.j))
        )
          cell.classList.add("dp-source");
        if (s.done && s.snap[i][j] > 0) cell.classList.add("dp-done");
      }
    }
    document.getElementById("kp-log").innerHTML = s.msg;
    document.getElementById("kp-step-info").textContent =
      `Bước ${idx + 1}/${steps.length}`;
  }

  function init() {
    buildSteps();
    stepIdx = -1;
    document.getElementById("kp-play").disabled = false;
    document.getElementById("kp-next").disabled = true;
    document.getElementById("kp-step-info").textContent = "Nhấn Bắt đầu";
    document.getElementById("kp-log").innerHTML =
      "Nhấn <strong>Bắt đầu</strong> để xem bảng ba lô được điền từng ô.";
    initTable();
  }

  document.getElementById("kp-play").addEventListener("click", function () {
    buildSteps();
    stepIdx = 0;
    this.disabled = true;
    document.getElementById("kp-next").disabled = false;
    renderStep(stepIdx);
  });
  document.getElementById("kp-next").addEventListener("click", function () {
    stepIdx++;
    if (stepIdx >= steps.length) {
      this.disabled = true;
      return;
    }
    renderStep(stepIdx);
    if (stepIdx >= steps.length - 1) this.disabled = true;
  });
  document.getElementById("kp-reset").addEventListener("click", init);
  window.addEventListener("load", () => setTimeout(init, 700));
})();

/* ===================== BACKTRACKING: COINS TREE ===================== */
(function () {
  const a = [0, 5, 1, 7, 3]; // 1-based indexing for coins
  const n = 4;
  const M = 18;

  let nodes = [];
  let steps = [];
  let xOffset = 30;

  function buildTree() {
    nodes = [];
    steps = [];
    let currentId = 0;
    let res = 1e9;
    nodes.push({
      id: 0,
      label: "(0,0)",
      depth: 0,
      parent: -1,
      state: "inactive",
      children: [],
    });

    steps.push({
      activate: [0],
      msg: `<span class="info">Khởi tạo: M=18, a=[5, 1, 7, 3], res=∞. Gọi TRY(k=1, t=0, T=0)</span>`,
    });

    function dfs(k, t, T, parentId) {
      if (k === n) {
        if ((M - T) % a[n] === 0) {
          let newRes = Math.min(res, t + Math.floor((M - T) / a[n]));
          if (newRes < res) {
            res = newRes;
            steps.push({
              success: [parentId],
              msg: `<span class="ok">✅ Đích! k=4 (Mệnh giá 1). Dùng thêm ${(M - T) / a[n]} tờ. Kỉ lục mới: res = ${res}</span>`,
            });
          } else {
            steps.push({
              activate: [parentId],
              msg: `<span class="info">k=4 (Mệnh giá 1). Dùng thêm ${(M - T) / a[n]} tờ nhưng không tốt hơn kỉ lục ${res}</span>`,
            });
          }
        }
        return;
      }

      let displayRes = res > 100000 ? "∞" : res;
      let c_res = res > 100000 ? 1000000 : res;

      let msg = `<span class="info">TRY(k=${k}, t=${t}, T=${T}): Xét mệnh giá ${a[k]}</span><br>`;
      steps.push({
        activate: [parentId],
        msg:
          msg +
          `<span style="font-size:12px;color:#9ca3af">Kỉ lục res = ${displayRes}</span>`,
      });

      for (let z = 0; z + t < c_res && T + z * a[k] <= M; z++) {
        currentId++;
        let childId = currentId;
        nodes.push({
          id: childId,
          label: `(${t + z},${T + z * a[k]})`,
          depth: k,
          parent: parentId,
          state: "inactive",
          children: [],
        });
        nodes[parentId].children.push(childId);

        steps.push({
          activate: [childId],
          msg: `<span class="info">↳ Dùng ${z} tờ mệnh giá ${a[k]}: TRY(${k + 1}, ${t + z}, ${T + z * a[k]})</span>`,
        });
        dfs(k + 1, t + z, T + z * a[k], childId);

        c_res = res > 100000 ? 1000000 : res;
      }

      let z_stop = -1;
      for (let z = 0; ; z++) {
        if (!(z + t < c_res && T + z * a[k] <= M)) {
          z_stop = z;
          break;
        }
      }

      if (z_stop >= 0) {
        currentId++;
        let childId = currentId;
        let cause =
          z_stop + t >= c_res
            ? `z+t = ${z_stop + t} ≥ res (${c_res})`
            : `T+z*a[k] = ${T + z_stop * a[k]} > M (18)`;
        nodes.push({
          id: childId,
          label: `(${t + z_stop}, ...)`,
          depth: k,
          parent: parentId,
          state: "pruned",
          children: [],
        });
        nodes[parentId].children.push(childId);
        steps.push({
          prune: [childId],
          msg: `<span class="no">✗ Dừng thử z=${z_stop} tờ mệnh giá ${a[k]} vì ${cause} → CẮT NHÁNH</span>`,
        });
      }

      if (k > 1) {
        steps.push({
          msg: `<span class="info">↩ Quay lui về TRY(${k - 1})</span>`,
        });
      }
    }

    dfs(1, 0, 0, 0);

    steps.push({
      msg: `<span class="ok">✅ Thuật toán kết thúc! Số tờ ít nhất: ${res}</span>`,
    });

    xOffset = 30;
    function layout(nodeId) {
      let node = nodes[nodeId];
      node.y = node.depth * 65 + 20;
      if (node.children.length === 0) {
        node.x = xOffset;
        xOffset += 45;
      } else {
        let sumX = 0;
        node.children.forEach((childId) => {
          layout(childId);
          sumX += nodes[childId].x;
        });
        node.x = sumX / node.children.length;
      }
    }
    layout(0);
  }

  buildTree();

  let stepIdx = -1;
  let nodeStates = {};

  function reset() {
    nodeStates = {};
    nodes.forEach(
      (n) =>
        (nodeStates[n.id] =
          n.state === "pruned" && stepIdx < 0 ? "inactive" : "inactive"),
    );
  }

  function renderTree() {
    const svg = document.getElementById("btc-svg");
    if (!svg) return;
    svg.setAttribute("width", Math.max(580, xOffset + 30));
    svg.setAttribute("viewBox", `0 0 ${Math.max(580, xOffset + 30)} 280`);

    const edgesG = document.getElementById("btc-edges");
    const nodesG = document.getElementById("btc-nodes");
    edgesG.innerHTML = "";
    nodesG.innerHTML = "";

    nodes.forEach((n) => {
      if (n.parent < 0) return;
      const p = nodes[n.parent];
      const ns = nodeStates[n.id];
      const ps = nodeStates[n.parent];
      let cls = "bt-edge";
      if (ns === "success" || ps === "success") cls += " success";
      else if (ns === "pruned") cls += " pruned";
      else if (ns === "active") cls += " active";
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", p.x);
      line.setAttribute("y1", p.y + 16);
      line.setAttribute("x2", n.x);
      line.setAttribute("y2", n.y - 16);
      line.setAttribute("class", cls);
      edgesG.appendChild(line);
    });

    nodes.forEach((n) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "bt-node " + nodeStates[n.id]);
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", n.x);
      circle.setAttribute("cy", n.y);
      circle.setAttribute("r", 17);
      g.appendChild(circle);
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("x", n.x);
      text.setAttribute("y", n.y + 1);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("font-size", "9.5");
      text.textContent = n.label;
      g.appendChild(text);
      nodesG.appendChild(g);
    });
  }

  function applyStep(idx) {
    const s = steps[idx];
    if (s.activate) s.activate.forEach((id) => (nodeStates[id] = "active"));
    if (s.prune) s.prune.forEach((id) => (nodeStates[id] = "pruned"));
    if (s.success) s.success.forEach((id) => (nodeStates[id] = "success"));

    renderTree();

    document.getElementById("btc-log").innerHTML =
      (s.msg || "") +
      `<br><span style="color:#64748b">Nút hiển thị: (t, T) — t: số tờ, T: tổng tiền</span>`;
    document.getElementById("btc-step-info").textContent =
      `Bước ${idx + 1}/${steps.length}`;
  }

  function init() {
    const svg = document.getElementById("btc-svg");
    if (!svg) return;
    buildTree();
    reset();
    stepIdx = -1;
    document.getElementById("btc-play").disabled = false;
    document.getElementById("btc-next").disabled = true;
    document.getElementById("btc-step-info").textContent = "Nhấn Bắt đầu";
    document.getElementById("btc-log").innerHTML =
      'Nhấn <strong>Bắt đầu</strong> để xem cây quay lui.<br><span style="color:#fcd34d">M=18, a=[5, 1, 7, 3]. Nút hiển thị (t, T).</span>';
    renderTree();
  }

  let playBtn = document.getElementById("btc-play");
  if (playBtn) {
    playBtn.addEventListener("click", function () {
      buildTree();
      stepIdx = 0;
      this.disabled = true;
      document.getElementById("btc-next").disabled = false;
      applyStep(stepIdx);
    });
    document.getElementById("btc-next").addEventListener("click", function () {
      stepIdx++;
      if (stepIdx >= steps.length) {
        this.disabled = true;
        return;
      }
      applyStep(stepIdx);
      if (stepIdx >= steps.length - 1) this.disabled = true;
    });
    document.getElementById("btc-reset").addEventListener("click", init);
  }
  window.addEventListener("load", () => setTimeout(init, 500));
})();

/* ===================== GREEDY: SCHEDULING ===================== */
(function () {
  const jobs = [
    { a: 3, b: 5, id: 4 },
    { a: 4, b: 7, id: 1 },
    { a: 2, b: 8, id: 2 },
    { a: 4, b: 8, id: 3 },
    { a: 13, b: 15, id: 6 },
    { a: 10, b: 17, id: 7 },
    { a: 16, b: 22, id: 5 },
  ]; // Already sorted by b

  let steps = [];

  function buildSteps() {
    steps = [];
    steps.push({
      idx: -1,
      msg: `<span class="info">Khởi tạo: Sắp xếp các việc theo thời điểm kết thúc (b) tăng dần. res = 0, t = -∞.</span>`,
    });

    let t = -1; // -∞ conceptually
    let res = 0;

    for (let i = 0; i < jobs.length; i++) {
      let job = jobs[i];
      if (job.a > t) {
        res++;
        let oldT = t;
        t = job.b;
        steps.push({
          idx: i,
          status: "selected",
          msg: `<span class="ok">✅ Xét việc ${job.id} (${job.a}, ${job.b}): a=${job.a} > t=${oldT === -1 ? "-∞" : oldT}. <b>Chọn!</b> Cập nhật res=${res}, t=${t}.</span>`,
        });
      } else {
        steps.push({
          idx: i,
          status: "rejected",
          msg: `<span class="no">✗ Xét việc ${job.id} (${job.a}, ${job.b}): a=${job.a} ≤ t=${t === -1 ? "-∞" : t}. <b>Bỏ qua!</b> (bị chồng chéo).</span>`,
        });
      }
    }
    steps.push({
      idx: jobs.length,
      msg: `<span class="ok">✅ Hoàn thành! Chọn được tối đa ${res} việc.</span>`,
    });
  }

  buildSteps();

  let stepIdx = -1;

  function renderStep(idx) {
    const arena = document.getElementById("sch-arena");
    if (!arena) return;

    arena.innerHTML =
      '<div class="sched-axis"></div><div class="sched-ticks" id="sch-ticks"></div>';

    const ticks = document.getElementById("sch-ticks");
    for (let i = 0; i <= 24; i += 2) {
      let tick = document.createElement("div");
      tick.className = "sched-tick";
      tick.style.left = (i * 100) / 24 + "%";
      tick.textContent = i;
      ticks.appendChild(tick);
    }

    let s = steps[idx];
    let currentI = s.idx;

    for (let i = 0; i < jobs.length; i++) {
      let job = jobs[i];
      let jobDiv = document.createElement("div");
      jobDiv.className = "sched-job";
      jobDiv.style.left = (job.a * 100) / 24 + "%";
      jobDiv.style.width = ((job.b - job.a) * 100) / 24 + "%";
      jobDiv.style.top = i * 30 + 10 + "px";
      jobDiv.textContent = `V${job.id} (${job.a},${job.b})`;

      if (currentI === -1) {
        jobDiv.classList.add("inactive");
      } else if (i > currentI && currentI !== jobs.length) {
        jobDiv.classList.add("inactive");
      } else if (i === currentI) {
        if (s.status === "selected") jobDiv.classList.add("active", "success");
        else jobDiv.classList.add("active", "rejected");
      } else {
        let t_past = -1;
        let selected = false;
        for (let k = 0; k <= i; k++) {
          if (jobs[k].a > t_past) {
            if (k === i) selected = true;
            t_past = jobs[k].b;
          }
        }
        if (selected) jobDiv.classList.add("success");
        else jobDiv.classList.add("rejected");
      }

      arena.appendChild(jobDiv);
    }

    arena.style.height = jobs.length * 30 + 40 + "px";

    if (currentI >= 0 && currentI < jobs.length) {
      let t_val = -1;
      for (let k = 0; k <= currentI; k++) {
        if (k === currentI && s.status === "rejected") continue;
        if (jobs[k].a > t_val) {
          t_val = jobs[k].b;
        }
      }
      if (t_val !== -1) {
        let tLine = document.createElement("div");
        tLine.style.position = "absolute";
        tLine.style.left = (t_val * 100) / 24 + "%";
        tLine.style.top = "0";
        tLine.style.bottom = "0";
        tLine.style.width = "2px";
        tLine.style.backgroundColor = "#22c55e";
        tLine.style.zIndex = "10";

        let tLabel = document.createElement("div");
        tLabel.textContent = "t=" + t_val;
        tLabel.style.position = "absolute";
        tLabel.style.left = "4px";
        tLabel.style.top = "2px";
        tLabel.style.color = "#22c55e";
        tLabel.style.fontSize = "12px";
        tLabel.style.fontWeight = "bold";

        tLine.appendChild(tLabel);
        arena.appendChild(tLine);
      }
    } else if (currentI === jobs.length) {
      let t_val = -1;
      for (let k = 0; k < jobs.length; k++) {
        if (jobs[k].a > t_val) t_val = jobs[k].b;
      }
      if (t_val !== -1) {
        let tLine = document.createElement("div");
        tLine.style.position = "absolute";
        tLine.style.left = (t_val * 100) / 24 + "%";
        tLine.style.top = "0";
        tLine.style.bottom = "0";
        tLine.style.width = "2px";
        tLine.style.backgroundColor = "#22c55e";
        tLine.style.zIndex = "10";

        let tLabel = document.createElement("div");
        tLabel.textContent = "t=" + t_val;
        tLabel.style.position = "absolute";
        tLabel.style.left = "4px";
        tLabel.style.top = "2px";
        tLabel.style.color = "#22c55e";
        tLabel.style.fontSize = "12px";
        tLabel.style.fontWeight = "bold";

        tLine.appendChild(tLabel);
        arena.appendChild(tLine);
      }
    }

    document.getElementById("sch-log").innerHTML = s.msg;
    document.getElementById("sch-step-info").textContent =
      `Bước ${idx + 1}/${steps.length}`;
  }

  function init() {
    const arena = document.getElementById("sch-arena");
    if (!arena) return;
    buildSteps();
    stepIdx = -1;
    document.getElementById("sch-play").disabled = false;
    document.getElementById("sch-next").disabled = true;
    document.getElementById("sch-step-info").textContent = "Nhấn Bắt đầu";
    document.getElementById("sch-log").innerHTML =
      "Nhấn <strong>Bắt đầu</strong> để xem thuật toán tham lam từng bước.";
    renderStep(0);
  }

  let playBtn = document.getElementById("sch-play");
  if (playBtn) {
    playBtn.addEventListener("click", function () {
      stepIdx = 0;
      this.disabled = true;
      document.getElementById("sch-next").disabled = false;
      renderStep(stepIdx);
    });
    document.getElementById("sch-next").addEventListener("click", function () {
      stepIdx++;
      if (stepIdx >= steps.length) {
        this.disabled = true;
        return;
      }
      renderStep(stepIdx);
      if (stepIdx >= steps.length - 1) this.disabled = true;
    });
    document.getElementById("sch-reset").addEventListener("click", init);
  }
  window.addEventListener("load", () => setTimeout(init, 600));
})();

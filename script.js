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
        section
          .querySelectorAll(".tab")
          .forEach((t) => t.classList.remove("active"));
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

        document
          .getElementById("sch-play")
          .addEventListener("click", function () {
            if (!started) {
              started = true;
              buildSteps();
            }
            stepIdx = 0;
            this.disabled = true;
            document.getElementById("sch-next").disabled = false;
            applyStep(stepIdx);
          });
        document
          .getElementById("sch-next")
          .addEventListener("click", function () {
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
        const M_RAW = [170, 165, 180];
        const F_RAW = [160, 175, 162];
        const M = [...M_RAW].sort((a, b) => a - b);
        const F = [...F_RAW].sort((a, b) => a - b);

        let steps = [],
          stepIdx = -1,
          started = false;

        function buildSteps() {
          steps = [];
          steps.push({
            type: "init",
            msg: `<span class="info">Sắp xếp: Nam=[${M.join(",")}], Nữ=[${F.join(",")}]</span>`,
            paired: [],
          });
          for (let i = 0; i < M.length; i++) {
            steps.push({
              type: "pair",
              i,
              msg: `<span class="ok">Ghép cặp ${i + 1}: Nam ${M[i]} ↔ Nữ ${F[i]}, chênh lệch = ${Math.abs(M[i] - F[i])}</span>`,
              paired: M.slice(0, i + 1).map((_, k) => k),
            });
          }
          const total = M.reduce((s, x, i) => s + Math.abs(x - F[i]), 0);
          steps.push({
            type: "done",
            msg: `<span class="ok">✅ Tổng chênh lệch = ${total}</span>`,
            paired: M.map((_, i) => i),
          });
        }

        function renderDance(paired, currentI) {
          const arena = document.getElementById("dance-arena");
          let html =
            '<div style="display:flex;gap:24px;align-items:flex-end;flex-wrap:wrap">';

          for (let i = 0; i < M.length; i++) {
            const active = i === currentI;
            const done = paired.includes(i);
            const color = done ? "#22c55e" : active ? "#4a9eff" : "#2d3748";
            const textColor = done ? "#86efac" : active ? "#93c5fd" : "#64748b";

            html += `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;transition:all 0.3s">
        <div style="display:flex;gap:8px;align-items:flex-end">
          <div style="background:${color};border-radius:6px;width:40px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px;height:${(M[i] - 140) * 1.5}px;transition:all 0.4s;border:1px solid ${done ? "#22c55e" : active ? "#4a9eff" : "#374151"}">
            <span style="font-size:11px;font-weight:700;color:${textColor}">${M[i]}</span>
          </div>
          ${done ? `<div style="font-size:16px;color:#22c55e;font-weight:700;align-self:center">↔</div>` : `<div style="font-size:16px;color:#374151;font-weight:700;align-self:center">↔</div>`}
          <div style="background:${done ? "#14532d" : active ? "#1e3a5f" : "#1a1f2e"};border-radius:6px;width:40px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px;height:${(F[i] - 140) * 1.5}px;transition:all 0.4s;border:1px solid ${done ? "#16a34a" : active ? "#3b82f6" : "#374151"}">
            <span style="font-size:11px;font-weight:700;color:${done ? "#4ade80" : active ? "#60a5fa" : "#64748b"}">${F[i]}</span>
          </div>
        </div>
        ${done ? `<span style="font-size:10px;color:#22c55e;font-weight:600">|${M[i] - F[i]}|=${Math.abs(M[i] - F[i])}</span>` : `<span style="font-size:10px;color:#374151">—</span>`}
        <span style="font-size:10px;color:#64748b">Cặp ${i + 1}</span>
      </div>`;
          }
          html += "</div>";
          arena.innerHTML = html;
        }

        function applyStep(idx) {
          const s = steps[idx];
          renderDance(s.paired, s.type === "pair" ? s.i : -1);
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
          document.getElementById("dance-step-info").textContent =
            "Nhấn Bắt đầu";
          document.getElementById("dance-log").innerHTML =
            "Nhấn <strong>Bắt đầu</strong> để xem ghép cặp từng bước.";
          renderDance([], -1);
        }

        document
          .getElementById("dance-play")
          .addEventListener("click", function () {
            buildSteps();
            started = true;
            stepIdx = 0;
            this.disabled = true;
            document.getElementById("dance-next").disabled = false;
            applyStep(stepIdx);
          });
        document
          .getElementById("dance-next")
          .addEventListener("click", function () {
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
        // Layout: root at top, row 0 tries col 0,1,2,3
        const nodes = [
          {
            id: 0,
            label: "start",
            x: 320,
            y: 30,
            parent: -1,
            state: "inactive",
          },
          // row 0 children (try col 0,1,2,3)
          {
            id: 1,
            label: "r0,c0",
            x: 100,
            y: 100,
            parent: 0,
            state: "inactive",
          },
          {
            id: 2,
            label: "r0,c1",
            x: 230,
            y: 100,
            parent: 0,
            state: "inactive",
          },
          {
            id: 3,
            label: "r0,c2",
            x: 390,
            y: 100,
            parent: 0,
            state: "inactive",
          },
          {
            id: 4,
            label: "r0,c3",
            x: 540,
            y: 100,
            parent: 0,
            state: "inactive",
          },
          // row 1 from c0: only c2 safe
          {
            id: 5,
            label: "r1,c1",
            x: 60,
            y: 185,
            parent: 1,
            state: "inactive",
          },
          {
            id: 6,
            label: "r1,c2",
            x: 105,
            y: 185,
            parent: 1,
            state: "inactive",
          },
          {
            id: 7,
            label: "r1,c3",
            x: 150,
            y: 185,
            parent: 1,
            state: "inactive",
          },
          // row 1 from c1: c3 safe
          {
            id: 8,
            label: "r1,c0",
            x: 195,
            y: 185,
            parent: 2,
            state: "inactive",
          },
          {
            id: 9,
            label: "r1,c2",
            x: 235,
            y: 185,
            parent: 2,
            state: "inactive",
          },
          {
            id: 10,
            label: "r1,c3",
            x: 275,
            y: 185,
            parent: 2,
            state: "inactive",
          },
          // row 1 from c2: c0 safe
          {
            id: 11,
            label: "r1,c0",
            x: 335,
            y: 185,
            parent: 3,
            state: "inactive",
          },
          {
            id: 12,
            label: "r1,c1",
            x: 380,
            y: 185,
            parent: 3,
            state: "inactive",
          },
          {
            id: 13,
            label: "r1,c3",
            x: 440,
            y: 185,
            parent: 3,
            state: "inactive",
          },
          // row 1 from c3
          {
            id: 14,
            label: "r1,c0",
            x: 490,
            y: 185,
            parent: 4,
            state: "inactive",
          },
          {
            id: 15,
            label: "r1,c1",
            x: 540,
            y: 185,
            parent: 4,
            state: "inactive",
          },
          {
            id: 16,
            label: "r1,c2",
            x: 590,
            y: 185,
            parent: 4,
            state: "inactive",
          },
          // row 2 from (c1→c3): success node
          {
            id: 17,
            label: "r2,c0",
            x: 258,
            y: 265,
            parent: 10,
            state: "inactive",
          },
          {
            id: 18,
            label: "✓解",
            x: 300,
            y: 265,
            parent: 10,
            state: "inactive",
          },
          // row 2 from (c2→c0): success
          {
            id: 19,
            label: "r2,c2",
            x: 358,
            y: 265,
            parent: 11,
            state: "inactive",
          },
          {
            id: 20,
            label: "✓解",
            x: 415,
            y: 265,
            parent: 13,
            state: "inactive",
          },
        ];

        const steps = [
          {
            activate: [0],
            msg: '<span class="info">Bắt đầu: đặt hậu vào hàng 0</span>',
          },
          {
            activate: [1],
            msg: '<span class="info">Thử col=0 (hàng 0)</span>',
          },
          {
            activate: [5],
            prune: [5],
            msg: '<span class="no">✗ Thử col=1 (hàng 1) — xung đột đường chéo, cắt nhánh</span>',
          },
          {
            activate: [6],
            prune: [6],
            msg: '<span class="no">✗ Thử col=2 (hàng 1) — xung đột cột, cắt nhánh</span>',
          },
          {
            activate: [7],
            prune: [7],
            msg: '<span class="no">✗ Thử col=3 (hàng 1) — xung đột đường chéo, cắt nhánh</span>',
          },
          {
            prune: [1],
            msg: '<span class="no">↩ Quay lui từ col=0 (hàng 0) — không có lời giải</span>',
          },
          {
            activate: [2],
            msg: '<span class="info">Thử col=1 (hàng 0)</span>',
          },
          {
            activate: [8],
            prune: [8],
            msg: '<span class="no">✗ Thử col=0 (hàng 1) — xung đột đường chéo</span>',
          },
          {
            activate: [9],
            prune: [9],
            msg: '<span class="no">✗ Thử col=2 (hàng 1) — xung đột đường chéo</span>',
          },
          {
            activate: [10],
            msg: '<span class="info">Thử col=3 (hàng 1) — OK, tiếp tục hàng 2</span>',
          },
          {
            activate: [17],
            prune: [17],
            msg: '<span class="no">✗ Thử col=0 (hàng 2) — xung đột, cắt nhánh</span>',
          },
          {
            activate: [18],
            success: [18],
            msg: '<span class="ok">✅ col=2 (hàng 2) → lời giải! [1,3,0,2]</span>',
          },
          {
            activate: [3],
            msg: '<span class="info">Tiếp tục quay lui... thử col=2 (hàng 0)</span>',
          },
          {
            activate: [11],
            msg: '<span class="info">col=0 (hàng 1) OK</span>',
          },
          {
            activate: [19],
            prune: [19],
            msg: '<span class="no">✗ Thử col=2 (hàng 2) — xung đột</span>',
          },
          {
            activate: [12],
            prune: [12],
            msg: '<span class="no">✗ col=1 (hàng 1) xung đột</span>',
          },
          {
            activate: [13],
            msg: '<span class="info">col=3 (hàng 1) OK</span>',
          },
          {
            activate: [20],
            success: [20],
            msg: '<span class="ok">✅ Lời giải 2: [2,0,3,1]</span>',
          },
          {
            activate: [4],
            activate2: [14, 15, 16],
            msg: '<span class="info">col=3 (hàng 0) → tiếp tục nhưng không có thêm lời giải mới...</span>',
          },
          {
            msg: '<span class="ok">✅ Hoàn thành! N=4 có 2 lời giải: [1,3,0,2] và [2,0,3,1]</span>',
          },
        ];

        let stepIdx = -1;
        let nodeStates = {};
        let started = false;

        function resetStates() {
          nodeStates = {};
          nodes.forEach((n) => (nodeStates[n.id] = "inactive"));
        }

        function renderTree() {
          const svg = document.getElementById("bt-svg");
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
            line.setAttribute("y1", p.y + 14);
            line.setAttribute("x2", n.x);
            line.setAttribute("y2", n.y - 14);
            line.setAttribute("class", cls);
            edgesG.appendChild(line);
          });

          // Draw nodes
          nodes.forEach((n) => {
            const g = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "g",
            );
            g.setAttribute("class", "bt-node " + nodeStates[n.id]);

            const circle = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle",
            );
            circle.setAttribute("cx", n.x);
            circle.setAttribute("cy", n.y);
            circle.setAttribute("r", 18);
            g.appendChild(circle);

            const text = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "text",
            );
            text.setAttribute("x", n.x);
            text.setAttribute("y", n.y + 1);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("font-size", "9");
            text.textContent =
              n.label === "start"
                ? "root"
                : n.label.replace("r", "").replace(",", "|");
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

        document
          .getElementById("bt-play")
          .addEventListener("click", function () {
            started = true;
            stepIdx = 0;
            this.disabled = true;
            document.getElementById("bt-next").disabled = false;
            applyStep(stepIdx);
          });
        document
          .getElementById("bt-next")
          .addEventListener("click", function () {
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
        // v=[3,1,4], target=4
        // Nodes: (item_idx, sum) in nhóm 1
        // Layout
        const nodes = [
          { id: 0, label: "(0,0)", x: 290, y: 30, parent: -1 },
          { id: 1, label: "(1,3)", x: 145, y: 105, parent: 0 }, // v[0]=3 → nhóm 1
          { id: 2, label: "(1,0)", x: 435, y: 105, parent: 0 }, // v[0]=3 → nhóm 2
          { id: 3, label: "(2,4)", x: 75, y: 180, parent: 1 }, // v[1]=1 → nhóm 1
          { id: 4, label: "(2,3)", x: 220, y: 180, parent: 1 }, // v[1]=1 → nhóm 2
          { id: 5, label: "(2,1)", x: 360, y: 180, parent: 2 }, // v[1]=1 → nhóm 1
          { id: 6, label: "(2,0)", x: 500, y: 180, parent: 2 }, // v[1]=1 → nhóm 2
          // from (2,4): v[2]=4: sum+4=8>4 prune; sum stay=4=target ✓
          { id: 7, label: "(3,8)", x: 40, y: 255, parent: 3 }, // prune
          { id: 8, label: "(3,4)", x: 110, y: 255, parent: 3 }, // ✓
          // from (2,3): v[2]=4: 3+4=7>4 prune; stay=3≠4
          { id: 9, label: "(3,7)", x: 180, y: 255, parent: 4 }, // prune
          { id: 10, label: "(3,3)", x: 260, y: 255, parent: 4 }, // fail
        ];

        const steps = [
          {
            act: [0],
            msg: '<span class="info">Bắt đầu: solve(0, 0) — xét vật v[0]=3, target=4</span>',
          },
          {
            act: [1],
            msg: '<span class="info">Nhóm 1 ← v[0]=3: solve(1, 3)</span>',
          },
          {
            act: [3],
            msg: '<span class="info">Nhóm 1 ← v[1]=1: solve(2, 4) — sum=4 = target, tiếp tục xét v[2]</span>',
          },
          {
            act: [7],
            prune: [7],
            msg: '<span class="no">✗ Nhóm 1 ← v[2]=4: sum=8 > 4, CẮT NHÁNH</span>',
          },
          {
            act: [8],
            success: [8],
            msg: '<span class="ok">✅ Nhóm 2 ← v[2]=4: i=3, sum=4 = target! Tìm được cách chia: Nhóm1={3,1}, Nhóm2={4}</span>',
          },
          {
            act: [4],
            msg: '<span class="info">Quay lui... Nhóm 2 ← v[1]=1: solve(2, 3)</span>',
          },
          {
            act: [9],
            prune: [9],
            msg: '<span class="no">✗ Nhóm 1 ← v[2]=4: sum=7 > 4, CẮT NHÁNH</span>',
          },
          {
            act: [10],
            prune: [10],
            msg: '<span class="no">✗ Nhóm 2 ← v[2]=4: i=3, sum=3 ≠ 4, thất bại</span>',
          },
          {
            act: [2],
            msg: '<span class="info">Quay lui về gốc... Nhóm 2 ← v[0]=3: solve(1, 0)</span>',
          },
          {
            act: [5],
            msg: '<span class="info">Nhóm 1 ← v[1]=1: solve(2, 1)</span>',
          },
          {
            act: [6],
            msg: '<span class="info">Nhóm 2 ← v[1]=1: solve(2, 0)</span>',
          },
          {
            msg: '<span class="ok">✅ Đã tìm được lời giải: Nhóm1={3,1}, Nhóm2={4}</span>',
          },
        ];

        let stepIdx = -1;
        let nodeStates = {};

        function reset() {
          nodeStates = {};
          nodes.forEach((n) => (nodeStates[n.id] = "inactive"));
        }

        function renderTree() {
          const svg = document.getElementById("div-svg");
          const edgesG = document.getElementById("div-edges");
          const nodesG = document.getElementById("div-nodes");
          edgesG.innerHTML = "";
          nodesG.innerHTML = "";

          nodes.forEach((n) => {
            if (n.parent < 0) return;
            const p = nodes[n.parent];
            const ns = nodeStates[n.id];
            let cls = "bt-edge";
            if (ns === "success") cls += " success";
            else if (ns === "pruned") cls += " pruned";
            else if (ns === "active") cls += " active";
            const line = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "line",
            );
            line.setAttribute("x1", p.x);
            line.setAttribute("y1", p.y + 14);
            line.setAttribute("x2", n.x);
            line.setAttribute("y2", n.y - 14);
            line.setAttribute("class", cls);
            edgesG.appendChild(line);
          });

          nodes.forEach((n) => {
            const g = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "g",
            );
            g.setAttribute("class", "bt-node " + nodeStates[n.id]);
            const circle = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle",
            );
            circle.setAttribute("cx", n.x);
            circle.setAttribute("cy", n.y);
            circle.setAttribute("r", 20);
            g.appendChild(circle);
            const text = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "text",
            );
            text.setAttribute("x", n.x);
            text.setAttribute("y", n.y + 1);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("font-size", "9");
            text.textContent = n.label;
            g.appendChild(text);
            nodesG.appendChild(g);
          });
        }

        function applyStep(idx) {
          const s = steps[idx];
          if (s.act) s.act.forEach((id) => (nodeStates[id] = "active"));
          if (s.prune) s.prune.forEach((id) => (nodeStates[id] = "pruned"));
          if (s.success)
            s.success.forEach((id) => (nodeStates[id] = "success"));
          renderTree();
          document.getElementById("div-log").innerHTML =
            s.msg +
            `<br><span style="color:#64748b">Nút hiển thị (i, sum) — i=chỉ số vật đang xét, sum=tổng nhóm 1</span>`;
          document.getElementById("div-step-info").textContent =
            `Bước ${idx + 1}/${steps.length}`;
        }

        function init() {
          reset();
          stepIdx = -1;
          document.getElementById("div-play").disabled = false;
          document.getElementById("div-next").disabled = true;
          document.getElementById("div-step-info").textContent = "Nhấn Bắt đầu";
          document.getElementById("div-log").innerHTML =
            'Nhấn <strong>Bắt đầu</strong> để xem cây quay lui.<br><span style="color:#fcd34d">v=[3,1,4], S=8, target=4. Mỗi nút hiện thị (i, sum).</span>';
          renderTree();
        }

        document
          .getElementById("div-play")
          .addEventListener("click", function () {
            stepIdx = 0;
            this.disabled = true;
            document.getElementById("div-next").disabled = false;
            applyStep(stepIdx);
          });
        document
          .getElementById("div-next")
          .addEventListener("click", function () {
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

      /* ===================== DP: COINS TABLE ===================== */
      (function () {
        const coins = [1, 3, 4],
          n = 6;
        const INF = 999;
        let dp = [],
          steps = [],
          started = false,
          stepIdx = -1;

        function buildSteps() {
          dp = new Array(n + 1).fill(INF);
          dp[0] = 0;
          steps = [];
          steps.push({
            dp: [...dp],
            cur: 0,
            sources: [],
            msg: `<span class="info">Khởi tạo: dp[0]=0, dp[1..${n}]=∞</span>`,
          });
          for (let i = 1; i <= n; i++) {
            let bestSrc = [];
            for (let c of coins) {
              if (i >= c && dp[i - c] !== INF) {
                if (dp[i - c] + 1 < dp[i]) {
                  dp[i] = dp[i - c] + 1;
                  bestSrc = [i - c];
                }
              }
            }
            const dpCopy = [...dp];
            const usedCoin = coins.find(
              (c) => i >= c && dp[i - c] !== INF && dp[i - c] + 1 === dp[i],
            );
            const displayVal = dp[i] === INF ? "∞" : dp[i];
            steps.push({
              dp: dpCopy,
              cur: i,
              sources: bestSrc,
              msg: `<span class="info">dp[${i}] = ${displayVal === "∞" ? "∞ (không đổi được)" : `min từ dp[${i - usedCoin}]+1 = ${displayVal} (dùng xu ${usedCoin})`}</span>`,
            });
          }
          steps.push({
            dp: [...dp],
            cur: -1,
            sources: [],
            msg: `<span class="ok">✅ Hoàn thành! dp[${n}] = ${dp[n]} — cần ${dp[n]} xu để đổi ${n} đồng (vd: 3+3)</span>`,
          });
        }

        function initTable() {
          const head = document.getElementById("dpc-head");
          const body = document.getElementById("dpc-body");
          head.innerHTML = "<th>i →</th>";
          body.innerHTML =
            '<td style="color:#4a9eff;font-weight:700;background:#0a0e1a">dp[i]</td>';
          for (let i = 0; i <= n; i++) {
            const th = document.createElement("th");
            th.textContent = i;
            head.appendChild(th);
            const td = document.createElement("td");
            td.id = `dpc-cell-${i}`;
            td.textContent = "?";
            body.appendChild(td);
          }
        }

        function renderStep(idx) {
          const s = steps[idx];
          for (let i = 0; i <= n; i++) {
            const cell = document.getElementById(`dpc-cell-${i}`);
            if (!cell) continue;
            cell.className = "";
            const val = s.dp[i];
            if (val === INF) {
              cell.textContent = "∞";
              cell.style.color = "#374151";
            } else {
              cell.textContent = val;
              cell.classList.add("dp-filled");
            }
            if (i === s.cur) cell.classList.add("dp-current");
            if (s.sources.includes(i)) cell.classList.add("dp-source");
            if (s.cur === -1 && val !== INF) cell.classList.add("dp-done");
          }
          document.getElementById("dpc-log").innerHTML = s.msg;
          document.getElementById("dpc-step-info").textContent =
            `Bước ${idx + 1}/${steps.length}`;
        }

        function init() {
          buildSteps();
          stepIdx = -1;
          started = false;
          document.getElementById("dpc-play").disabled = false;
          document.getElementById("dpc-next").disabled = true;
          document.getElementById("dpc-step-info").textContent = "Nhấn Bắt đầu";
          document.getElementById("dpc-log").innerHTML =
            "Nhấn <strong>Bắt đầu</strong> để xem bảng QHĐ được điền từng ô.";
          initTable();
          // Show initial empty table
          for (let i = 0; i <= n; i++) {
            const cell = document.getElementById(`dpc-cell-${i}`);
            if (cell) {
              cell.textContent = "?";
              cell.className = "";
              cell.style.color = "#374151";
            }
          }
        }

        document
          .getElementById("dpc-play")
          .addEventListener("click", function () {
            buildSteps();
            started = true;
            stepIdx = 0;
            this.disabled = true;
            document.getElementById("dpc-next").disabled = false;
            renderStep(stepIdx);
          });
        document
          .getElementById("dpc-next")
          .addEventListener("click", function () {
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
                  ((i === s.i - 1 && j === s.j) ||
                    (i === s.i && j === s.j - 1)))
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

        document
          .getElementById("lcs-play")
          .addEventListener("click", function () {
            buildSteps();
            stepIdx = 0;
            this.disabled = true;
            document.getElementById("lcs-next").disabled = false;
            renderStep(stepIdx);
          });
        document
          .getElementById("lcs-next")
          .addEventListener("click", function () {
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
                ((i === s.i - 1 && j === s.j - s.w) ||
                  (i === s.i - 1 && j === s.j))
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

        document
          .getElementById("kp-play")
          .addEventListener("click", function () {
            buildSteps();
            stepIdx = 0;
            this.disabled = true;
            document.getElementById("kp-next").disabled = false;
            renderStep(stepIdx);
          });
        document
          .getElementById("kp-next")
          .addEventListener("click", function () {
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

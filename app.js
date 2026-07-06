const COLORS = {
  turn_left:  { line: "#185FA5", band: "rgba(24,95,165,0.15)" },
  turn_right: { line: "#D85A30", band: "rgba(216,90,48,0.15)" },
  go_straight:{ line: "#1D9E75", band: "rgba(29,158,117,0.15)" },
};
const INTERP = {
  turn_left:  "「左に回れ」の合図の後、約 1.5〜2 秒の“反応の遅れ”を経て、頭が左（＋）へ 平均 <b>+33°</b> 回頭します。帯が広い＝<b>個人差が大きく</b>、確率（分布）で扱う必要があることを示します。",
  turn_right: "「右に回れ」の合図の後、約 1.5〜2 秒の潜時を経て、頭が右（−）へ 平均 <b>−33°</b> 回頭します。左右で対称な反応が学習可能な“現象”として現れています。",
  go_straight:"「まっすぐ進め」でも 約 2〜3 秒遅れて前進が立ち上がり、6 秒で中央値 <b>約 0.7 m</b> 進みます。＝ 指示は効くが <b>動き出しは遅く・ゆっくり</b>。",
};
const LAYOUT_BASE = {
  margin: { l: 60, r: 16, t: 40, b: 48 },
  paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)",
  font: { size: 13, family: "Hiragino Sans, sans-serif" },
  showlegend: false,
};

let DATA = null;

function plotReaction(id) {
  const c = DATA.reactions[id], col = COLORS[id];
  const lag = c.lag, xrev = lag.concat(lag.slice().reverse());
  const band = { x: xrev, y: c.p75.concat(c.p25.slice().reverse()),
    fill: "toself", fillcolor: col.band, line: { width: 0 }, hoverinfo: "skip", type: "scatter" };
  const mean = { x: lag, y: c.mean, mode: "lines", line: { color: col.line, width: 3 },
    name: "平均", hovertemplate: "%{x:.1f}s: %{y:.1f}<extra></extra>" };
  const shapes = [{ type: "line", x0: 0, x1: 0, y0: 0, y1: 1, yref: "paper",
    line: { color: "#bbb", dash: "dash", width: 1 } }];
  if (c.kind === "yaw") shapes.push({ type: "line", x0: lag[0], x1: lag[lag.length-1],
    y0: 0, y1: 0, line: { color: "#ddd", width: 1 } });
  const layout = Object.assign({}, LAYOUT_BASE, {
    title: { text: `${c.label} への反応（実データ・${c.n} 事象）`, font: { size: 16 } },
    xaxis: { title: "コマンドからの経過（秒）　0＝合図の瞬間", zeroline: false },
    yaxis: { title: c.ylabel, zeroline: false },
    shapes,
  });
  Plotly.newPlot("reaction-plot", [band, mean], layout, { responsive: true, displayModeBar: false });
  document.getElementById("interpretation").innerHTML = "💡 " + INTERP[id];
  document.querySelectorAll("#cmd-buttons button").forEach(b =>
    b.classList.toggle("active", b.dataset.id === id));
}

function plotMetrics() {
  const n = DATA.metrics.nll;
  const bar = { x: ["ガウス(基線)", "等速度(基線)", "MDN", "Flow"],
    y: [n.gaussian, n.constvel, n.mdn, n.flow], type: "bar",
    marker: { color: ["#888780", "#888780", "#D85A30", "#185FA5"] },
    text: [n.gaussian, n.constvel, n.mdn, n.flow].map(v => v.toFixed(2)),
    textposition: "outside", hoverinfo: "skip" };
  const layout = Object.assign({}, LAYOUT_BASE, {
    title: { text: "予測の当てはまり NLL（低いほど良い）", font: { size: 16 } },
    yaxis: { title: "NLL" },
  });
  Plotly.newPlot("metrics-plot", [bar], layout, { responsive: true, displayModeBar: false });
  const a = DATA.metrics.ade;
  document.getElementById("ade-note").innerHTML =
    `軌跡の誤差（ADE, m・低いほど良い）でも、Flow <b>${a.flow}</b> が 等速度 ${a.constvel} を上回ります。`;
}

fetch("data.json").then(r => r.json()).then(d => {
  DATA = d;
  const box = document.getElementById("cmd-buttons");
  for (const id of Object.keys(d.reactions)) {
    const b = document.createElement("button");
    b.textContent = d.reactions[id].label;
    b.dataset.id = id;
    b.onclick = () => plotReaction(id);
    box.appendChild(b);
  }
  plotReaction("turn_left");
  plotMetrics();
}).catch(e => {
  document.getElementById("reaction-plot").innerHTML =
    "<p style='color:#a33'>データの読み込みに失敗しました（" + e + "）</p>";
});

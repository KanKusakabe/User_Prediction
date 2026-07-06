// 3D+height replay gallery: poster grid, click-to-play with audio, one at a time.
let ITEMS = [], fUser = "all", fObject = "all", activeMedia = null;

const uniq = a => [...new Set(a)].sort((x, y) =>
  typeof x === "number" ? x - y : String(x).localeCompare(y));

fetch("videos.json").then(r => r.json()).then(items => {
  ITEMS = items;
  buildFilter("user-filter", ["all", ...uniq(items.map(i => i.user))],
    v => v === "all" ? "全" : "U" + v, v => { fUser = v; render(); });
  buildFilter("object-filter", ["all", ...uniq(items.map(i => i.object))],
    v => v === "all" ? "全" : v, v => { fObject = v; render(); });
  render();
});

function buildFilter(id, values, label, onPick) {
  const box = document.getElementById(id);
  values.forEach(v => {
    const b = document.createElement("button");
    b.className = "chip" + (v === "all" ? " on" : "");
    b.textContent = label(v);
    b.onclick = () => {
      [...box.children].forEach(c => c.classList.remove("on"));
      b.classList.add("on");
      onPick(v);
    };
    box.appendChild(b);
  });
}

function render() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  activeMedia = null;
  const shown = ITEMS.filter(i =>
    (fUser === "all" || i.user === fUser) &&
    (fObject === "all" || i.object === fObject));
  document.getElementById("count").textContent = `${shown.length} 本`;
  shown.forEach(item => grid.appendChild(tile(item)));
}

function posterHTML(item) {
  return `<span class="badge">U${item.user}</span>` +
    `<img class="poster" loading="lazy" src="${item.thumb}" alt="${item.object}">` +
    `<button class="play" aria-label="再生">▶</button>`;
}

function tile(item) {
  const fig = document.createElement("figure");
  fig.className = "tile";
  const media = document.createElement("div");
  media.className = "media";
  media.innerHTML = posterHTML(item);
  media.onclick = () => { if (!media.querySelector("video")) play(media, item); };
  const cap = document.createElement("figcaption");
  cap.innerHTML = `<span class="cap-obj">${item.object}</span>` +
    `<span class="cap-meta">user ${item.user} · trial ${item.trial} · ${item.dur}s</span>`;
  fig.append(media, cap);
  return fig;
}

function play(media, item) {
  if (activeMedia && activeMedia !== media) revert(activeMedia);
  const v = document.createElement("video");
  Object.assign(v, { src: item.file, controls: true, autoplay: true,
    playsInline: true, muted: false });
  media.innerHTML = "";
  media.appendChild(v);
  activeMedia = media;
  media._item = item;
  v.play().catch(() => {});
}

function revert(media) {
  media.innerHTML = posterHTML(media._item);
  media.onclick = () => { if (!media.querySelector("video")) play(media, media._item); };
}

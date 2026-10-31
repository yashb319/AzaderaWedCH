const entrance = document.getElementById("entrance");
const config = window.WEDDING_CONFIG;
const ui = document.getElementById("fort-ui");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const byId = id => document.getElementById(id);
const events = config?.events || [];
let selected = null;
let memory = null;
let memoryPage = 0;
let engine;
let initializing = false;
let unavailable = false;
let experienceVersion = 0;
let effectsEnabled = config?.experience?.effects !== false && !reducedMotion.matches;
byId("fort-effects").checked = effectsEnabled;
byId("fort-effects").disabled = reducedMotion.matches;
byId("fort-effects").addEventListener("change", event => {
  effectsEnabled = event.target.checked;
  engine?.effects(effectsEnabled);
});
reducedMotion.addEventListener("change", () => {
  byId("fort-effects").disabled = reducedMotion.matches;
  effectsEnabled = !reducedMotion.matches && byId("fort-effects").checked;
  engine?.effects(effectsEnabled);
});
const supportedThemes = ["roka", "kerala-marriage", "rituals", "reception", "sagai", "haldi", "sangeet", "hapur-marriage"];
function themeFor(event) {
  if (supportedThemes.includes(event.theme)) return event.theme;
  const name = event.name.toLowerCase();
  if (name.includes("roka")) return "roka";
  if (name.includes("ritual")) return "rituals";
  if (name.includes("reception")) return "reception";
  if (name.includes("sagai") || name.includes("bharai")) return "sagai";
  if (name.includes("haldi") || name.includes("mehendi") || name.includes("mahendi")) return "haldi";
  if (name.includes("sangeet")) return "sangeet";
  if (name.includes("kerala") || name.includes("kerela")) return "kerala-marriage";
  return "hapur-marriage";
}
const setStatus = text => {
  byId("fort-feedback").textContent = text;
  byId("fort-feedback").classList.toggle("is-warning", /paused|unavailable|Illustrated mode/i.test(text));
};
const dateLabel = date => new Intl.DateTimeFormat(config.locale, {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
}).format(new Date(`${date}T12:00:00Z`));

// Event information remains available independently of WebGL or camera animation.
events.forEach((event, index) => {
  const button = document.createElement("button");
  button.className = "fort-event";
  const number = document.createElement("span");
  number.textContent = String(index + 1).padStart(2, "0");
  const name = document.createElement("span");
  name.textContent = event.name;
  button.append(number, name);
  button.addEventListener("click", () => selectEvent(index));
  byId("fort-events").append(button);
});
function updateNavigation() {
  Array.from(byId("fort-events").children).forEach((button, index) => {
    button.setAttribute("aria-pressed", String(selected === index));
  });
}
function showDetails(index) {
  const event = events[index];
  entrance.dataset.theme = themeFor(event);
  const venue = config.venues.find(item => item.id === event.venueId);
  const values = {
    "fort-detail-number": `Celebration ${String(index + 1).padStart(2, "0")} of ${events.length}`,
    "fort-detail-title": event.name,
    "fort-detail-date": dateLabel(event.date),
    "fort-detail-time": `${event.time} · ${config.wedding.eventFootnote}`,
    "fort-detail-venue": venue.name,
    "fort-detail-address": venue.address,
    "fort-detail-directions": event.directions || venue.directions || "Directions not yet provided. Open the venue in Maps to plan your journey; please confirm the exact venue location before travelling.",
    "fort-detail-dress": event.dressCode || "Dress code not yet provided.",
    "fort-detail-description": event.details || event.description || ""
  };
  Object.entries(values).forEach(([id, text]) => { byId(id).textContent = text; });
  byId("fort-detail-description").hidden = !values["fort-detail-description"];
  byId("fort-detail-map").href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapQuery || venue.address)}`;
  byId("fort-detail").hidden = false;
  entrance.classList.add("is-in-event");
  byId("fort-title").textContent = "Step inside the celebration";
  byId("fort-intro").hidden = true;
  updateNavigation();
  byId("fort-detail-title").focus({ preventScroll: true });
}
function selectEvent(index) {
  if (!Number.isInteger(index) || index < 0 || index >= events.length) return;
  selected = index;
  memory = null;
  byId("fort-memory").hidden = true;
  showDetails(index);
  engine?.visit(index);
}
function back() {
  const previous = selected;
  selected = null;
  memory = null;
  byId("fort-memory").hidden = true;
  byId("fort-detail").hidden = true;
  entrance.classList.remove("is-in-event");
  delete entrance.dataset.theme;
  byId("fort-title").textContent = "The celebration courtyard";
  byId("fort-intro").hidden = false;
  updateNavigation();
  engine?.courtyard();
  (byId("fort-events").children[previous] || byId("fort-title")).focus({ preventScroll: true });
}
function reset() {
  experienceVersion++;
  selected = null;
  memory = null;
  byId("fort-memory").hidden = true;
  ui.hidden = true;
  byId("fort-detail").hidden = true;
  entrance.classList.remove("is-exploring", "is-in-event");
  delete entrance.dataset.theme;
  byId("fort-intro").hidden = false;
  byId("fort-title").textContent = "The celebration courtyard";
  entrance.setAttribute("aria-labelledby", "entrance-title");
  updateNavigation();
  engine?.reset();
}
async function enter(index) {
  const version = ++experienceVersion;
  ui.hidden = false;
  entrance.classList.add("is-exploring");
  entrance.setAttribute("aria-labelledby", "fort-title");
  byId("fort-title").focus({ preventScroll: true });
  if (index !== undefined) selectEvent(index);
  if (!engine && !unavailable) await initialize();
  if (version !== experienceVersion || entrance.hidden) return;
  if (engine) {
    if (memory !== null) engine.memory(memory);
    else if (selected !== null) engine.visit(selected);
    else engine.enter();
  } else {
    setStatus("Illustrated mode. Choose any celebration below to read its details.");
  }
}
byId("leave-fort").addEventListener("click", () => byId("skip-entrance").click());
byId("fort-back").addEventListener("click", back);
byId("fort-previous").addEventListener("click", () => selectEvent((selected - 1 + events.length) % events.length));
byId("fort-next").addEventListener("click", () => selectEvent((selected + 1) % events.length));
byId("fort-tour").addEventListener("click", () => selectEvent(0));
function discover(section) {
  memory = section;
  memoryPage = 0;
  selected = null;
  updateNavigation();
  byId("fort-detail").hidden = true;
  entrance.classList.add("is-in-event");
  byId("fort-intro").hidden = true;
  byId("fort-memory").hidden = false;
  byId("fort-memory-title").textContent = section === "story" ? "The garden of our story" : section === "people" ? `Meet ${config.couple.bride.firstName} & ${config.couple.groom.firstName}` : "The family haveli";
  const source = document.querySelector(section === "story" ? "#story-timeline" : section === "people" ? "#couple-grid" : "#family-groups");
  const clone = source.cloneNode(true);
  clone.removeAttribute("id");
  clone.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
  byId("fort-memory-content").replaceChildren(clone);
  byId("fort-memory-title").focus({ preventScroll: true });
  engine?.memory(section);
}
byId("fort-story").addEventListener("click", () => discover("story"));
byId("fort-family").addEventListener("click", () => discover("family"));
byId("memory-back").addEventListener("click", back);
byId("memory-next").addEventListener("click", () => engine?.page(1));
byId("memory-previous").addEventListener("click", () => engine?.page(-1));
byId("doli-recover").addEventListener("click", () => { back(); engine?.recover(); });
byId("doli-interact").addEventListener("click", () => engine?.interact());
byId("fort-look-left").addEventListener("click", () => engine?.orbit(-0.15));
byId("fort-look-right").addEventListener("click", () => engine?.orbit(0.15));
byId("fort-recenter").addEventListener("click", () => engine?.courtyard());
window.WEDDING_EXPERIENCE = {
  enter, reset, back,
  isInsideEvent: () => selected !== null || memory !== null,
  getState: () => ({ selected, memory, eventCount: events.length, effectsEnabled, ready: entrance.classList.contains("three-ready"), audio: { paused: audio.paused, time: audio.currentTime, volume: audio.volume, error: audio.error?.code || null }, ...engine?.stats() })
};
window.dispatchEvent(new Event("wedding:experience-ready"));

const audio = new Audio();
audio.preload = "none";
audio.loop = true;
let musicAllowed = config?.music?.enabled !== false;
let audioValid = false;
const playbackError = message => {
  byId("music-status").textContent = message;
  byId("music-status").hidden = false;
  byId("music-toggle").textContent = "Retry wedding music";
};
try {
  if (config?.music?.src) {
    const url = new URL(config.music.src, document.baseURI);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Music must be a local path or HTTPS URL.");
    audio.src = url.href;
    audio.volume = Number.isFinite(config.music.volume) ? Math.min(1, Math.max(0, config.music.volume)) : 0.35;
    audioValid = true;
  }
} catch (error) {
  console.error("Wedding music configuration:", error);
  playbackError(error.message);
}
byId("music-toggle").disabled = !audioValid;
audio.addEventListener("error", () => {
  console.warn("Wedding music asset failed:", audio.error?.code);
  playbackError("Music could not load. Check the audio path in wedding.config.js, or retry.");
});
audio.addEventListener("playing", () => {
  byId("music-status").hidden = true;
  byId("music-toggle").textContent = "Sound off";
  byId("music-toggle").setAttribute("aria-pressed", "true");
});
audio.addEventListener("pause", () => { byId("music-toggle").textContent = "Sound on"; byId("music-toggle").setAttribute("aria-pressed", "false"); });
function playMusic() {
  if (!audioValid || !musicAllowed || audio.volume === 0) return;
  if (audio.error) audio.load();
  // Invoke play synchronously in the visitor's gesture; scene loading never gates playback.
  const pending = audio.play();
  pending.catch(error => {
    if (error.name === "AbortError") return; // A visitor pause/mute can cancel an in-flight play.
    console.warn("Wedding music playback:", error);
    playbackError("Music could not start. Tap Retry wedding music to try again.");
  });
}
byId("open-gates").addEventListener("click", playMusic);
byId("explore-fort").addEventListener("click", playMusic);
window.addEventListener("wedding:explore", playMusic);
byId("music-toggle").addEventListener("click", () => {
  if (!audio.paused && !audio.error) { musicAllowed = false; audio.pause(); }
  else { musicAllowed = true; if (audio.volume === 0) audio.volume = 0.35; playMusic(); }
});
document.addEventListener("visibilitychange", () => { if (document.hidden) audio.pause(); });

async function initialize() {
  if (initializing || unavailable || engine || !events.length) return;
  initializing = true;
  const loading = byId("three-status");
  loading.hidden = false;
  loading.textContent = "Preparing your royal welcome…";
  setStatus("Lighting the lamps and opening the courtyard…");
  let renderer;
  try {
    const THREE = await import("./assets/vendor/three.module.min.js");
    const canvas = document.createElement("canvas");
    canvas.className = "three-canvas";
    canvas.setAttribute("aria-hidden", "true");
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: !mobile, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1 : 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    entrance.prepend(canvas);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1c253a);
    scene.fog = new THREE.FogExp2(0x30374c, 0.008);
    const camera = new THREE.PerspectiveCamera(49, 1, 0.1, 180);
    const look = new THREE.Vector3(0, 4, 18);
    const exterior = new THREE.Vector3(0, 6, 47);
    camera.position.copy(exterior);
    camera.lookAt(look);
    scene.add(new THREE.HemisphereLight(0xbfd5ff, 0x9b5736, 2.2));
    const moonlight = new THREE.DirectionalLight(0xd6dcff, 2.6);
    moonlight.position.set(-18, 30, 14);
    scene.add(moonlight);
    const warm = new THREE.DirectionalLight(0xffc67e, 3);
    warm.position.set(14, 13, 20);
    scene.add(warm);
    const ambientGlow = new THREE.PointLight(0xffbb68, 65, 32, 2);
    ambientGlow.position.set(0, 5, -4);
    scene.add(ambientGlow);
    const materials = {};
    const material = (name, color, options = {}) => {
      materials[name] = new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...options });
      return materials[name];
    };
    material("stone", 0xd9a77d);
    material("trim", 0xf1d2a0);
    material("rose", 0xa85859);
    material("wood", 0x492f32);
    material("gold", 0xd7ac58, { metalness: 0.7, roughness: 0.3 });
    material("ivory", 0xffefd0);
    material("sage", 0x798b62);
    material("leaf", 0x425f46);
    material("coral", 0xb75341);
    material("yellow", 0xefb940);
    material("lavender", 0x9274a6);
    material("skin", 0xb77e58);
    material("hair", 0x292b27);
    material("water", 0x497e83, { metalness: 0.45, roughness: 0.18 });
    material("fire", 0xffd281, { emissive: 0xffaa3a, emissiveIntensity: 2.4 });
    material("floor", 0x947d70);
    material("rug", 0x7e3340);
    const geometries = new Map();
    const geometry = (key, create) => {
      if (!geometries.has(key)) geometries.set(key, create());
      return geometries.get(key);
    };
    const cube = geometry("cube", () => new THREE.BoxGeometry(1, 1, 1));
    const ball = geometry("sphere", () => new THREE.SphereGeometry(1, 8, 6));
    const dome = geometry("dome", () => new THREE.SphereGeometry(1, 24, 12));
    const cylinder = geometry("cylinder", () => new THREE.CylinderGeometry(1, 1, 1, 16));
    const cone = geometry("cone", () => new THREE.ConeGeometry(1, 1, 20));
    const groups = new Map();
    // Repeated architecture and flowers share instanced draw calls, including on phones.
    function shape(parent, geo, mat, position, scale = [1, 1, 1], rotation = [0, 0, 0], live = false) {
      const object = live ? new THREE.Mesh(geo, mat) : new THREE.Object3D();
      object.position.set(...position);
      object.scale.set(...scale);
      object.rotation.set(...rotation);
      parent.add(object);
      if (!live) {
        const key = `${geo.uuid}:${mat.uuid}`;
        if (!groups.has(key)) groups.set(key, { geo, mat, objects: [] });
        groups.get(key).objects.push(object);
      }
      return object;
    }
    const box = (p, x, y, z, w, h, d, mat = materials.stone, live = false) => shape(p, cube, mat, [x, y, z], [w, h, d], [0, 0, 0], live);
    const sphere = (p, x, y, z, r, mat, live = false) => shape(p, ball, mat, [x, y, z], [r, r, r], [0, 0, 0], live);
    const column = (p, x, y, z, r, h, mat = materials.trim, live = false) => shape(p, cylinder, mat, [x, y, z], [r, h, r], [0, 0, 0], live);
    const ringGeometry = geometry("ring", () => new THREE.TorusGeometry(1, 0.035, 5, 20));
    const ring = (p, x, y, z, r, mat, rotation = [Math.PI / 2, 0, 0], live = false) => shape(p, ringGeometry, mat, [x, y, z], [r, r, r], rotation, live);
    const group = (x = 0, y = 0, z = 0, rotation = 0) => {
      const node = new THREE.Group();
      node.position.set(x, y, z);
      node.rotation.y = rotation;
      scene.add(node);
      return node;
    };
    const flower = (p, x, y, z, mat = materials.yellow, size = 0.12) => {
      sphere(p, x, y, z, size, mat);
      sphere(p, x, y, z + size * 0.65, size * 0.45, materials.gold);
    };
    function garland(p, width, y, z, mat = materials.yellow) {
      for (let i = 0; i <= 24; i++) {
        const x = -width / 2 + width * i / 24;
        flower(p, x, y - Math.sin(i / 24 * Math.PI) * 0.65, z, i % 3 ? mat : materials.ivory);
      }
    }
    function lamp(p, x, z, scale = 1) {
      column(p, x, 0.1 * scale, z, 0.35 * scale, 0.15 * scale, materials.gold);
      column(p, x, 0.7 * scale, z, 0.06 * scale, 1.2 * scale, materials.gold);
      column(p, x, 1.25 * scale, z, 0.3 * scale, 0.08 * scale, materials.gold);
      shape(p, ball, materials.fire, [x, 1.45 * scale, z], [0.065 * scale, 0.17 * scale, 0.065 * scale]);
    }
    function arch(p, x, z, width, height, mat = materials.trim, live = false) {
      const key = `arch:${width}:${height}`;
      const geo = geometry(key, () => {
        const outline = new THREE.Shape();
        const half = width / 2;
        const spring = height - half;
        outline.moveTo(-half - 0.25, 0);
        outline.lineTo(-half - 0.25, spring);
        outline.absarc(0, spring, half + 0.25, Math.PI, 0, true);
        outline.lineTo(half + 0.25, 0);
        outline.lineTo(half, 0);
        outline.lineTo(half, spring);
        outline.absarc(0, spring, half, 0, Math.PI, false);
        outline.lineTo(-half, 0);
        outline.closePath();
        return new THREE.ExtrudeGeometry(outline, { depth: 0.2, bevelEnabled: false, curveSegments: 16 });
      });
      shape(p, geo, mat, [x, 0, z], [1, 1, 1], [0, 0, 0], live);
    }
    function palm(x, z, scale = 1) {
      const p = group(x, 0, z);
      column(p, 0, 2.6 * scale, 0, 0.14 * scale, 5.2 * scale, materials.wood);
      for (let i = 0; i < 7; i++) {
        const angle = i * Math.PI * 2 / 7;
        shape(p, ball, materials.leaf,
          [Math.cos(angle) * 0.85 * scale, 5.2 * scale, Math.sin(angle) * 0.85 * scale],
          [1.5 * scale, 0.08 * scale, 0.34 * scale], [0, -angle, -0.15]);
      }
    }
    const world = group();
    box(world, 0, -0.3, 8, 65, 0.5, 110, materials.leaf);
    box(world, 0, -0.04, -3, 34, 0.25, 53, materials.floor);
    // Geometric courtyard paving and a carpet continuing through the royal gateway.
    for (let x = -14; x <= 14; x += 2) {
      for (let z = -24; z <= 21; z += 2) {
        box(world, x, 0.1, z, 1.92, 0.04, 1.92, (x + z) % 4 === 0 ? materials.trim : materials.stone);
      }
    }
    box(world, 0, 0.16, 27, 4.8, 0.025, 56, materials.rug);
    for (const x of [-2.2, 2.2]) box(world, x, 0.19, 27, 0.045, 0.02, 56, materials.gold);
    for (let z = 1; z < 54; z += 2) ring(world, 0, 0.19, z, 0.3, materials.gold);
    // The fort walls are pierced by a monumental layered gate and flanked by chhatris.
    box(world, -11, 4.3, 20, 12, 8.6, 1.5);
    box(world, 11, 4.3, 20, 12, 8.6, 1.5);
    box(world, 0, 9.4, 20, 10, 3.4, 1.5);
    arch(world, 0, 19.1, 8, 8.4, materials.trim);
    arch(world, 0, 18.8, 8.7, 8.9, materials.gold);
    arch(world, 0, 18.4, 9.2, 9.3, materials.rose);
    for (const x of [-8, 8]) {
      column(world, x, 5.4, 20, 2, 10.8, materials.stone);
      column(world, x, 10.6, 20, 2.25, 0.3, materials.trim);
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        column(world, x + Math.cos(a) * 1.5, 11.6, 20 + Math.sin(a) * 1.5, 0.1, 2);
      }
      shape(world, dome, materials.rose, [x, 12.6, 20], [2.4, 1.1, 2.4]);
      shape(world, cone, materials.gold, [x, 13.9, 20], [0.25, 0.9, 0.25]);
      ring(world, x, 3.5, 20, 2.03, materials.gold);
      ring(world, x, 7, 20, 2.03, materials.gold);
    }
    for (let x = -16; x <= 16; x += 1) {
      if (Math.abs(x) < 5) continue;
      box(world, x, 8.9, 20, 0.55, 0.8, 1.6, materials.trim);
      if (Math.abs(x) > 10) {
        arch(world, x, 20.85, 0.55, 1.8, materials.gold);
      }
    }
    const gateHinges = [];
    for (const side of [-1, 1]) {
      const hinge = group(side * 3.9, 0, 19.6);
      gateHinges.push(hinge);
      const panel = new THREE.Group();
      panel.position.x = -side * 1.95;
      hinge.add(panel);
      box(panel, 0, 3.5, 0, 3.9, 7, 0.35, materials.wood, true);
      for (const x of [-1.85, 1.85]) box(panel, x, 3.5, 0.21, 0.08, 6.85, 0.08, materials.gold, true);
      for (const y of [0.2, 1.1, 5.8, 6.8]) box(panel, 0, y, 0.21, 3.75, 0.08, 0.08, materials.gold, true);
      for (let x = -1.5; x <= 1.5; x += 0.5) {
        box(panel, x, 3.5, 0.2, 0.035, 6.8, 0.07, materials.gold, true);
      }
      arch(panel, 0, 0.25, 2.8, 5.9, materials.gold, true);
      ring(panel, -side * 1.4, 3, 0.34, 0.2, materials.gold, [0, 0, 0], true);
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        sphere(panel, Math.cos(a) * 0.55, 3.2 + Math.sin(a) * 0.55, 0.28, 0.09, materials.gold, true);
      }
    }
    garland(world, 9.8, 9.5, 18.2);
    for (const x of [-4.7, 4.7]) {
      for (let y = 0.5; y < 9; y += 0.28) flower(world, x, y, 18.2, y % 1 > 0.5 ? materials.ivory : materials.yellow, 0.15);
      lamp(world, x * 1.4, 23, 1.6);
      box(world, x * 1.6, 1.2, 22.7, 0.12, 2.4, 0.12, materials.gold);
      shape(world, cube, materials.coral, [x * 1.6, 2.7, 22.7], [0.12, 1.2, 1.5], [0, 0, -0.25]);
    }
    for (const side of [-1, 1]) {
      box(world, side * 17, 2.5, -3, 0.8, 5, 46);
      for (let z = -24; z < 18; z += 1.4) box(world, side * 17, 5.3, z, 1, 0.7, 0.7, materials.trim);
      for (let z = -22; z < 16; z += 8) palm(side * 20, z, 1.1);
    }
    // Palace backdrop, moon, and festoon lights establish a coherent evening setting.
    box(world, 0, 4.5, -26, 34, 9, 2);
    for (let x = -14; x <= 14; x += 4) {
      arch(world, x, -24.8, 2.5, 6.7);
      box(world, x, 3, -24.9, 2.4, 6, 0.1, materials.wood);
      garland(group(x, 0, -24.6), 2.6, 6.2, 0);
    }
    for (const x of [-13, 0, 13]) {
      column(world, x, 9.1, -26, 2.7, 0.3, materials.trim);
      shape(world, dome, materials.rose, [x, 10.1, -26], [3, 1.8, 2.5]);
      column(world, x, 12, -26, 0.07, 1.4, materials.gold);
    }
    sphere(world, -24, 31, -60, 3.3, materials.ivory);
    const stars = [];
    for (let i = 0; i < 90; i++) {
      const a = i * 2.39996;
      stars.push(Math.cos(a) * (30 + i % 30), 17 + i % 24, -30 - Math.sin(a) * 40);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(stars, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffefd1, size: 0.12, sizeAttenuation: true });
    scene.add(new THREE.Points(starGeo, starMat));
    for (const z of [-17, -7, 3, 12]) {
      for (let i = 0; i < 25; i++) {
        const x = -17 + i * 34 / 24;
        const y = 8 - Math.sin(i / 24 * Math.PI) * 1.7;
        sphere(world, x, y, z, 0.075, materials.fire);
        if (i < 24) {
          const x2 = -17 + (i + 1) * 34 / 24;
          const y2 = 8 - Math.sin((i + 1) / 24 * Math.PI) * 1.7;
          const line = new THREE.Object3D();
          const mid = new THREE.Vector3((x + x2) / 2, (y + y2) / 2, z);
          line.position.copy(mid);
          line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x2 - x, y2 - y, 0).normalize());
          shape(world, cylinder, materials.wood, mid.toArray(), [0.012, Math.hypot(x2 - x, y2 - y), 0.012], new THREE.Euler().setFromQuaternion(line.quaternion).toArray().slice(0, 3));
        }
      }
    }
    // Central lotus pool and ceremonial couple are visible through the gateway.
    column(world, 0, 0.3, -4, 3.5, 0.45, materials.trim);
    column(world, 0, 0.55, -4, 3.2, 0.05, materials.water);
    ring(world, 0, 0.6, -4, 2.7, materials.gold);
    column(world, 0, 0.75, -4, 1.4, 0.4, materials.sage);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      flower(world, Math.cos(a) * 3.3, 0.6, -4 + Math.sin(a) * 3.3, materials.coral, 0.16);
    }
    const ceremony = group(0, 0.9, -4);
    const couple = new THREE.Group();
    ceremony.add(couple);
    for (const bride of [true, false]) {
      const p = new THREE.Group();
      p.position.x = bride ? -0.24 : 0.24;
      couple.add(p);
      shape(p, bride ? cone : cylinder, bride ? materials.ivory : materials.coral, [0, 0.5, 0], [0.22, 0.9, 0.22], [0, 0, 0], true);
      sphere(p, 0, 1.12, 0, 0.18, materials.skin, true);
      shape(p, ball, bride ? materials.hair : materials.coral, [0, 1.2, -0.04], [0.19, 0.13, 0.18], [0, 0, 0], true);
      box(p, 0.03, 0.5, 0.2, 0.045, 0.7, 0.03, materials.gold, true).rotation.z = 0.3;
      for (let i = 0; i < 5; i++) sphere(p, -0.12 + i * 0.06, 0.91 - Math.sin(i / 4 * Math.PI) * 0.12, 0.18, 0.025, bride ? materials.coral : materials.ivory, true);
      if (bride) for (let i = 0; i < 5; i++) sphere(p, -0.17, 1.04 + i * 0.03, -0.06, 0.025, materials.ivory, true);
      else ring(p, 0, 1.22, -0.04, 0.19, materials.gold, [Math.PI / 2, 0, 0], true);
    }
    shape(ceremony, ball, materials.fire, [0, 0.15, 0], [0.12, 0.3, 0.12]);
    column(ceremony, 0, 0, 0, 0.25, 0.1, materials.gold);
    // Each configured event has its own decorated pavilion, colour, and thematic centrepiece.
    const locations = [];
    const hitTargets = [];
    const tones = { rose: materials.rose, peach: materials.coral, sand: materials.gold, sage: materials.sage, yellow: materials.yellow, lavender: materials.lavender };
    const labelNodes = [];
    events.forEach((event, index) => {
      const side = index % 2 ? 1 : -1;
      const row = Math.floor(index / 2);
      const z = 10 - row * 8;
      const rotation = -side * Math.PI / 2;
      const p = group(side * 12, 0.2, z, rotation);
      const accent = tones[event.tone] || materials.rose;
      const theme = themeFor(event);
      const target = new THREE.Vector3(side * 12, 1.9, z);
      const position = new THREE.Vector3(side * 5.7, 3.8, z + 1.3);
      locations.push({ target, position, label: new THREE.Vector3(side * 12, 6.4, z) });
      box(p, 0, 0.1, 0, 5.8, 0.3, 5.4, materials.trim);
      box(p, 0, 0.32, 0, 5.2, 0.16, 4.8, accent);
      for (const x of [-2.3, 2.3]) for (const depth of [-1.9, 1.9]) {
        column(p, x, 2.2, depth, 0.12, 4);
        column(p, x, 0.6, depth, 0.26, 0.3, materials.gold);
        column(p, x, 4.1, depth, 0.23, 0.25, materials.gold);
      }
      box(p, 0, 4.3, 0, 5.9, 0.25, 5.4, accent);
      if (theme === "kerala-marriage" || theme === "rituals") {
        shape(p, cone, materials.wood, [0, 5, 0], [3.9, 1.5, 3.5], [0, Math.PI / 4, 0]);
        box(p, 0, 4.7, 0, 6.1, 0.1, 5.6, materials.gold);
      } else shape(p, dome, accent, [0, 4.8, 0], [3.05, 1.15, 2.8]);
      column(p, 0, 6, 0, 0.06, 0.65, materials.gold);
      sphere(p, 0, 6.4, 0, 0.12, materials.gold);
      arch(p, 0, 1.8, 3.8, 4, materials.trim);
      garland(p, 4.6, 4.3, 2, accent);
      for (const x of [-2.3, 2.3]) {
        for (let y = 0.7; y < 4; y += 0.25) flower(p, x, y, 2, y % 1 < 0.5 ? materials.ivory : materials.yellow);
        lamp(p, x * 1.25, 2.7);
        column(p, x * 1.05, 0.6, -2.6, 0.3, 0.7, materials.gold);
        for (let i = 0; i < 8; i++) flower(p, x * 1.05 + Math.cos(i) * 0.3, 1 + Math.sin(i) * 0.2, -2.6, accent, 0.14);
      }
      box(p, -2.32, 2.2, 0, 0.04, 3.8, 3.6, materials.ivory);
      box(p, 2.32, 2.2, 0, 0.04, 3.8, 3.6, materials.ivory);
      box(p, 0, 1.8, -2, 4.6, 3, 0.12, accent);
      ring(p, 0, 2.1, -1.85, 1.1, materials.gold, [0, 0, 0]);
      if (theme === "sagai") {
        ring(p, -0.4, 1.7, 0, 0.7, materials.gold, [0.15, 0.35, 0]);
        ring(p, 0.4, 1.7, 0.05, 0.7, materials.gold, [0.15, -0.35, 0]);
        box(p, 0, 0.65, 0, 2.2, 0.55, 1.3, materials.wood);
      } else if (theme === "sangeet") {
        column(p, 0, 0.7, 0, 1.5, 0.35, accent);
        for (const x of [-1, 1]) {
          box(p, x, 1.25, -0.8, 0.6, 0.85, 0.4, materials.wood);
          sphere(p, x, 1.25, -0.57, 0.18, materials.gold);
        }
        ring(p, 0, 2.6, -1.7, 0.45, materials.gold, [0, 0, 0]);
        for (let x = -1.2; x <= 1.2; x += 0.6) for (let z = -0.6; z <= 1.2; z += 0.6) box(p, x, 0.93, z, 0.5, 0.025, 0.5, (x + z) % 1 > 0.5 ? materials.lavender : materials.gold);
        for (const x of [-1.8, 1.8]) {
          column(p, x, 2.8, -1.5, 0.05, 2.5, materials.gold);
          sphere(p, x, 3.7, -1.5, 0.15, materials.fire);
        }
      } else if (theme === "haldi") {
        column(p, 0, 0.75, 0, 0.8, 0.25, materials.gold);
        shape(p, ball, materials.yellow, [0, 0.95, 0], [0.65, 0.13, 0.65]);
        for (let i = 0; i < 14; i++) flower(p, Math.cos(i) * 1.3, 0.5, Math.sin(i) * 1.3, materials.yellow, 0.15);
        for (let i = 0; i < 7; i++) {
          ring(p, 0, 0.43, 0, 0.5 + i * 0.14, i % 2 ? materials.yellow : materials.ivory);
        }
        for (let x = -1.5; x <= 1.5; x += 0.5) {
          for (let y = 2; y < 3.8; y += 0.25) flower(p, x, y, -1.8, materials.yellow);
        }
      } else if (theme === "kerala-marriage" || theme === "hapur-marriage") {
        box(p, 0, 0.65, 0, 1.8, 0.4, 1.8, materials.trim);
        column(p, 0, 0.95, 0, 0.55, 0.2, materials.gold);
        shape(p, ball, materials.fire, [0, 1.3, 0], [0.16, 0.5, 0.16]);
        for (const x of [-0.9, 0.9]) lamp(p, x, -0.7, 1.3);
        if (theme === "kerala-marriage") {
          for (const x of [-1.8, 1.8]) {
            column(p, x, 1.3, 0, 0.07, 2, materials.leaf);
            shape(p, ball, materials.leaf, [x, 2.4, 0], [0.18, 0.8, 0.5], [0, 0, x * 0.15]);
          }
          for (let i = 0; i < 7; i++) ring(p, 0, 0.87, 0, 0.75 + i * 0.09, i % 2 ? materials.ivory : materials.gold);
        } else {
          for (const x of [-1.3, 1.3]) for (const z of [-0.9, 0.9]) {
            column(p, x, 2, z, 0.05, 2.7, materials.gold);
          }
          box(p, 0, 3.4, 0, 3, 0.07, 2.3, materials.coral);
          garland(p, 2.7, 3.4, 1.2);
        }
      } else if (theme === "rituals") {
        box(p, 0, 0.6, 0, 2.8, 0.15, 2, materials.ivory);
        for (const x of [-0.8, 0, 0.8]) {
          column(p, x, 0.76, 0, 0.23, 0.09, materials.gold);
          sphere(p, x, 0.85, 0, 0.09, materials.yellow);
        }
        for (const x of [-1.3, 1.3]) lamp(p, x, -0.9, 1.8);
        garland(p, 3, 3.2, -1.7, materials.ivory);
      } else if (theme === "reception") {
        box(p, 0, 0.8, -0.8, 3.1, 0.6, 1.2, materials.gold);
        box(p, 0, 1.2, -0.8, 3, 0.25, 1.1, materials.ivory);
        for (let i = 0; i < 24; i++) {
          const a = Math.PI * i / 23;
          flower(p, Math.cos(a) * 1.6, 1.5 + Math.sin(a) * 1.6, -1.4, i % 2 ? materials.ivory : materials.sage, 0.2);
        }
        for (const x of [-1.6, 1.6]) {
          column(p, x, 0.7, 1, 0.4, 0.7, materials.trim);
          flower(p, x, 1.25, 1, materials.coral, 0.25);
        }
      } else {
        box(p, 0, 0.8, -0.7, 2.8, 0.55, 1.2, materials.gold);
        box(p, 0, 1.2, -0.7, 2.65, 0.25, 1.1, materials.ivory);
        for (const x of [-1.2, 1.2]) sphere(p, x, 1.6, -1, 0.3, accent);
        garland(p, 2.3, 2.8, -1.6, accent);
        for (let i = 0; i < 18; i++) {
          const a = Math.PI * i / 17;
          flower(p, Math.cos(a) * 1.4, 1.5 + Math.sin(a) * 1.4, -1.4, materials.rose, 0.15);
        }
      }
      const hit = new THREE.Mesh(new THREE.BoxGeometry(5.6, 6, 5), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(side * 12, 3, z);
      hit.userData.eventIndex = index;
      scene.add(hit);
      hitTargets.push(hit);
      const label = document.createElement("span");
      label.className = "fort-world-label";
      label.textContent = `${String(index + 1).padStart(2, "0")} · ${event.name}`;
      label.addEventListener("click", () => selectEvent(index));
      byId("fort-labels").append(label);
      labelNodes.push(label);
    });
    for (let z = -19; z <= 14; z += 3) {
      lamp(world, -4, z, 0.65);
      lamp(world, 4, z, 0.65);
    }
    // An original palanquin travels only through the clear central courtyard lanes.
    const doli = group(0, 0.25, 12);
    box(doli, 0, 0.65, 0, 1.6, 0.28, 1.8, materials.gold, true);
    box(doli, 0, 0.87, 0, 1.4, 0.16, 1.6, materials.coral, true);
    for (const x of [-0.68, 0.68]) {
      box(doli, x, 0.65, 0, 0.1, 0.1, 4.6, materials.wood, true);
      for (const z of [-0.72, 0.72]) column(doli, x, 1.6, z, 0.045, 1.6, materials.gold, true);
      box(doli, x, 1.5, 0, 0.035, 1.15, 1.35, materials.coral, true);
    }
    shape(doli, dome, materials.coral, [0, 2.45, 0], [1, 0.38, 1.05], [0, 0, 0], true);
    column(doli, 0, 2.9, 0, 0.045, 0.45, materials.gold, true);
    sphere(doli, 0, 3.17, 0, 0.09, materials.gold, true);
    for (let i = 0; i < 11; i++) sphere(doli, -0.75 + i * 0.15, 2.3 - Math.sin(i / 10 * Math.PI) * 0.18, 0.86, 0.05, i % 2 ? materials.ivory : materials.yellow, true);
    doli.visible = false;
    const memoryLocations = {};
    for (const [index, section] of ["story", "family", "people"].entries()) {
      const x = -6 + index * 6;
      const p = group(x, 0, -21);
      const mat = section === "story" ? materials.sage : section === "family" ? materials.gold : materials.rose;
      box(p, 0, 0.3, 0, 4.5, 0.35, 3.4, mat);
      arch(p, 0, 1.3, 3.5, 4.2);
      garland(p, 3.8, 4.1, 1.5, mat);
      box(p, 0, 2, -1, 3.6, 3, 0.15, materials.wood);
      ring(p, 0, 2.3, -0.8, 1, materials.gold, [0, 0, 0]);
      for (const side of [-1, 1]) lamp(p, side * 2, 1.9, 1.2);
      memoryLocations[section] = { target: new THREE.Vector3(x, 2, -21), position: new THREE.Vector3(x, 4, -13) };
      const plaque = document.createElement("span");
      plaque.className = "fort-world-label";
      plaque.textContent = section === "story" ? "Our story garden" : section === "family" ? "Family haveli" : "Meet the couple";
      plaque.addEventListener("click", () => discover(section));
      byId("fort-labels").append(plaque);
      locations.push({ label: new THREE.Vector3(x, 5, -21) });
      labelNodes.push(plaque);
    }
    // Written information is anchored to the world as well as mirrored in accessible panels.
    const spatialBoards = [];
    const memoryBoards = { story: [], family: [], people: [] };
    const boardTextures = [];
    const boardMaterials = [];
    function board(parent, lines, x, y, z, w = 3.1, h = 2.1) {
      const image = document.createElement("canvas");
      image.width = 768;
      image.height = 512;
      const ctx = image.getContext("2d");
      if (!ctx) throw new Error("Could not create spatial invitation plaques.");
      ctx.fillStyle = "#fff0d6";
      ctx.fillRect(0, 0, 768, 512);
      ctx.strokeStyle = "#b48a42";
      ctx.lineWidth = 8;
      ctx.strokeRect(12, 12, 744, 488);
      ctx.fillStyle = "#453729";
      let row = 58;
      for (const [index, text] of lines.entries()) {
        ctx.font = index === 0 ? "bold 32px Georgia" : "24px sans-serif";
        const words = String(text).split(/\s+/);
        let line = "";
        for (const word of words) {
          const next = `${line} ${word}`.trim();
          if (ctx.measureText(next).width > 688 && line) { ctx.fillText(line, 38, row); row += 32; line = word; }
          else line = next;
        }
        if (row < 470) ctx.fillText(line, 38, row);
        row += 40;
        if (row > 470) break;
      }
      const texture = new THREE.CanvasTexture(image);
      texture.colorSpace = THREE.SRGBColorSpace;
      boardTextures.push(texture);
      const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      boardMaterials.push(mat);
      const geo = geometry("plaque", () => new THREE.PlaneGeometry(1, 1));
      const plaque = new THREE.Mesh(geo, mat);
      plaque.position.set(x, y, z);
      plaque.scale.set(w, h, 1);
      parent.add(plaque);
      spatialBoards.push(plaque);
      return plaque;
    }
    events.forEach((event, index) => {
      const side = index % 2 ? 1 : -1;
      const p = group(side * 12, 0, 10 - Math.floor(index / 2) * 8, -side * Math.PI / 2);
      const venue = config.venues.find(v => v.id === event.venueId);
      board(p, [event.name, dateLabel(event.date), event.time, venue.name, venue.address, `Dress: ${event.dressCode || "Not yet provided"}`, `Travel: ${event.directions || venue.directions || "Open Maps from Discover"}`], 0, 2.2, -1.65);
    });
    const storyBoard = group(-6, 0, -21);
    memoryBoards.story.push(board(storyBoard, ["Our story", config.story.intro, "Discover this garden to unfold our timeline."], 0, 2.2, 0));
    const familyBoard = group(0, 0, -21);
    memoryBoards.family.push(board(familyBoard, ["Our families", `${config.couple.groom.firstName}'s family · ${config.couple.bride.firstName}'s family`, "Family details are in the haveli. Use Next plaque to meet configured family members."], 0, 2.2, 0));
    const peopleBoard = group(6, 0, -21);
    memoryBoards.people.push(board(peopleBoard, [config.couple.bride.fullName, config.couple.bride.roots, config.couple.groom.fullName, config.couple.groom.roots, "Discover to meet the couple."], 0, 2.2, 0));
    config.story.chapters.forEach((chapter, index) => {
      const p = group(-6, 0, -21);
      memoryBoards.story.push(board(p, [chapter.label, chapter.date, chapter.title, chapter.text], 0, 2.2, 0));
    });
    for (const role of ["groom", "bride"]) {
      const person = config.couple[role];
      memoryBoards.people.push(board(peopleBoard, [person.fullName, person.roots, person.bio], 0, 2.2, 0));
      const members = config.family?.[role] || [];
      if (!members.length) memoryBoards.family.push(board(familyBoard, [`${person.firstName}'s family`, "Family introductions have not yet been provided."], 0, 2.2, 0));
      for (const member of members) memoryBoards.family.push(board(familyBoard, [member.name, member.relationship || "", member.bio || ""], 0, 2.2, 0));
    }
    scene.updateMatrixWorld(true);
    for (const { geo, mat, objects } of groups.values()) {
      const instances = new THREE.InstancedMesh(geo, mat, objects.length);
      objects.forEach((object, index) => {
        instances.setMatrixAt(index, object.matrixWorld);
        object.removeFromParent();
      });
      instances.instanceMatrix.needsUpdate = true;
      instances.computeBoundingSphere();
      scene.add(instances);
    }
    let animation;
    let lastFrame = 0;
    let transition;
    let doorAngle = 0;
    let contextLost = false;
    let suspended = false;
    let width = 0;
    let height = 0;
    let slowFrames = 0;
    let orbitAngle = 0;
    const held = new Set();
    let heading = 0;
    let driving = false;
    let nearby = null;
    const obstacles = [{ x: 0, z: -4, radius: 4.1 }];
    for (let z = -19; z <= 14; z += 3) for (const x of [-4, 4]) obstacles.push({ x, z, radius: 0.55 });
    const navigationTargets = [
      ...events.map((event, index) => ({ x: index % 2 ? 6.8 : -6.8, z: 10 - Math.floor(index / 2) * 8, index, name: event.name })),
      ...Object.entries(memoryLocations).map(([section, place]) => ({ x: place.target.x, z: -18, section, name: section === "story" ? "Our story garden" : section === "family" ? "Family haveli" : "Meet the couple" }))
    ];
    function canMove(x, z) {
      return x >= -7.3 && x <= 7.3 && z >= -18.5 && z <= 12 &&
        obstacles.every(o => Math.hypot(x - o.x, z - o.z) >= o.radius);
    }
    function proximity() {
      let nearest = null;
      let distance = 3;
      for (const place of navigationTargets) {
        const candidate = Math.hypot(place.x - doli.position.x, place.z - doli.position.z);
        if (candidate < distance) { nearest = place; distance = candidate; }
      }
      if (nearby !== nearest) {
        nearby = nearest;
        byId("doli-prompt").textContent = nearby ? `${nearby.name} is nearby. Press Enter or Discover.` : "Carry the doli towards a celebration. Arrow keys / WASD.";
        byId("doli-interact").disabled = !nearby;
      }
    }
    function carry(dt) {
      if (!driving || selected !== null || memory !== null || transition) return;
      const turn = (held.has("left") ? 1 : 0) - (held.has("right") ? 1 : 0);
      const speed = (held.has("forward") ? 1 : 0) - (held.has("backward") ? 1 : 0);
      heading += turn * dt * 1.9;
      const x = doli.position.x + Math.sin(heading) * speed * dt * 4;
      const z = doli.position.z - Math.cos(heading) * speed * dt * 4;
      if (canMove(x, z)) doli.position.set(x, 0.25, z);
      else {
        if (canMove(x, doli.position.z)) doli.position.x = x;
        if (canMove(doli.position.x, z)) doli.position.z = z;
      }
      doli.rotation.y = -heading;
      proximity();
      const offset = width < 700 ? new THREE.Vector3(0, 12, 6) : new THREE.Vector3(0, 10, 6);
      const target = doli.position.clone().add(offset);
      camera.position.lerp(target, reducedMotion.matches ? 1 : Math.min(dt * 5, 1));
      look.copy(doli.position).add(new THREE.Vector3(0, 0.8, -3));
    }
    const keys = { ArrowUp: "forward", w: "forward", W: "forward", ArrowDown: "backward", s: "backward", S: "backward", ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
    const keyHandler = (event, down) => {
      if (entrance.hidden || !driving || selected !== null || memory !== null || event.target.matches("input,textarea,select")) return;
      const direction = keys[event.key];
      if (direction) { event.preventDefault(); if (down) held.add(direction); else held.delete(direction); start(); }
      if (down && event.key === "Enter" && !event.target.closest("button,a,input")) { event.preventDefault(); engine.interact(); }
    };
    document.addEventListener("keydown", event => keyHandler(event, true));
    document.addEventListener("keyup", event => keyHandler(event, false));
    window.addEventListener("blur", () => held.clear());
    document.querySelectorAll("[data-drive]").forEach(button => {
      button.addEventListener("pointerdown", event => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        held.add(button.dataset.drive);
        start();
      });
      for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) button.addEventListener(type, () => held.delete(button.dataset.drive));
    });
    const roomLight = new THREE.PointLight(0xffc586, 0, 12, 2);
    scene.add(roomLight);
    const particleCount = mobile ? 48 : 90;
    const petalGeo = new THREE.SphereGeometry(1, 5, 3);
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xf4c9b5, roughness: 0.7, side: THREE.DoubleSide });
    const shower = new THREE.InstancedMesh(petalGeo, petalMat, particleCount);
    shower.visible = false;
    shower.frustumCulled = false;
    scene.add(shower);
    const splash = new THREE.Mesh(ringGeometry, new THREE.MeshStandardMaterial({ color: 0xf0b52f, transparent: true, opacity: 0.7 }));
    splash.rotation.x = Math.PI / 2;
    splash.visible = false;
    scene.add(splash);
    const particle = new THREE.Object3D();
    let effectStart = 0;
    let effectKind = "none";
    let effectPosition = new THREE.Vector3();
    function celebration(index) {
      const event = events[index];
      const theme = themeFor(event);
      const defaults = { roka: "petals", "kerala-marriage": "petals", rituals: "warm-glow", reception: "petals", sagai: "golden-petals", haldi: "golden-petals", sangeet: "lights", "hapur-marriage": "petals" };
      const allowed = ["petals", "golden-petals", "lights", "warm-glow", "none"];
      effectKind = allowed.includes(event.effect) ? event.effect : defaults[theme];
      effectStart = performance.now();
      effectPosition.copy(locations[index].target);
      const color = effectKind === "golden-petals" ? 0xf4bc34 : theme === "kerala-marriage" ? 0xfff0cc : theme === "reception" ? 0xd9e2b8 : effectKind === "lights" ? 0xd8b5ff : 0xeaaaaf;
      petalMat.color.setHex(color);
      petalMat.emissive.setHex(effectKind === "lights" ? color : 0x000000);
      petalMat.emissiveIntensity = 0.5;
      shower.visible = effectsEnabled && !reducedMotion.matches && ["petals", "golden-petals", "lights"].includes(effectKind);
      splash.visible = effectsEnabled && !reducedMotion.matches && theme === "haldi" && effectKind !== "none";
    }
    function animateCelebration(now) {
      const elapsed = (now - effectStart) / 1000;
      if (!effectsEnabled || reducedMotion.matches || selected === null || elapsed > 6) {
        shower.visible = false;
        splash.visible = false;
        return;
      }
      if (shower.visible) {
        for (let i = 0; i < particleCount; i++) {
          const seed = i * 2.39996;
          const x = Math.sin(seed) * 2 + Math.sin(elapsed + i) * 0.25;
          const z = Math.cos(seed) * 1.6;
          const y = effectKind === "lights" ? 1.5 + Math.sin(elapsed * 0.5 + seed) * 1.2 : 5.5 - ((elapsed * 0.75 + i * 0.12) % 5);
          particle.position.set(effectPosition.x + x, y, effectPosition.z + z);
          particle.rotation.set(seed + elapsed * 0.4, seed, elapsed * 0.3);
          const size = effectKind === "lights" ? 0.055 : 0.09;
          particle.scale.set(size, effectKind === "lights" ? size : size * 0.2, size * 1.5);
          particle.updateMatrix();
          shower.setMatrixAt(i, particle.matrix);
        }
        shower.instanceMatrix.needsUpdate = true;
      }
      if (splash.visible) {
        splash.position.set(effectPosition.x, 0.48, effectPosition.z);
        const size = 0.6 + Math.min(elapsed, 3) * 0.7;
        splash.scale.setScalar(size);
        splash.material.opacity = Math.max(0, 0.6 - elapsed * 0.15);
      }
    }
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const projected = new THREE.Vector3();
    const overview = () => {
      const portrait = width < height;
      return { position: new THREE.Vector3(0, portrait ? 32 : 24, portrait ? 43 : 34), target: new THREE.Vector3(0, 0, -3) };
    };
    const resize = () => {
      if (entrance.hidden) return;
      width = entrance.clientWidth;
      height = entrance.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    function labels() {
      const showing = entrance.classList.contains("is-exploring") && selected === null && memory === null && !transition;
      labelNodes.forEach((node, index) => {
        if (!showing) { node.hidden = true; return; }
        projected.copy(locations[index].label).project(camera);
        node.hidden = projected.z > 1 || Math.abs(projected.x) > 0.98 || Math.abs(projected.y) > 0.85;
        node.style.transform = `translate(-50%, -50%) translate(${(projected.x * 0.5 + 0.5) * width}px,${(-projected.y * 0.5 + 0.5) * height}px)`;
      });
    }
    function move(position, target, duration = 1500, gate = 1, via = null, complete = null) {
      if (reducedMotion.matches) {
        camera.position.copy(position);
        look.copy(target);
        doorAngle = gate;
        transition = null;
      } else {
        transition = { from: camera.position.clone(), to: position, lookFrom: look.clone(), lookTo: target, start: performance.now(), duration, gateFrom: doorAngle, gate, via, complete };
      }
      start();
    }
    function render(now) {
      animation = undefined;
      if (entrance.hidden || document.hidden || suspended || contextLost) return;
      const frameMs = now - lastFrame;
      if (!reducedMotion.matches && frameMs < 32) { animation = requestAnimationFrame(render); return; }
      lastFrame = now;
      carry(Math.min(frameMs / 1000 || 0, 0.05));
      if (frameMs > 65 && frameMs < 500) slowFrames++;
      if (slowFrames === 35 && renderer.getPixelRatio() > 1) renderer.setPixelRatio(1);
      if (transition) {
        const t = Math.min((now - transition.start) / transition.duration, 1);
        const ease = t * t * (3 - 2 * t);
        if (transition.via) {
          const curve = new THREE.QuadraticBezierCurve3(transition.from, transition.via, transition.to);
          camera.position.copy(curve.getPoint(ease));
        } else camera.position.lerpVectors(transition.from, transition.to, ease);
        look.lerpVectors(transition.lookFrom, transition.lookTo, ease);
        doorAngle = THREE.MathUtils.lerp(transition.gateFrom, transition.gate, Math.min(t * 2.8, 1));
        if (t === 1) {
          const complete = transition.complete;
          transition = null;
          complete?.();
        }
      }
      for (const [section, plaques] of Object.entries(memoryBoards)) plaques.forEach((plaque, index) => {
        plaque.visible = memory === section ? index === memoryPage % plaques.length : index === 0;
      });
      gateHinges[0].rotation.y = -doorAngle * Math.PI * 0.49;
      gateHinges[1].rotation.y = doorAngle * Math.PI * 0.49;
      const a = reducedMotion.matches ? 0.6 : now / 5000;
      couple.position.set(Math.sin(a) * 0.75, 0, Math.cos(a) * 0.75);
      couple.rotation.y = a + Math.PI / 2;
      animateCelebration(now);
      camera.lookAt(look);
      labels();
      renderer.setViewport(0, 0, width, height);
      renderer.clear();
      if ((selected !== null || memory !== null) && entrance.classList.contains("is-exploring")) {
        const viewportWidth = width < 700 ? width : width * 0.62;
        const viewportHeight = width < 700 ? height * 0.48 : height;
        renderer.setViewport(0, height - viewportHeight, viewportWidth, viewportHeight);
        camera.aspect = viewportWidth / viewportHeight;
      } else camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      entrance.classList.add("three-ready");
      if (!reducedMotion.matches || transition || held.size) animation = requestAnimationFrame(render);
    }
    function start() {
      if (animation || entrance.hidden || contextLost || document.hidden || suspended) return;
      animation = requestAnimationFrame(render);
    }
    engine = {
      enter() {
        resize();
        roomLight.intensity = 0;
        orbitAngle = 0;
        driving = true;
        doli.visible = true;
        const view = { position: new THREE.Vector3(0, 10, 18), target: new THREE.Vector3(0, 1, 9) };
        if (reducedMotion.matches) move(view.position, view.target);
        else move(new THREE.Vector3(0, 4, 12), new THREE.Vector3(0, 2, -4), 2400, 1, null,
          () => move(view.position, view.target, 1800));
      },
      visit(index) {
        held.clear();
        driving = false;
        resize();
        const place = locations[index];
        const theme = themeFor(events[index]);
        const roomColours = { roka: 0xffb0ab, "kerala-marriage": 0xffe0a6, rituals: 0xffd4a0, reception: 0xc9edbd, sagai: 0xffb7d5, haldi: 0xffdb52, sangeet: 0xc59dff, "hapur-marriage": 0xffa876 };
        roomLight.color.setHex(roomColours[theme]);
        roomLight.position.copy(place.target).add(new THREE.Vector3(0, 2, 0));
        roomLight.intensity = 24;
        celebration(index);
        const position = place.position.clone();
        // On phones the scene occupies the upper half, with a readable detail sheet below.
        if (width < 700) { position.y += 1.2; position.x *= 0.75; }
        move(position, place.target.clone(), 1500);
      },
      courtyard() {
        driving = true; doli.visible = true; held.clear(); orbitAngle = 0; roomLight.intensity = 0; shower.visible = false; splash.visible = false;
        move(doli.position.clone().add(new THREE.Vector3(0, 10, 6)), doli.position.clone().add(new THREE.Vector3(0, 1, -3)));
      },
      memory(section) {
        driving = false;
        held.clear();
        roomLight.intensity = 0;
        shower.visible = false;
        splash.visible = false;
        const place = memoryLocations[section];
        move(place.position.clone(), place.target.clone());
      },
      page(delta) {
        if (!memory) return;
        memoryPage = (memoryPage + delta + memoryBoards[memory].length) % memoryBoards[memory].length;
        setStatus(`Plaque ${memoryPage + 1} of ${memoryBoards[memory].length}`);
        start();
      },
      interact() {
        if (!nearby || !driving) return;
        if (nearby.section) discover(nearby.section);
        else selectEvent(nearby.index);
      },
      recover() {
        doli.position.set(0, 0.25, 12); heading = 0; held.clear(); proximity(); this.courtyard();
      },
      orbit(delta) {
        if (selected !== null || memory !== null || !entrance.classList.contains("is-exploring")) return;
        orbitAngle = THREE.MathUtils.clamp(orbitAngle + delta, -0.4, 0.4);
        const view = overview();
        const offset = view.position.clone().sub(view.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), orbitAngle);
        move(offset.add(view.target), view.target, 300);
      },
      reset() {
        transition = null;
        doorAngle = 0;
        driving = false;
        held.clear();
        doli.visible = false;
        doli.position.set(0, 0.25, 12);
        heading = 0;
        orbitAngle = 0;
        roomLight.intensity = 0;
        shower.visible = false;
        splash.visible = false;
        camera.position.copy(exterior);
        look.set(0, 4, 18);
        start();
      },
      stats() {
        return { drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, pixelRatio: renderer.getPixelRatio(), transitioning: !!transition, camera: camera.position.toArray(), orbitAngle, effect: effectKind, particlesVisible: shower.visible, particleLimit: particleCount, doli: doli.position.toArray(), heading, driving, nearby: nearby?.name || null, memoryPage, visibleMemoryPlaque: memory ? memoryBoards[memory].findIndex(plaque => plaque.visible) : null, spatialPlaques: spatialBoards.length };
      },
      effects(enabled) {
        if (!enabled) { shower.visible = false; splash.visible = false; }
        else if (selected !== null) celebration(selected);
        start();
      }
    };
    let pointerDown;
    canvas.addEventListener("pointerdown", event => { pointerDown = { x: event.clientX, y: event.clientY, lastX: event.clientX }; });
    canvas.addEventListener("pointerup", event => {
      if (!entrance.classList.contains("is-exploring") || selected !== null || !pointerDown) return;
      if (Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 12) return;
      const rect = canvas.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(hitTargets)[0];
      if (hit) selectEvent(hit.object.userData.eventIndex);
    });
    canvas.addEventListener("pointermove", event => {
      if (!entrance.classList.contains("is-exploring") || selected !== null) return;
      if (pointerDown && event.buttons && !reducedMotion.matches) {
        const delta = event.clientX - pointerDown.lastX;
        pointerDown.lastX = event.clientX;
        if (Math.abs(event.clientX - pointerDown.x) > 12) engine.orbit(-delta * 0.003);
      }
      const rect = canvas.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      canvas.style.cursor = raycaster.intersectObjects(hitTargets).length ? "pointer" : "default";
    });
    canvas.addEventListener("pointercancel", () => { pointerDown = null; });
    canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      contextLost = true;
      cancelAnimationFrame(animation);
      animation = undefined;
      entrance.classList.remove("three-ready");
      loading.hidden = false;
      loading.textContent = "3D paused. The illustrated welcome and all event details remain available.";
      setStatus("3D paused on this device. All celebrations can still be explored using the buttons below.");
    });
    canvas.addEventListener("webglcontextrestored", () => {
      contextLost = false;
      loading.hidden = true;
      setStatus("Your courtyard is ready.");
      start();
    });
    window.addEventListener("resize", () => {
      resize();
      if (!entrance.hidden && entrance.classList.contains("is-exploring")) {
        if (memory !== null) engine.memory(memory);
        else if (selected !== null) engine.visit(selected);
        else engine.courtyard();
      }
      start();
    });
    document.addEventListener("visibilitychange", () => { held.clear(); start(); });
    reducedMotion.addEventListener("change", () => {
      if (reducedMotion.matches && transition) {
        camera.position.copy(transition.to);
        look.copy(transition.lookTo);
        doorAngle = transition.gate;
        transition = null;
      }
      start();
    });
    window.addEventListener("pagehide", event => {
      suspended = true;
      cancelAnimationFrame(animation);
      animation = undefined;
      if (event.persisted) return;
      renderer.dispose();
      geometries.forEach(geo => geo.dispose());
      Object.values(materials).forEach(mat => mat.dispose());
      hitTargets.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose(); });
      starGeo.dispose();
      starMat.dispose();
      petalGeo.dispose();
      petalMat.dispose();
      splash.material.dispose();
      boardTextures.forEach(texture => texture.dispose());
      boardMaterials.forEach(mat => mat.dispose());
    });
    window.addEventListener("pageshow", () => { suspended = false; start(); });
    resize();
    start();
    loading.hidden = true;
    setStatus("Your courtyard is ready. Choose a celebration to step inside.");
    if (entrance.classList.contains("is-exploring")) {
      if (memory !== null) engine.memory(memory);
      else if (selected !== null) engine.visit(selected);
      else engine.enter();
    }
  } catch (error) {
    renderer?.dispose();
    entrance.querySelector(".three-canvas")?.remove();
    unavailable = true;
    console.warn("Immersive wedding fort unavailable; accessible illustrated mode is active.", error);
    loading.hidden = false;
    loading.textContent = "3D unavailable on this device. The illustrated welcome and every event detail are still available.";
    setStatus("Illustrated mode. Choose any celebration below to read its details.");
    byId("doli-prompt").textContent = "3D travel is unavailable. Choose a celebration, story or family destination instead.";
    document.querySelectorAll("[data-drive]").forEach(button => { button.disabled = true; });
    byId("doli-recover").disabled = true;
    entrance.classList.remove("three-ready");
  } finally {
    initializing = false;
  }
}
new MutationObserver(() => {
  if (entrance.hidden) { experienceVersion++; return; }
  if (!reducedMotion.matches || entrance.classList.contains("is-exploring")) initialize();
  engine?.reset();
  if (entrance.classList.contains("is-exploring")) {
    if (memory !== null) engine?.memory(memory);
    else if (selected !== null) engine?.visit(selected);
    else engine?.enter();
  }
}).observe(entrance, { attributes: true, attributeFilter: ["hidden"] });
if (!entrance.hidden && !reducedMotion.matches) initialize();

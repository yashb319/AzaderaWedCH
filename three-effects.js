// One WebGL context renders the gates and ceremony in separate viewports.
const entrance = document.getElementById("entrance");
const ritual = entrance.querySelector(".ritual");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let startScene;
let loading = false;
let failed = false;

async function enhance() {
  if (loading || failed || reducedMotion.matches || entrance.hidden) return;
  if (startScene) { startScene(); return; }
  loading = true;
  try {
    const THREE = await import("./assets/vendor/three.module.min.js");
    const canvas = document.createElement("canvas");
    canvas.className = "three-canvas";
    canvas.setAttribute("aria-hidden", "true");
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x392a28, 0);
    renderer.autoClear = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    entrance.prepend(canvas);

    const materials = {
      wood: new THREE.MeshStandardMaterial({ color: 0x412d2c, roughness: 0.63 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xcda760, metalness: 0.7, roughness: 0.3 }),
      ivory: new THREE.MeshStandardMaterial({ color: 0xfff0cc, roughness: 0.85 }),
      coral: new THREE.MeshStandardMaterial({ color: 0xae4f3d, roughness: 0.75 }),
      skin: new THREE.MeshStandardMaterial({ color: 0xb77850, roughness: 0.9 }),
      hair: new THREE.MeshStandardMaterial({ color: 0x282e25, roughness: 0.9 }),
      green: new THREE.MeshStandardMaterial({ color: 0x647557, roughness: 0.8 }),
      fire: new THREE.MeshStandardMaterial({ color: 0xffbd4b, emissive: 0xf29926, emissiveIntensity: 1.1 }),
      marigold: new THREE.MeshStandardMaterial({ color: 0xe7a542, roughness: 0.8 })
    };
    const mesh = (geometry, material, parent, x = 0, y = 0, z = 0) => {
      const object = new THREE.Mesh(geometry, material);
      object.position.set(x, y, z);
      parent.add(object);
      return object;
    };
    const box = (parent, w, h, d, x, y, z, material = materials.gold) =>
      mesh(new THREE.BoxGeometry(w, h, d), material, parent, x, y, z);
    const sphere = (parent, radius, x, y, z, material) =>
      mesh(new THREE.SphereGeometry(radius, 16, 12), material, parent, x, y, z);
    const lightScene = scene => {
      scene.add(new THREE.HemisphereLight(0xffefd7, 0x5c4c34, 2.5));
      const light = new THREE.DirectionalLight(0xffe6ba, 3.2);
      light.position.set(-3, 5, 6);
      scene.add(light);
    };
    const gateScene = new THREE.Scene();
    const ceremony = new THREE.Scene();
    lightScene(gateScene);
    lightScene(ceremony);
    const gateCamera = new THREE.OrthographicCamera(-5, 5, 4, -4, 0.1, 100);
    gateCamera.position.z = 20;
    const ceremonyCamera = new THREE.PerspectiveCamera(42, 240 / 220, 0.1, 30);
    ceremonyCamera.position.set(0, 3.3, 4.7);
    ceremonyCamera.lookAt(0, 0.35, 0);
    const gateRoot = new THREE.Group();
    gateScene.add(gateRoot);
    let leftHinge;
    let rightHinge;
    let width = 0;
    let height = 0;
    const buildGate = (side, panelWidth, panelHeight) => {
      const hinge = new THREE.Group();
      hinge.position.x = side * panelWidth;
      gateRoot.add(hinge);
      const panel = new THREE.Group();
      panel.position.x = -side * panelWidth / 2;
      hinge.add(panel);
      box(panel, panelWidth, panelHeight, 0.15, 0, 0, -0.15, materials.wood);
      for (const x of [-panelWidth / 2 + 0.03, panelWidth / 2 - 0.03]) {
        box(panel, 0.035, panelHeight, 0.07, x, 0, 0);
      }
      for (const y of [-panelHeight / 2 + 0.06, panelHeight / 2 - 0.06]) {
        box(panel, panelWidth, 0.035, 0.07, 0, y, 0);
      }
      const radius = Math.min(panelWidth * 0.43, panelHeight * 0.28);
      for (const inset of [0, 0.1]) {
        const r = radius - inset;
        mesh(new THREE.TorusGeometry(r, 0.012, 6, 48, Math.PI), materials.gold, panel, 0, panelHeight * 0.1, 0.02);
        for (const x of [-r, r]) {
          box(panel, 0.022, panelHeight * 0.56, 0.04, x, -panelHeight * 0.18, 0.02);
        }
      }
      for (let i = 1; i < 10; i++) {
        box(panel, 0.014, panelHeight * 0.94, 0.035, -panelWidth / 2 + panelWidth * i / 10, 0, -0.04);
      }
      const handleX = -side * (panelWidth / 2 - 0.15);
      const handle = mesh(new THREE.TorusGeometry(0.11, 0.018, 8, 24), materials.gold, panel, handleX, -0.1, 0.09);
      handle.rotation.x = 0.12;
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        const petal = sphere(panel, 0.055, handleX + Math.cos(angle) * 0.19, -0.1 + Math.sin(angle) * 0.19, 0.04, materials.gold);
        petal.scale.set(1, 1.5, 0.25);
        petal.rotation.z = angle - Math.PI / 2;
      }
      return hinge;
    };
    const resize = () => {
      if (entrance.hidden) return;
      const nextWidth = entrance.clientWidth;
      const nextHeight = entrance.clientHeight;
      if (width === nextWidth && height === nextHeight) return;
      width = nextWidth;
      height = nextHeight;
      renderer.setSize(width, height);
      const worldWidth = width / 100;
      const worldHeight = height / 100;
      gateCamera.left = -worldWidth / 2;
      gateCamera.right = worldWidth / 2;
      gateCamera.top = worldHeight / 2;
      gateCamera.bottom = -worldHeight / 2;
      gateCamera.updateProjectionMatrix();
      gateRoot.traverse(object => { if (object.isMesh) object.geometry.dispose(); });
      gateRoot.clear();
      leftHinge = buildGate(-1, worldWidth / 2, worldHeight);
      rightHinge = buildGate(1, worldWidth / 2, worldHeight);
    };

    mesh(new THREE.CylinderGeometry(1.35, 1.45, 0.12, 48), materials.green, ceremony, 0, -0.1, 0);
    const ring = mesh(new THREE.TorusGeometry(1.12, 0.025, 8, 64), materials.gold, ceremony);
    ring.rotation.x = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(0.25, 0.16, 0.14, 24), materials.gold, ceremony, 0, 0.04, 0);
    const flame = sphere(ceremony, 0.16, 0, 0.28, 0, materials.fire);
    flame.scale.set(0.7, 1.8, 0.7);
    const fireLight = new THREE.PointLight(0xffbb55, 1.4, 3);
    fireLight.position.set(0, 0.5, 0);
    ceremony.add(fireLight);
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6;
      sphere(ceremony, 0.055, Math.cos(angle) * 1.27, 0.015, Math.sin(angle) * 1.27, i % 2 ? materials.ivory : materials.marigold);
    }
    const couple = new THREE.Group();
    ceremony.add(couple);
    const figure = (bride, x) => {
      const person = new THREE.Group();
      person.position.set(x, 0, 0);
      couple.add(person);
      mesh(
        bride ? new THREE.ConeGeometry(0.24, 0.76, 24) : new THREE.CylinderGeometry(0.17, 0.21, 0.7, 20),
        bride ? materials.ivory : materials.coral, person, 0, 0.4, 0
      );
      if (bride) {
        const hem = mesh(new THREE.TorusGeometry(0.218, 0.025, 6, 24), materials.gold, person, 0, 0.065, 0);
        hem.rotation.x = Math.PI / 2;
        const sash = box(person, 0.055, 0.57, 0.025, 0.015, 0.4, 0.155);
        sash.rotation.z = 0.38;
      } else {
        box(person, 0.055, 0.55, 0.025, 0.06, 0.43, 0.18, materials.ivory).rotation.z = 0.18;
        for (const footX of [-0.08, 0.08]) {
          sphere(person, 0.07, footX, 0.03, 0.06, materials.gold).scale.set(0.8, 0.5, 1.5);
        }
      }
      sphere(person, 0.17, 0, 0.94, 0, materials.skin);
      const hair = sphere(person, 0.18, 0, 1.005, -0.04, bride ? materials.hair : materials.coral);
      hair.scale.y = bride ? 0.85 : 0.7;
      if (bride) {
        sphere(person, 0.11, -0.08, 0.96, -0.16, materials.hair);
        for (let i = 0; i < 7; i++) {
          const angle = i * Math.PI / 6;
          sphere(person, 0.025, -0.08 + Math.cos(angle) * 0.1, 0.96 + Math.sin(angle) * 0.12, -0.19, materials.ivory);
        }
        sphere(person, 0.018, 0, 0.98, 0.16, materials.coral);
        for (const earX of [-0.17, 0.17]) sphere(person, 0.03, earX, 0.9, 0, materials.gold);
      } else {
        const band = mesh(new THREE.TorusGeometry(0.17, 0.018, 6, 24), materials.gold, person, 0, 1.025, -0.035);
        band.rotation.x = Math.PI / 2;
        sphere(person, 0.045, 0.08, 1.15, -0.03, materials.ivory).scale.y = 1.8;
      }
      for (const eyeX of [-0.06, 0.06]) sphere(person, 0.014, eyeX, 0.94, 0.151, materials.hair);
      for (let i = 0; i < 7; i++) {
        const angle = Math.PI * i / 6;
        sphere(person, 0.026, Math.cos(angle) * 0.11, 0.77 - Math.sin(angle) * 0.13, 0.15, bride ? materials.coral : materials.ivory);
      }
      const arm = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8), materials.skin, person, bride ? 0.2 : -0.2, 0.55, 0.03);
      arm.rotation.z = bride ? -0.7 : 0.7;
    };
    figure(true, -0.24);
    figure(false, 0.24);
    const hands = mesh(new THREE.TorusGeometry(0.14, 0.032, 8, 20, Math.PI), materials.skin, couple, 0, 0.44, 0.04);
    hands.rotation.z = Math.PI;

    let animation;
    let lastTime = 0;
    let angle = 0.4;
    let openingTime = null;
    let contextLost = false;
    const fallback = message => {
      cancelAnimationFrame(animation);
      entrance.classList.remove("three-ready");
      const status = document.getElementById("three-status");
      status.textContent = message;
      status.hidden = false;
    };
    canvas.addEventListener("webglcontextlost", event => {
      event.preventDefault();
      contextLost = true;
      fallback("3D paused. The illustrated welcome is available.");
    });
    canvas.addEventListener("webglcontextrestored", () => {
      contextLost = false;
      document.getElementById("three-status").hidden = true;
      startScene();
    });
    const render = now => {
      if (entrance.hidden || document.hidden || reducedMotion.matches || contextLost) {
        animation = undefined;
        return;
      }
      resize();
      const delta = Math.min((now - lastTime) / 1000 || 0, 0.05);
      lastTime = now;
      angle += delta * Math.PI / 8;
      if (entrance.classList.contains("is-opening")) openingTime ??= now;
      else openingTime = null;
      const progress = openingTime === null ? 0 : Math.min((now - openingTime) / 1600, 1);
      const eased = progress * progress * (3 - 2 * progress);
      leftHinge.rotation.y = -eased * Math.PI * 0.49;
      rightHinge.rotation.y = eased * Math.PI * 0.49;
      couple.position.set(Math.sin(angle) * 0.85, 0, Math.cos(angle) * 0.85);
      couple.rotation.y = angle + Math.PI / 2;
      flame.scale.y = 1.8 + Math.sin(now / 170) * 0.15;
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, width, height);
      renderer.clear();
      renderer.render(gateScene, gateCamera);
      const rect = ritual.getBoundingClientRect();
      const parent = entrance.getBoundingClientRect();
      renderer.setScissorTest(true);
      renderer.setScissor(rect.left - parent.left, height - (rect.bottom - parent.top), rect.width, rect.height);
      renderer.setViewport(rect.left - parent.left, height - (rect.bottom - parent.top), rect.width, rect.height);
      renderer.clearDepth();
      ceremonyCamera.aspect = rect.width / rect.height;
      ceremonyCamera.updateProjectionMatrix();
      renderer.render(ceremony, ceremonyCamera);
      entrance.classList.add("three-ready");
      animation = requestAnimationFrame(render);
    };
    startScene = () => {
      if (animation || entrance.hidden || reducedMotion.matches || contextLost) return;
      lastTime = performance.now();
      openingTime = null;
      animation = requestAnimationFrame(render);
    };
    document.addEventListener("visibilitychange", () => { if (!document.hidden) startScene(); });
    window.addEventListener("resize", resize);
    window.addEventListener("pageshow", () => startScene());
    window.addEventListener("pagehide", event => {
      cancelAnimationFrame(animation);
      animation = undefined;
      if (event.persisted) return;
      renderer.dispose();
      for (const scene of [gateScene, ceremony]) {
        scene.traverse(object => { if (object.isMesh) object.geometry.dispose(); });
      }
      Object.values(materials).forEach(material => material.dispose());
    });
    startScene();
  } catch (error) {
    failed = true;
    console.warn("Three.js entrance unavailable; using illustrated fallback.", error);
    const status = document.getElementById("three-status");
    status.textContent = "3D unavailable on this device. Enjoy the illustrated welcome.";
    status.hidden = false;
    entrance.classList.remove("three-ready");
  } finally {
    loading = false;
  }
}

new MutationObserver(() => {
  if (!entrance.hidden) enhance();
}).observe(entrance, { attributes: true, attributeFilter: ["hidden"] });
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) entrance.classList.remove("three-ready");
  else enhance();
});
enhance();

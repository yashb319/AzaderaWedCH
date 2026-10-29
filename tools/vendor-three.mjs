import { copyFile, mkdir } from "node:fs/promises";

await mkdir(new URL("../assets/vendor/", import.meta.url), { recursive: true });
for (const name of ["three.module.min.js", "three.core.min.js"]) {
  await copyFile(
    new URL(`../node_modules/three/build/${name}`, import.meta.url),
    new URL(`../assets/vendor/${name}`, import.meta.url)
  );
}
await copyFile(
  new URL("../node_modules/three/LICENSE", import.meta.url),
  new URL("../assets/vendor/THREE-LICENSE.txt", import.meta.url)
);
console.log("Vendored Three.js modules and MIT license.");

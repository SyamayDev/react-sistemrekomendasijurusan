# RAJU — source assets

`raju.glb` is a portable export of the RAJU 3D mascot (with its book perch) for
Blender, AR viewers or other tools. It is **not** deployed with the website.

- Editable source: `src/components/three/raju/createRaju.js` (procedural three.js
  model: lathe body, face discs, rigged head/eyelids/wings/tassel, canvas textures
  in `textures.js`). The website renders the model live from that file.
- Regenerate this file and the website posters (`src/assets/raju/*.webp`):
  `npm run raju:export` (needs a local Chrome/Edge, or set `CHROME_PATH`).
- Preview poses/expressions: `npm run dev`, then open
  `/react-sistemrekomendasijurusan/tools/raju/viewer.html?pose=hero&spin=1`.
- Origin & licence: made from scratch for SI-RAJU (no third-party meshes,
  textures or HDRIs); same licence as this repository.

export const SKULL_LAUGH = { scale: 7.3, y: 0, rotX: 1.6558 };
export const OTHER_SKULL = { path: '/otherskull.glb' };
export const MODELS = [
  OTHER_SKULL,
  { path: '/skull_laugh.glb', ...SKULL_LAUGH },
];

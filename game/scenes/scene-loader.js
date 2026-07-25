/* === SCENE LOADER === */
const SceneLoader = {
  scenes: {},
  current: null,

  register(name, scene) {
    this.scenes[name] = scene;
  },

  load(name) {
    if (this.scenes[name]) {
      if (this.current && this.current.unload) this.current.unload();
      this.current = this.scenes[name];
      Engine.scene = this.current;
      Engine.player.x = this.current.playerStart?.x || 80;
      Engine.player.y = this.current.playerStart?.y || 80;
      if (this.current.init) this.current.init();
      return true;
    }
    console.error('Scene not found:', name);
    return false;
  }
};
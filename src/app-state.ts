class AppState {
  #cleanupFns: Function[] = [];

  addCleanupCb(cb: Function) {
    this.#cleanupFns.push(cb);
    return cb;
  }

  removeCleanupCb(cb: Function) {
    this.#cleanupFns = this.#cleanupFns.filter((currentCb) => currentCb !== cb);
  }

  clean() {
    this.#cleanupFns.forEach((cb) => cb());
    this.#cleanupFns = [];
  }
}

const appState = new AppState();

export { appState };

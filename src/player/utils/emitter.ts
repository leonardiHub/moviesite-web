export function createEmitter<T extends Record<string, any>>() {
  const map = new Map<keyof T, Set<Function>>();
  return {
    on<K extends keyof T>(ev: K, cb: (p: T[K]) => void) {
      if (!map.has(ev)) map.set(ev, new Set());
      map.get(ev)!.add(cb);
      return () => map.get(ev)!.delete(cb);
    },
    emit<K extends keyof T>(ev: K, payload: T[K]) {
      const set = map.get(ev);
      if (!set) return;
      set.forEach(fn => {
        try { (fn as any)(payload); } catch {}
      });
    },
    clear() { map.clear(); }
  };
}

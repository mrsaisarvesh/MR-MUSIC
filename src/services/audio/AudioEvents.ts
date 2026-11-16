export type AudioEventCallback<T = any> = (data: T) => void;

export class AudioEventEmitter {
  private listeners: Map<string, Set<AudioEventCallback>> = new Map();

  on<T>(event: string, callback: AudioEventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.off(event, callback);
    };
  }

  off<T>(event: string, callback: AudioEventCallback<T>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit<T>(event: string, data?: T): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in audio event listener for "${event}":`, err);
        }
      });
    }
  }
}

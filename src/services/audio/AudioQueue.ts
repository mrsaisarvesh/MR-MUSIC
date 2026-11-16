import { Song, RepeatMode } from '../../types';

export class AudioQueue {
  private queue: Song[] = [];
  private originalQueue: Song[] = [];
  private currentIndex: number = -1;
  private shuffleEnabled: boolean = false;
  private repeatMode: RepeatMode = 'OFF';
  private history: Song[] = [];

  constructor(initialSongs: Song[] = []) {
    if (initialSongs.length > 0) {
      this.setQueue(initialSongs, 0);
    }
  }

  setQueue(songs: Song[], startIndex = 0): void {
    this.originalQueue = [...songs];
    if (songs.length === 0) {
      this.queue = [];
      this.currentIndex = -1;
      return;
    }

    const clampedStart = Math.max(0, Math.min(startIndex, songs.length - 1));
    if (this.shuffleEnabled) {
      this.shuffleWithCurrent(clampedStart);
    } else {
      this.queue = [...songs];
      this.currentIndex = clampedStart;
    }
  }

  getCurrentSong(): Song | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
      return this.queue[this.currentIndex];
    }
    return null;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getQueue(): Song[] {
    return [...this.queue];
  }

  getUpNext(): Song[] {
    if (this.currentIndex < 0 || this.currentIndex >= this.queue.length) {
      return [];
    }
    return this.queue.slice(this.currentIndex + 1);
  }

  hasNext(): boolean {
    if (this.repeatMode === 'REPEAT_ALL' && this.queue.length > 0) return true;
    return this.currentIndex < this.queue.length - 1;
  }

  hasPrevious(): boolean {
    return this.currentIndex > 0 || this.history.length > 0;
  }

  next(): Song | null {
    if (this.queue.length === 0) return null;

    const current = this.getCurrentSong();
    if (current) {
      this.history.push(current);
      if (this.history.length > 50) {
        this.history.shift();
      }
    }

    if (this.repeatMode === 'REPEAT_ONE' && current) {
      return current;
    }

    if (this.currentIndex < this.queue.length - 1) {
      this.currentIndex++;
      return this.queue[this.currentIndex];
    } else if (this.repeatMode === 'REPEAT_ALL') {
      this.currentIndex = 0;
      return this.queue[0];
    }

    return null;
  }

  previous(): Song | null {
    if (this.queue.length === 0) return null;

    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.queue[this.currentIndex];
    } else if (this.history.length > 0) {
      const prev = this.history.pop();
      if (prev) {
        const index = this.queue.findIndex((s) => s.id === prev.id);
        if (index !== -1) {
          this.currentIndex = index;
          return this.queue[index];
        }
      }
    }
    return this.getCurrentSong();
  }

  jumpToIndex(index: number): Song | null {
    if (index >= 0 && index < this.queue.length) {
      this.currentIndex = index;
      return this.queue[index];
    }
    return null;
  }

  addToQueue(song: Song): void {
    this.queue.push(song);
    this.originalQueue.push(song);
    if (this.currentIndex === -1) {
      this.currentIndex = 0;
    }
  }

  playNext(song: Song): void {
    const insertPos = this.currentIndex >= 0 ? this.currentIndex + 1 : 0;
    this.queue.splice(insertPos, 0, song);
    this.originalQueue.push(song);
    if (this.currentIndex === -1) {
      this.currentIndex = 0;
    }
  }

  removeFromQueue(index: number): void {
    if (index < 0 || index >= this.queue.length) return;
    const [removedSong] = this.queue.splice(index, 1);

    // Remove only one matching instance from originalQueue
    const origIdx = this.originalQueue.findIndex((s) => s.id === removedSong.id);
    if (origIdx !== -1) {
      this.originalQueue.splice(origIdx, 1);
    }

    if (this.queue.length === 0) {
      this.currentIndex = -1;
    } else if (index < this.currentIndex) {
      this.currentIndex--;
    } else if (index === this.currentIndex && this.currentIndex >= this.queue.length) {
      this.currentIndex = this.queue.length - 1;
    }
  }

  reorderQueue(fromIndex: number, toIndex: number): void {
    if (
      fromIndex < 0 ||
      fromIndex >= this.queue.length ||
      toIndex < 0 ||
      toIndex >= this.queue.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const [movedItem] = this.queue.splice(fromIndex, 1);
    this.queue.splice(toIndex, 0, movedItem);

    if (this.currentIndex === fromIndex) {
      this.currentIndex = toIndex;
    } else if (fromIndex < this.currentIndex && toIndex >= this.currentIndex) {
      this.currentIndex--;
    } else if (fromIndex > this.currentIndex && toIndex <= this.currentIndex) {
      this.currentIndex++;
    }
  }

  clearQueue(): void {
    const current = this.getCurrentSong();
    if (current) {
      this.queue = [current];
      this.originalQueue = [current];
      this.currentIndex = 0;
    } else {
      this.queue = [];
      this.originalQueue = [];
      this.currentIndex = -1;
    }
  }

  syncSongsMetadata(songs: Song[]): void {
    const map = new Map(songs.map((s) => [s.id, s]));
    this.queue = this.queue.map((s) => map.get(s.id) ?? s);
    this.originalQueue = this.originalQueue.map((s) => map.get(s.id) ?? s);
  }

  removeSongById(songId: string): { removedCurrent: boolean; nextSong: Song | null } {
    const current = this.getCurrentSong();
    const removedCurrent = current?.id === songId;

    const newQueue: Song[] = [];
    let newCurrentIndex = this.currentIndex;

    this.queue.forEach((s, idx) => {
      if (s.id === songId) {
        if (idx < this.currentIndex) {
          newCurrentIndex--;
        }
      } else {
        newQueue.push(s);
      }
    });

    this.queue = newQueue;
    this.originalQueue = this.originalQueue.filter((s) => s.id !== songId);
    this.history = this.history.filter((s) => s.id !== songId);

    if (this.queue.length === 0) {
      this.currentIndex = -1;
      return { removedCurrent, nextSong: null };
    }

    if (newCurrentIndex >= this.queue.length) {
      newCurrentIndex = this.queue.length - 1;
    }
    if (newCurrentIndex < 0) {
      newCurrentIndex = 0;
    }
    this.currentIndex = newCurrentIndex;

    return {
      removedCurrent,
      nextSong: this.queue[this.currentIndex] ?? null,
    };
  }

  setShuffle(enabled: boolean): void {
    if (this.shuffleEnabled === enabled) return;
    this.shuffleEnabled = enabled;

    const currentSong = this.getCurrentSong();
    if (enabled) {
      this.shuffleWithCurrent(this.currentIndex);
    } else {
      this.queue = [...this.originalQueue];
      if (this.queue.length === 0) {
        this.currentIndex = -1;
      } else if (currentSong) {
        const idx = this.queue.findIndex((s) => s.id === currentSong.id);
        this.currentIndex = idx !== -1 ? idx : 0;
      } else {
        this.currentIndex = 0;
      }
    }
  }

  private shuffleWithCurrent(keepCurrentIndex: number): void {
    const currentSong =
      (keepCurrentIndex >= 0 && keepCurrentIndex < this.originalQueue.length
        ? this.originalQueue[keepCurrentIndex]
        : null) || this.getCurrentSong();

    const otherSongs: Song[] = [];
    let skippedCurrent = false;
    for (const s of this.originalQueue) {
      if (!skippedCurrent && currentSong && s.id === currentSong.id) {
        skippedCurrent = true;
        continue;
      }
      otherSongs.push(s);
    }

    for (let i = otherSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
    }

    if (currentSong) {
      this.queue = [currentSong, ...otherSongs];
      this.currentIndex = 0;
    } else {
      this.queue = otherSongs;
      this.currentIndex = otherSongs.length > 0 ? 0 : -1;
    }
  }

  setRepeatMode(mode: RepeatMode): void {
    this.repeatMode = mode;
  }

  getRepeatMode(): RepeatMode {
    return this.repeatMode;
  }

  isShuffle(): boolean {
    return this.shuffleEnabled;
  }
}

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
    if (this.shuffleEnabled) {
      this.shuffleWithCurrent(startIndex);
    } else {
      this.queue = [...songs];
      this.currentIndex = Math.max(0, Math.min(startIndex, this.queue.length - 1));
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
        // Find in queue
        const index = this.queue.findIndex(s => s.id === prev.id);
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
    // Add to end of queue
    this.queue.push(song);
    this.originalQueue.push(song);
  }

  playNext(song: Song): void {
    // Insert immediately after current index
    const insertPos = this.currentIndex + 1;
    this.queue.splice(insertPos, 0, song);
    this.originalQueue.push(song);
  }

  removeFromQueue(index: number): void {
    if (index < 0 || index >= this.queue.length) return;
    const removedSong = this.queue[index];
    this.queue.splice(index, 1);
    this.originalQueue = this.originalQueue.filter(s => s.id !== removedSong.id);

    if (index < this.currentIndex) {
      this.currentIndex--;
    } else if (index === this.currentIndex) {
      if (this.currentIndex >= this.queue.length) {
        this.currentIndex = this.queue.length - 1;
      }
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

    const currentSong = this.getCurrentSong();
    const [movedItem] = this.queue.splice(fromIndex, 1);
    this.queue.splice(toIndex, 0, movedItem);

    if (currentSong) {
      this.currentIndex = this.queue.findIndex(s => s.id === currentSong.id);
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

  setShuffle(enabled: boolean): void {
    if (this.shuffleEnabled === enabled) return;
    this.shuffleEnabled = enabled;

    const currentSong = this.getCurrentSong();
    if (enabled) {
      this.shuffleWithCurrent(this.currentIndex);
    } else {
      this.queue = [...this.originalQueue];
      if (currentSong) {
        this.currentIndex = this.queue.findIndex(s => s.id === currentSong.id);
      }
    }
  }

  private shuffleWithCurrent(keepCurrentIndex: number): void {
    const currentSong = this.originalQueue[keepCurrentIndex] || this.getCurrentSong();
    const otherSongs = this.originalQueue.filter(s => s.id !== currentSong?.id);

    // Fisher-Yates shuffle
    for (let i = otherSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]];
    }

    if (currentSong) {
      this.queue = [currentSong, ...otherSongs];
      this.currentIndex = 0;
    } else {
      this.queue = otherSongs;
      this.currentIndex = 0;
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

import { LyricLine } from '../../types';

export class LyricsService {
  /**
   * Parse LRC format string like:
   * [00:12.30]Line of text
   * [01:05.10]Another line
   */
  static parseLRC(lrcText: string): LyricLine[] {
    const lines = lrcText.split('\n');
    const result: LyricLine[] = [];
    const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      let match;
      timeRegex.lastIndex = 0;
      const timestamps: number[] = [];

      while ((match = timeRegex.exec(trimmed)) !== null) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const millis = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
        const totalSeconds = minutes * 60 + seconds + millis / 1000;
        timestamps.push(totalSeconds);
      }

      const text = trimmed.replace(timeRegex, '').trim();
      for (const time of timestamps) {
        result.push({ time, text });
      }
    }

    return result.sort((a, b) => a.time - b.time);
  }

  static getActiveLyricIndex(lyrics: LyricLine[], currentTime: number): number {
    if (!lyrics || lyrics.length === 0) return -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        return i;
      }
    }
    return 0;
  }
}

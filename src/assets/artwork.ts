import featuredCover from './images/sonora_featured_cover_1794856590547.jpg';
import vinylCover from './images/sonora_vinyl_cover_1794856590606.jpg';
import nightCover from './images/sonora_night_cover_1794856590681.jpg';
import retroWallpaper from './images/retro_red_black_wallpaper_1794859414205.jpg';

export const ARTWORK_FEATURED = featuredCover;
export const ARTWORK_VINYL = vinylCover;
export const ARTWORK_NIGHT = nightCover;
export const ARTWORK_SILK = retroWallpaper;
export const RETRO_WALLPAPER = retroWallpaper;

const LEGACY_ARTWORK_MAP: Record<string, string> = {
  '/src/assets/images/sonora_featured_cover_1794856590547.jpg': featuredCover,
  '/src/assets/images/sonora_vinyl_cover_1794856590606.jpg': vinylCover,
  '/src/assets/images/sonora_night_cover_1794856590681.jpg': nightCover,
  '/src/assets/images/retro_red_black_wallpaper_1794859414205.jpg': retroWallpaper,
  '/src/assets/images/retro_analog_mobile_wallpaper_1794858882567.jpg': retroWallpaper,
  '/src/assets/images/mobile_os_purple_wallpaper_1794857469128.jpg': retroWallpaper,
  '/src/assets/images/mobile_os_wallpaper_1794856588390.jpg': retroWallpaper,
};

export function resolveArtworkUrl(url?: string, fallback: string = vinylCover): string {
  if (!url) return fallback;
  return LEGACY_ARTWORK_MAP[url] ?? url;
}

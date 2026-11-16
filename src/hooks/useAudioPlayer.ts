import { useState, useEffect, useCallback } from 'react';
import { AudioService, EQUALIZER_PRESETS } from '../services/audio/AudioService';
import { Song, PlaybackState, RepeatMode, EqualizerBands } from '../types';

export function useAudioPlayer() {
  const audioService = AudioService.getInstance();
  const [state, setState] = useState<PlaybackState>(() => audioService.getState());
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Initial sync
    const currentState = audioService.getState();
    setState(currentState);
    setPosition(currentState.position);
    setDuration(currentState.duration);

    const unsubState = audioService.events.on<PlaybackState>('stateChange', (newState) => {
      setState({ ...newState });
      setPosition(newState.position);
      setDuration(newState.duration);
    });

    const unsubTime = audioService.events.on<{ position: number; duration: number }>('timeupdate', (data) => {
      setPosition(data.position);
      if (data.duration > 0) {
        setDuration(data.duration);
      }
    });

    return () => {
      unsubState();
      unsubTime();
    };
  }, []);

  const playSong = useCallback((song: Song, queueList?: Song[]) => {
    if (queueList && queueList.length > 0) {
      const idx = queueList.findIndex(s => s.id === song.id);
      audioService.setQueueAndPlay(queueList, Math.max(0, idx));
    } else {
      audioService.play(song);
    }
  }, []);

  const togglePlay = useCallback(() => {
    audioService.togglePlay();
  }, []);

  const next = useCallback(() => {
    audioService.next();
  }, []);

  const previous = useCallback(() => {
    audioService.previous();
  }, []);

  const seek = useCallback((seconds: number) => {
    audioService.seek(seconds);
    setPosition(seconds);
  }, []);

  const setVolume = useCallback((vol: number) => {
    audioService.setVolume(vol);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    audioService.setPlaybackRate(rate);
  }, []);

  const toggleShuffle = useCallback(() => {
    audioService.setShuffle(!state.shuffleEnabled);
  }, [state.shuffleEnabled]);

  const cycleRepeatMode = useCallback(() => {
    const modes: RepeatMode[] = ['OFF', 'REPEAT_ALL', 'REPEAT_ONE'];
    const currentIdx = modes.indexOf(state.repeatMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    audioService.setRepeatMode(nextMode);
  }, [state.repeatMode]);

  const addToQueue = useCallback((song: Song) => {
    audioService.addToQueue(song);
  }, []);

  const playNext = useCallback((song: Song) => {
    audioService.playNext(song);
  }, []);

  const setQueue = useCallback((songs: Song[], startIndex = 0) => {
    audioService.setQueue(songs, startIndex);
  }, []);

  const setQueueAndPlay = useCallback((songs: Song[], startIndex = 0) => {
    audioService.setQueueAndPlay(songs, startIndex);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    audioService.removeFromQueue(index);
  }, []);

  const reorderQueue = useCallback((from: number, to: number) => {
    audioService.reorderQueue(from, to);
  }, []);

  const clearQueue = useCallback(() => {
    audioService.clearQueue();
  }, []);

  const handleAudioInterruption = useCallback((action: string) => {
    audioService.handleAudioInterruption(action);
  }, []);

  const triggerInterruption = useCallback((type: 'PHONE_CALL' | 'HEADSET_UNPLUG' | 'AIRPODS_DISCONNECT' | 'ALARM_DUCK') => {
    return audioService.triggerInterruption(type);
  }, []);

  const setEqualizerPreset = useCallback((preset: string) => {
    audioService.setEqualizerPreset(preset);
  }, []);

  const setEqualizerBands = useCallback((bands: EqualizerBands) => {
    audioService.setEqualizerBands(bands);
  }, []);

  return {
    ...state,
    position,
    duration,
    queue: audioService.queue.getQueue(),
    upNext: audioService.queue.getUpNext(),
    playSong,
    setQueue,
    setQueueAndPlay,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    setPlaybackRate,
    toggleShuffle,
    cycleRepeatMode,
    addToQueue,
    playNext,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    handleAudioInterruption,
    triggerInterruption,
    setEqualizerPreset,
    setEqualizerBands,
    getEqualizerBands: () => audioService.getEqualizerBands(),
    getFrequencyData: () => audioService.getFrequencyData(),
    getWaveformData: () => audioService.getWaveformData(),
  };
}

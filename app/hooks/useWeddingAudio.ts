import { useCallback, useEffect, useRef, useState } from 'react';

export type UseWeddingAudioOptions = {
  src: string;
  defaultVolume: number;
};

export function useWeddingAudio({
  src,
  defaultVolume = 0.3,
}: UseWeddingAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const isAvailable = Boolean(src);

  const getAudio = useCallback(() => {
    if (!src) return null;
    if (!audioRef.current) {
      const audio = new Audio(src);
      audio.loop = true;
      audio.preload = 'none';
      audio.volume = defaultVolume;
      audioRef.current = audio;
    }
    return audioRef.current;
  }, [defaultVolume, src]);

  const play = useCallback(async () => {
    const audio = getAudio();
    if (!audio) return false;
    try {
      await audio.play();
      setIsPlaying(true);
      setPlaybackError(false);
      return true;
    } catch {
      setIsPlaying(false);
      setPlaybackError(true);
      return false;
    }
  }, [getAudio]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(
    () => (isPlaying ? (pause(), Promise.resolve(false)) : play()),
    [isPlaying, pause, play],
  );

  useEffect(
    () => () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    },
    [],
  );

  return { isAvailable, isPlaying, playbackError, play, toggle };
}

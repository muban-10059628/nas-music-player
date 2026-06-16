import React, { createContext, useContext, useState, useMemo } from 'react';

interface PlaybackState {
  position: number;
  duration: number;
}

interface PlaybackStateUpdaters {
  setPosition: React.Dispatch<React.SetStateAction<number>>;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
}

const PlaybackStateContext = createContext<PlaybackState>({ position: 0, duration: 0 });
const PlaybackStateUpdatersContext = createContext<PlaybackStateUpdaters | null>(null);

/**
 * 存储高频更新的播放进度状态（position/duration），
 * 避免这些快变状态通过 PlayerContext 传播导致全局重渲染。
 */
export function PlaybackStateProvider({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const stateValue = useMemo(() => ({ position, duration }), [position, duration]);
  const updaterValue = useMemo(() => ({ setPosition, setDuration }), []);

  return (
    <PlaybackStateUpdatersContext.Provider value={updaterValue}>
      <PlaybackStateContext.Provider value={stateValue}>
        {children}
      </PlaybackStateContext.Provider>
    </PlaybackStateUpdatersContext.Provider>
  );
}

/** 在 MiniPlayer / PlayerScreen 中读取当前播放进度 */
export function usePlaybackState(): PlaybackState {
  return useContext(PlaybackStateContext);
}

/** 在 PlayerProvider 内部调用，将进度更新委托到 PlaybackStateContext */
export function usePlaybackStateUpdaters(): PlaybackStateUpdaters {
  const ctx = useContext(PlaybackStateUpdatersContext);
  if (!ctx) {
    throw new Error('usePlaybackStateUpdaters must be used within a PlaybackStateProvider');
  }
  return ctx;
}

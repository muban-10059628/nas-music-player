import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlaybackStateUpdaters } from './PlaybackStateContext';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  streamUrl: string;
}

interface PlayerContextType {
  // 当前播放（排除了高频更新的 position/duration，改用 usePlaybackState()）
  currentSong: Song | null;
  isPlaying: boolean;

  // 播放队列
  queue: Song[];
  queueIndex: number;
  
  // 播放模式
  playMode: 'order' | 'shuffle' | 'repeat';
  
  // 控制方法
  play: (song?: Song) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  setQueue: (songs: Song[], startIndex?: number) => void;
  
  // 播放模式
  setPlayMode: (mode: 'order' | 'shuffle' | 'repeat') => void;
  togglePlayMode: () => void;
  
  // 音量
  volume: number;
  setVolume: (volume: number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueueState] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [playMode, setPlayModeState] = useState<'order' | 'shuffle' | 'repeat'>('order');
  const [volume, setVolumeState] = useState(1.0);

  const soundRef = useRef<Audio.Sound | null>(null);

  // 从 PlaybackStateContext 获取高频更新状态，避免 PlayerContext 全局重渲染
  const { setPosition, setDuration } = usePlaybackStateUpdaters();

  // 使用 ref 存储回调，避免循环依赖
  const stateRef = useRef({
    queue: [] as Song[],
    queueIndex: 0,
    playMode: 'order' as 'order' | 'shuffle' | 'repeat',
    volume: 1.0,
    position: 0,
    sound: soundRef,
    setIsPlaying,
    setPosition,
    setDuration,
    setCurrentSong,
    setQueueIndex,
  });

  // 更新 ref（注意：去掉了 position——它只需在 onPlaybackStatusUpdate 中通过 ref 写入）
  useEffect(() => {
    stateRef.current.queue = queue;
    stateRef.current.queueIndex = queueIndex;
    stateRef.current.playMode = playMode;
    stateRef.current.volume = volume;
  }, [queue, queueIndex, playMode, volume]);

  // 初始化音频
  useEffect(() => {
    const initAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    };
    initAudio();
    
    // 加载保存的音量
    AsyncStorage.getItem('player_volume').then(v => {
      if (v) setVolumeState(parseFloat(v));
    });
    
    // 加载保存的播放模式
    AsyncStorage.getItem('play_mode').then(v => {
      if (v && ['order', 'shuffle', 'repeat'].includes(v)) {
        setPlayModeState(v as 'order' | 'shuffle' | 'repeat');
      }
    });
    
    // 清理函数
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // 播放指定索引的歌曲
  const playSongAtIndex = useCallback(async (index: number) => {
    const { queue: currentQueue, volume: currentVolume } = stateRef.current;
    if (index < 0 || index >= currentQueue.length) return;
    
    const song = currentQueue[index];
    
    // 卸载当前音频
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
    
    // 创建新音频
    const { sound } = await Audio.Sound.createAsync(
      { uri: song.streamUrl },
      { shouldPlay: true, isLooping: false, volume: currentVolume },
      onPlaybackStatusUpdate
    );
    
    soundRef.current = sound;
    stateRef.current.setCurrentSong(song);
    stateRef.current.setQueueIndex(index);
    
    // 添加到最近播放
    fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/recent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId: song.id }),
    }).catch(console.error);
  }, []);

  // 处理歌曲结束
  const handleSongEnd = useCallback(async () => {
    const { queue: currentQueue, queueIndex: currentIndex, playMode: currentMode } = stateRef.current;
    
    if (currentMode === 'repeat') {
      // 单曲循环
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } else if (currentMode === 'shuffle') {
      // 随机播放
      const nextIndex = Math.floor(Math.random() * currentQueue.length);
      stateRef.current.setQueueIndex(nextIndex);
      await playSongAtIndex(nextIndex);
    } else {
      // 顺序播放
      if (currentIndex < currentQueue.length - 1) {
        stateRef.current.setQueueIndex(currentIndex + 1);
        await playSongAtIndex(currentIndex + 1);
      } else {
        // 播放结束
        stateRef.current.setIsPlaying(false);
      }
    }
  }, [playSongAtIndex]);

  // 状态更新回调
  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    
    stateRef.current.setIsPlaying(status.isPlaying);
    stateRef.current.setPosition(status.positionMillis);
    stateRef.current.setDuration(status.durationMillis || 0);
    
    // 播放完成
    if (status.didJustFinish) {
      handleSongEnd();
    }
  }, [handleSongEnd]);

  // 播放歌曲
  const play = useCallback(async (song?: Song) => {
    if (song) {
      // 先同步 ref 再调用 playSongAtIndex，避免 React state batch 延迟导致读不到新队列
      const newQueue = [song];
      stateRef.current.queue = newQueue;
      stateRef.current.queueIndex = 0;
      setQueueState(newQueue);
      setQueueIndex(0);
      await playSongAtIndex(0);
    } else if (queue.length > 0) {
      await playSongAtIndex(queueIndex);
    }
  }, [playSongAtIndex, queue, queueIndex]);

  // 暂停
  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
  }, []);

  // 继续播放
  const resume = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
    }
  }, []);

  // 切换播放/暂停
  const togglePlayPause = useCallback(async () => {
    const { queue: currentQueue, queueIndex: currentIndex } = stateRef.current;
    
    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } else if (currentQueue.length > 0) {
      await playSongAtIndex(currentIndex);
    }
  }, [playSongAtIndex]);

  // 下一首
  const next = useCallback(async () => {
    const { queue: currentQueue, queueIndex: currentIndex, playMode: currentMode } = stateRef.current;
    
    if (currentMode === 'shuffle') {
      const nextIndex = Math.floor(Math.random() * currentQueue.length);
      stateRef.current.setQueueIndex(nextIndex);
      await playSongAtIndex(nextIndex);
    } else {
      const nextIndex = (currentIndex + 1) % currentQueue.length;
      stateRef.current.setQueueIndex(nextIndex);
      await playSongAtIndex(nextIndex);
    }
  }, [playSongAtIndex]);

  // 上一首
  const previous = useCallback(async () => {
    const { queueIndex: currentIndex, queue: currentQueue } = stateRef.current;

    // 从 audio 实例读取真实位置，判断是否超过 3 秒
    let currentPos = 0;
    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        currentPos = status.positionMillis;
      }
    }

    if (currentPos > 3000) {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
      }
    } else {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentQueue.length - 1;
      stateRef.current.setQueueIndex(prevIndex);
      await playSongAtIndex(prevIndex);
    }
  }, [playSongAtIndex]);

  // 跳转
  const seek = useCallback(async (pos: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(pos);
    }
  }, []);

  // 设置队列
  const setQueue = useCallback((songs: Song[], startIndex: number = 0) => {
    // 先同步 ref 再播放，避免 React state batch 延迟
    stateRef.current.queue = songs;
    stateRef.current.queueIndex = startIndex;
    setQueueState(songs);
    setQueueIndex(startIndex);
    if (songs.length > 0) {
      playSongAtIndex(startIndex);
    }
  }, [playSongAtIndex]);

  // 设置播放模式
  const setPlayMode = useCallback((mode: 'order' | 'shuffle' | 'repeat') => {
    setPlayModeState(mode);
    AsyncStorage.setItem('play_mode', mode);
  }, []);

  // 切换播放模式
  const togglePlayMode = useCallback(() => {
    const modes: ('order' | 'shuffle' | 'repeat')[] = ['order', 'shuffle', 'repeat'];
    const currentIndex = modes.indexOf(playMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setPlayMode(nextMode);
  }, [playMode, setPlayMode]);

  // 设置音量
  const setVolume = useCallback(async (vol: number) => {
    setVolumeState(vol);
    if (soundRef.current) {
      await soundRef.current.setVolumeAsync(vol);
    }
    AsyncStorage.setItem('player_volume', vol.toString());

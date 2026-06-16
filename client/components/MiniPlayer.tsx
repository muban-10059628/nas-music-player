import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { usePlayer } from '@/contexts/PlayerContext';
import { usePlaybackState } from '@/contexts/PlaybackStateContext';

// 霓虹科技风颜色常量
const CYBER = {
  primary: '#00F0FF',
  secondary: '#BF00FF',
  danger: '#FF003C',
  success: '#00FF88',
  bg: '#0A0A0F',
  card: '#12121A',
  border: 'rgba(0, 240, 255, 0.15)',
  text: '#EAEAEA',
  muted: '#555570',
};

interface MiniPlayerProps {
  onPress?: () => void;
}

export default function MiniPlayer({ onPress }: MiniPlayerProps) {
  const router = useSafeRouter();
  const { currentSong, isPlaying, togglePlayPause, next, previous } = usePlayer();
  const { position, duration } = usePlaybackState();
  const panRef = useRef(0);

  if (!currentSong) return null;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/player');
    }
  };

  const progress = duration > 0 ? position / duration : 0;

  // 滑动切歌
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gs) => { panRef.current = gs.dx; },
    onPanResponderRelease: (_, gs) => {
      if (gs.dx < -60) next();
      else if (gs.dx > 60) previous();
    },
  })).current;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
      {...panResponder.panHandlers}
    >
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      <LinearGradient
        colors={['rgba(18, 18, 26, 0.98)', 'rgba(10, 10, 15, 0.99)']}
        style={styles.content}
      >
        {/* Album Cover */}
        <Image source={{ uri: currentSong.coverUrl }} style={styles.cover} />

        {/* Song Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentSong.artist}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={togglePlayPause}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color={CYBER.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => router.push('/queue')}
          >
            <Ionicons name="list" size={22} color={CYBER.muted} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: CYBER.border,
    shadowColor: CYBER.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  progressContainer: {
    height: 2,
    backgroundColor: CYBER.card,
  },
  progressBar: {
    height: '100%',
    backgroundColor: CYBER.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cov
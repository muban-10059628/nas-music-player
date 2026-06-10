import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { usePlayer } from '@/contexts/PlayerContext';
import { Screen } from '@/components/Screen';
import { useState } from 'react';

const { width } = Dimensions.get('window');
const CYBER = {
  primary: '#00F0FF',
  secondary: '#BF00FF',
  success: '#00FF88',
  bg: '#0A0A0F',
  card: '#12121A',
  border: 'rgba(0, 240, 255, 0.15)',
  text: '#EAEAEA',
  muted: '#555570',
};

const PLAY_MODE_ICONS = {
  order: 'repeat',
  shuffle: 'shuffle',
  repeat: 'repeat',
};

export default function PlayerScreen() {
  const router = useSafeRouter();
  const {
    currentSong,
    isPlaying,
    position,
    duration,
    playMode,
    volume,
    togglePlayPause,
    next,
    previous,
    seek,
    togglePlayMode,
    setVolume,
  } = usePlayer();
  
  const [showVolume, setShowVolume] = useState(false);

  if (!currentSong) {
    return (
      <Screen>
        <View style={styles.container}>
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={64} color={CYBER.muted} />
            <Text style={styles.emptyText}>暂无播放内容</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>返回</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

  const progress = duration > 0 ? position / duration : 0;
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: any) => {
    const { locationX } = e.nativeEvent;
    const progressBarWidth = width - 48;
    const newPosition = (locationX / progressBarWidth) * duration;
    seek(newPosition);
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* Background */}
        <Image
          source={{ uri: currentSong.coverUrl }}
          style={styles.backgroundImage}
          blurRadius={30}
        />
        <LinearGradient
          colors={['rgba(10, 10, 15, 0.7)', CYBER.bg]}
          style={styles.gradient}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="chevron-down" size={28} color={CYBER.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>正在播放</Text>
            <Text style={styles.headerSubtitle}>{currentSong.album}</Text>
          </View>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowVolume(!showVolume)}
          >
            <Ionicons name="volume-high" size={24} color={CYBER.text} />
          </TouchableOpacity>
        </View>

        {/* Album Cover */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: currentSong.coverUrl }}
            style={[styles.cover, isPlaying && styles.coverPlaying]}
          />
        </View>

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>{currentSong.title}</Text>
          <Text style={styles.songArtist} numberOfLines={1}>{currentSong.artist}</Text>
        </View>

        {/* Progress Bar */}
        <TouchableOpacity 
          style={styles.progressContainer}
          onPress={handleSeek}
          activeOpacity={1}
        >
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </TouchableOpacity>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={togglePlayMode}>
            <Ionicons 
              name={PLAY_MODE_ICONS[playMode] as any} 
              size={24} 
              color={playMode === 'repeat' ? CYBER.primary : CYBER.muted} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={previous}>
            <Ionicons name="play-skip-back" size={36} color={CYBER.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={togglePlayPause}
          >
            <LinearGradient
              colors={[CYBER.primary, CYBER.secondary]}
              style={styles.playGradient}
            >
              <Ionicons 
                name={isPlaying ? 'pause' : 'play'} 
                size={36} 
                color={CYBER.bg} 
              />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={next}>
            <Ionicons name="play-skip-forward" size={36} color={CYBER.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="heart-outline" size={24} color={CYBER.muted} />
          </TouchableOpacity>
        </View>

        {/* Volume Slider */}
        {showVolume && (
          <View style={styles.volumeContainer}>
            <Ionicons name="volume-low" size={20} color={CYBER.muted} />
            <View style={styles.volumeSlider}>
              <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
            </View>
            <Ionicons name="volume-high" size={20} color={CYBER.muted} />
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CYBER.bg,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  emptyText: {
    fontSize: 18,
    color: CYBER.muted,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: CYBER.primary,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: CYBER.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: CYBER.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 14,
    color: CYBER.text,
    marginTop: 2,
  },
  coverContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  cover: {
    width: width - 80,
    height: width - 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: CYBER.border,
  },
  coverPlaying: {
    borderColor: CYBER.primary,
    shadowColor: CYBER.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  songInfo: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  songTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: CYBER.text,
    textAlign: 'center',
  },
  songArtist: {
    fontSize: 16,
    color: CYBER.muted,
    marginTop: 6,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: CYBER.card,
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: CYBER.primary,
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: CYBER.primary,
    marginLeft: -8,
    shadowColor: CYBER.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: {
    fontSize: 12,
    color: CYBER.muted,
    fontFamily: 'monospace',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
  },
  playGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CYBER.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
    marginTop: 32,
  },
  volumeSlider: {
    flex: 1,
    height: 4,
    backgroundColor: CYBER.card,
    borderRadius: 2,
  },
  volumeFill: {
    height: '100%',
    backgroundColor: CYBER.primary,
    borderRadius: 2,
  },
});

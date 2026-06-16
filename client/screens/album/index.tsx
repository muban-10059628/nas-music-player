import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { usePlayer } from '@/contexts/PlayerContext';
import { Screen } from '@/components/Screen';
import MiniPlayer from '@/components/MiniPlayer';
import { useState, useEffect } from 'react';

const { width } = Dimensions.get('window');
const CYBER = {
  primary: '#00F0FF',
  secondary: '#BF00FF',
  bg: '#0A0A0F',
  card: '#12121A',
  border: 'rgba(0, 240, 255, 0.15)',
  text: '#EAEAEA',
  muted: '#555570',
};

interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverUrl: string;
  songCount: number;
  songs: Song[];
}

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  streamUrl: string;
}

export default function AlbumScreen() {
  const router = useSafeRouter();
  const { id } = useSafeSearchParams<{ id: string }>();
  const { setQueue } = usePlayer();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAlbum();
    }
  }, [id]);

  const fetchAlbum = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/albums/${id}`);
      const data = await res.json();
      setAlbum(data);
    } catch (err) {
      console.error('Failed to fetch album:', err);
    }
    setLoading(false);
  };

  const handlePlayAll = () => {
    if (album?.songs.length) {
      setQueue(album.songs, 0);
    }
  };

  const handleShuffle = () => {
    if (album?.songs.length) {
      const shuffled = [...album.songs].sort(() => Math.random() - 0.5);
      setQueue(shuffled, 0);
    }
  };

  const handleSongPress = (song: Song, index: number) => {
    if (album?.songs) {
      setQueue(album.songs, index);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </Screen>
    );
  }

  if (!album) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>专辑不存在</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        {/* Background */}
        <Image source={{ uri: album.coverUrl }} style={styles.backgroundImage} blurRadius={8} />
        <LinearGradient colors={['rgba(10, 10, 15, 0.5)', CYBER.bg]} style={styles.gradient} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={CYBER.text} />
          </TouchableOpacity>
        </View>

        {/* Album Info */}
        <View style={styles.albumInfo}>
          <Image source={{ uri: album.coverUrl }} style={styles.cover} />
          <Text style={styles.albumTitle}>{album.title}</Text>
          <Text style={styles.albumArtist}>{album.artist}</Text>
          <Text style={styles.albumMeta}>{album.year} · {album.songCount} 首歌曲</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
            <Ionicons name="shuffle" size={20} color={CYBER.primary} />
            <Text style={styles.shuffleText}>随机播放</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.playAllButton} onPress={handlePlayAll}>
            <LinearGradient
              colors={[CYBER.primary, CYBER.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.playAllGradient}
            >
              <Ionicons name="play" size={20} color={CYBER.bg} />
              <Text style={styles.playAllText}>播放全部</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Songs List */}
        <FlatList
          data={album.songs}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.songItem}
              onPress={() => handleSongPress(item, index)}
            >
              <Text style={styles.songIndex}>{index + 1}</Text>
              <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>
              </View>
              <Ionicons name="play-circle-outline" size={24} color={CYBER.muted} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.songsList}
          showsVerticalScrollIndicator={false}
        />

        <MiniPlayer />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CYBER.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: CYBER.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: CYBER.muted,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: CYBER.primary,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: CYBER.bg,
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderRadius: 22,
  },
  albumInfo: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
  },
  cover: {
    width: width - 120,
    height: width - 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: CYBER.border,
    marginBottom: 20,
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: CYBER.text,
    textAlign: 'center',
  },
  albumArtist: {
    fontSize: 16,
    color: CYBER.primary,
    marginTop: 6,
  },
  albumMeta: {
    fontSize: 13,
    color: CYBER.muted,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CYBER.primary,
    backgroundColor: 'transparent',
  },
  shuffleText: {
    fontSize: 14,
    fontWeight: '600',
    color: CYBER.primary,
  },
  playAllButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  playAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  playAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: CYBER.bg,
  },
  songsList: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: CYBER.border,
    gap: 12,
  },
  songIndex: {
    width: 24,
    fontSize: 14,
    color: CYBER.muted,
    textAlign: 'center',
  },
  songInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  songTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: CYBER.text,
    flex: 1,
  },
  songDuration: {
    fontSize: 12,
    color: CYBER.muted,
    marginLeft: 12,
    fontFamily: 'monospace',
  },
});
       
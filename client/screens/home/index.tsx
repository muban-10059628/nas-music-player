import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { usePlayer } from '@/contexts/PlayerContext';
import { Screen } from '@/components/Screen';
import MiniPlayer from '@/components/MiniPlayer';
import { useState, useEffect } from 'react';

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

interface RecentItem {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  playedAt: number;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverUrl: string;
}

export default function HomeScreen() {
  const router = useSafeRouter();
  const { currentSong, isPlaying, play, togglePlayPause } = usePlayer();
  const [recentPlays, setRecentPlays] = useState<RecentItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    fetchRecentPlays();
    fetchAlbums();
  }, []);

  const fetchRecentPlays = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/recent`);
      const data = await res.json();
      setRecentPlays(data);
    } catch (err) {
      console.error('Failed to fetch recent plays:', err);
    }
  };

  const fetchAlbums = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/albums`);
      const data = await res.json();
      setAlbums(data.slice(0, 6));
    } catch (err) {
      console.error('Failed to fetch albums:', err);
    }
  };

  const handlePlayAll = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/songs`);
      const songs = await res.json();
      if (songs.length > 0) {
        play(songs[0]);
      }
    } catch (err) {
      console.error('Failed to play all:', err);
    }
  };

  const handleAlbumPress = (album: Album) => {
    router.push('/album', { id: album.id });
  };

  const renderRecentItem = ({ item }: { item: RecentItem }) => (
    <TouchableOpacity 
      style={styles.recentItem}
      onPress={() => play(item as any)}
    >
      <Image source={{ uri: item.coverUrl }} style={styles.recentCover} />
      <View style={styles.recentInfo}>
        <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderAlbum = ({ item }: { item: Album }) => (
    <TouchableOpacity 
      style={styles.albumCard}
      onPress={() => handleAlbumPress(item)}
    >
      <Image source={{ uri: item.coverUrl }} style={styles.albumCover} />
      <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.albumArtist} numberOfLines={1}>{item.artist}</Text>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.container}>
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {/* Header */}
              <LinearGradient
                colors={[CYBER.card, CYBER.bg]}
                style={styles.header}
              >
                <Text style={styles.logo}>NAS</Text>
                <Text style={styles.title}>音乐播放器</Text>
                <Text style={styles.subtitle}>连接 NAS · 畅享音乐</Text>
              </LinearGradient>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
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

              {/* Recent Plays */}
              {recentPlays.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>最近播放</Text>
                  <FlatList
                    horizontal
                    data={recentPlays}
                    renderItem={renderRecentItem}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recentList}
                  />
                </View>
              )}

              {/* Featured Albums */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>推荐专辑</Text>
                <FlatList
                  horizontal
                  data={albums}
                  renderItem={renderAlbum}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.albumsList}
                />
              </View>
            </>
          }
          contentContainerStyle={styles.listContent}
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
  listContent: {
    paddingBottom: 120,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  logo: {
    fontSize: 14,
    fontWeight: '700',
    color: CYBER.primary,
    letterSpacing: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: CYBER.text,
  },
  subtitle: {
    fontSize: 14,
    color: CYBER.muted,
    marginTop: 4,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  playAllButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  playAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  playAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: CYBER.bg,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CYBER.text,
    marginBottom: 16,
    paddingHorizontal: 20,
    letterSpacing: 0.5,
  },
  recentList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  recentItem: {
    width: 140,
    alignItems: 'center',
  },
  recentCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CYBER.border,
    marginBottom: 8,
  },
  recentInfo: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: CYBER.text,
    textAlign: 'center',
  },
  recentArtist: {
    fontSize: 11,
    color: CYBER.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  albumsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  albumCard: {
    width: 140,
  },
  albumCover: {
    width: 140,
    height: 140,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CYBER.border,
    marginBottom: 8,
  },
  albumTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: CYBER.text,
  },
  albumArtist: {
    fontSize: 11,
    color: CYBER.muted,
    marginTop: 2,
  },
});

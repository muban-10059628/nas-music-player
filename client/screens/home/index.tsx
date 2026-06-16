import { View, Text, Image, TouchableOpacity, FlatList, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { usePlayer } from '@/contexts/PlayerContext';
import { Screen } from '@/components/Screen';
import MiniPlayer from '@/components/MiniPlayer';
import { useState, useEffect, memo, useCallback } from 'react';

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
  const { play, setQueue } = usePlayer();
  const [recentPlays, setRecentPlays] = useState<RecentItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [randomSongs, setRandomSongs] = useState<RecentItem[]>([]);

  useEffect(() => {
    fetchRecentPlays();
    fetchAlbums();
    fetchRandomSongs();
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
      setAlbums(data.slice(0, 8));
    } catch (err) {
      console.error('Failed to fetch albums:', err);
    }
  };

  const fetchRandomSongs = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/songs`);
      const data = await res.json();
      // 随机取
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setRandomSongs(shuffled.slice(0, 10).map((s: any) => ({
        id: s.id, title: s.title, artist: s.artist, coverUrl: s.coverUrl, playedAt: 0,
      })));
    } catch (err) {
      console.error('Failed to fetch random songs:', err);
    }
  };

  const handlePlayAll = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/songs`);
      const songs = await res.json();
      if (songs.length > 0) {
        const shuffled = [...songs].sort(() => Math.random() - 0.5);
        setQueue(shuffled, 0);
      }
    } catch (err) {
      console.error('Failed to play all:', err);
    }
  };

  const handleAlbumPress = useCallback((album: Album) => {
    router.push('/album', { id: album.id });
  }, [router]);

  const handlePlaySong = useCallback((item: RecentItem) => {
    play(item as any);
  }, [play]);

  const handlePlayRandom = useCallback(() => {
    if (randomSongs.length > 0) {
      const songs = [...randomSongs].sort(() => Math.random() - 0.5);
      play(songs[0] as any);
    }
  }, [randomSongs, play]);

  // 使用 memo 化的列表项组件，避免每次滚动重新创建函数
  const RecentItem = memo(({ item, onPress }: { item: RecentItem; onPress: (item: RecentItem) => void }) => (
    <TouchableOpacity style={styles.recentItem} onPress={() => onPress(item)}>
      <Image source={{ uri: item.coverUrl }} style={styles.recentCover} />
      <View style={styles.recentInfo}>
        <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  ));

  const AlbumItem = memo(({ item, onPress }: { item: Album; onPress: (item: Album) => void }) => (
    <TouchableOpacity style={styles.albumCard} onPress={() => onPress(item)}>
      <Image source={{ uri: item.coverUrl }} style={styles.albumCover} />
      <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.albumArtist} numberOfLines={1}>{item.artist}</Text>
    </TouchableOpacity>
  ));

  const renderRecentItem = useCallback(({ item }: { item: RecentItem }) => (
    <RecentItem item={item} onPress={handlePlaySong} />
  ), [handlePlaySong]);

  const renderAlbum = useCallback(({ item }: { item: Album }) => (
    <AlbumItem item={item} onPress={handleAlbumPress} />
  ), [handleAlbumPress]);

  return (
    <Screen>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
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
                <Text style={styles.playAllText}>随机播放全部</Text>
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

          {/* Random Songs */}
          {randomSongs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>随机推荐</Text>
              <FlatList
                horizontal
                data={randomSongs}
                renderItem={renderRecentItem}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentList}
              />
            </View>
          )}

          {/* Featured Albums */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>专辑推荐</Text>
            <FlatList
              horizontal
              data={albums}
              renderItem={renderAlbum}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumsList}
            />
          </View>
        </ScrollView>

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
    fontSize: 2
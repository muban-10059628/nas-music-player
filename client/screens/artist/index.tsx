import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { usePlayer } from '@/contexts/PlayerContext';
import { Screen } from '@/components/Screen';
import MiniPlayer from '@/components/MiniPlayer';
import { useState, useEffect } from 'react';

const CYBER = {
  primary: '#00F0FF',
  secondary: '#BF00FF',
  bg: '#0A0A0F',
  card: '#12121A',
  border: 'rgba(0, 240, 255, 0.15)',
  text: '#EAEAEA',
  muted: '#555570',
};

interface Artist {
  id: string;
  name: string;
  albumCount: number;
  songCount: number;
  albums: Album[];
  songs: Song[];
}

interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverUrl: string;
  songCount: number;
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

export default function ArtistScreen() {
  const router = useSafeRouter();
  const { id } = useSafeSearchParams<{ id: string }>();
  const { setQueue } = usePlayer();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchArtist();
    }
  }, [id]);

  const fetchArtist = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/artists/${id}`);
      const data = await res.json();
      setArtist(data);
    } catch (err) {
      console.error('Failed to fetch artist:', err);
    }
    setLoading(false);
  };

  const handlePlayAll = () => {
    if (artist?.songs.length) {
      setQueue(artist.songs, 0);
    }
  };

  const handleSongPress = (song: Song, index: number) => {
    if (artist?.songs) {
      setQueue(artist.songs, index);
    }
  };

  const handleAlbumPress = (album: Album) => {
    router.push('/album', { id: album.id });
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

  if (!artist) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>艺术家不存在</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity style={styles.albumItem} onPress={() => handleAlbumPress(item)}>
      <Image source={{ uri: item.coverUrl }} style={styles.albumCover} />
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.albumYear}>{item.year}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={CYBER.muted} />
    </TouchableOpacity>
  );

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handleSongPress(item, index)}
    >
      <View style={styles.songIndex}>
        <Ionicons name="musical-note" size={16} color={CYBER.muted} />
      </View>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songAlbum} numberOfLines={1}>{item.album}</Text>
      </View>
      <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={CYBER.text} />
          </TouchableOpacity>
        </View>

        {/* Artist Info */}
        <View style={styles.artistInfo}>
          <View style={styles.artistAvatar}>
            <Text style={styles.artistInitial}>{artist.name.charAt(0)}</Text>
          </View>
          <Text style={styles.artistName}>{artist.name}</Text>
          <Text style={styles.artistMeta}>
            {artist.albumCount} 张专辑 · {artist.songCount} 首歌曲
          </Text>
        </View>

        {/* Play All Button */}
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

        {/* Albums Section */}
        {artist.albums.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>专辑</Text>
            <FlatList
              horizontal
              data={artist.albums}
              renderItem={renderAlbumItem}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.albumsList}
            />
          </View>
        )}

        {/* Songs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>热门歌曲</Text>
          <FlatList
            data={artist.songs}
            renderItem={renderSongItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.songsList}
            showsVerticalScrollIndicator={false}
          />
        </View>

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
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
    borderRadius: 22,
  },
  artistInfo: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
  },
  artistAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: CYBER.card,
    borderWidth: 2,
    borderColor: CYBER.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  artistInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: CYBER.primary,
  },
  artistName: {
    fontSize: 26,
    fontWeight: '700',
    color: CYBER.text,
    textAlign: 'center',
  },
  artistMeta: {
    fontSize: 14,
    color: CYBER.muted,
    marginTop: 6,
  },
  playAllButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  playAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  playAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: CYBER.bg,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CYBER.text,
    marginBottom: 16,
    paddingHorizontal: 24,
    letterSpacing: 0.5,
  },
  albumsList: {
    paddingHorizontal: 24,
    gap: 14,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 200,
    backgroundColor: CYBER.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CYBER.border,
    padding: 10,
    gap: 12,
  },
  albumCover: {
    width: 56,
    height: 56,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: CYBER.border,
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: CYBER.text,
  },
  albumYear: {
    fontSize: 12,
    color: CYBER.muted,
    marginTop: 4,
  },
  songsList: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CYBER.border,
    gap: 12,
  },
  songIndex: {
    width: 28,
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: CYBER.text,
  },
  songAlbum: {
    fontSize: 12,
    color: CYBER.muted,
    marginTop: 2,
  },
  songDuration: {
    fontSize: 12,
    color: CYBER.muted,
    fontFamily: 'monospace',
  },
});

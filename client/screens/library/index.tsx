import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { usePlayer } from '@/contexts/PlayerContext';
import { Screen } from '@/components/Screen';
import MiniPlayer from '@/components/MiniPlayer';
import { useState, useEffect, useCallback } from 'react';

const CYBER = {
  primary: '#00F0FF',
  secondary: '#BF00FF',
  bg: '#0A0A0F',
  card: '#12121A',
  border: 'rgba(0, 240, 255, 0.15)',
  text: '#EAEAEA',
  muted: '#555570',
};

type TabType = 'albums' | 'artists' | 'songs';

interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  coverUrl: string;
  songCount: number;
}

interface Artist {
  id: string;
  name: string;
  albumCount: number;
  songCount: number;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
}

export default function LibraryScreen() {
  const router = useSafeRouter();
  const { play } = usePlayer();
  const [activeTab, setActiveTab] = useState<TabType>('albums');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'albums') {
        const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/albums`);
        setAlbums(await res.json());
      } else if (activeTab === 'artists') {
        const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/artists`);
        setArtists(await res.json());
      } else {
        const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/songs`);
        const data = await res.json();
        setSongs(data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const handleShuffleAll = useCallback(() => {
    const all = activeTab === 'songs' ? songs : [];
    if (all.length > 0) {
      const shuffled = [...all].sort(() => Math.random() - 0.5);
      play(shuffled[0] as any);
    }
  }, [activeTab, songs, play]);

  const handleAlbumPress = (album: Album) => {
    router.push('/album', { id: album.id });
  };

  const handleArtistPress = (artist: Artist) => {
    router.push('/artist', { id: artist.id });
  };

  const handleSongPress = useCallback((song: Song) => {
    play(song as any);
  }, [play]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity style={styles.albumItem} onPress={() => handleAlbumPress(item)}>
      <Image source={{ uri: item.coverUrl }} style={styles.albumCover} />
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.albumArtist} numberOfLines={1}>{item.artist}</Text>
        <Text style={styles.albumMeta}>{item.year} · {item.songCount} 首</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={CYBER.muted} />
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity style={styles.artistItem} onPress={() => handleArtistPress(item)}>
      <View style={styles.artistAvatar}>
        <Text style={styles.artistInitial}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.artistInfo}>
        <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.artistMeta}>{item.albumCount} 张专辑 · {item.songCount} 首歌曲</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={CYBER.muted} />
    </TouchableOpacity>
  );

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity style={styles.songItem} onPress={() => handleSongPress(item)}>
      <View style={styles.songIndex}>
        <Text style={styles.songIndexText}>{index + 1}</Text>
      </View>
      <Image source={{ uri: item.coverUrl }} style={styles.songCover} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
      <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>
    </TouchableOpacity>
  );

  const tabs: { key: TabType; label: string }[] = [
    { key: 'albums', label: '专辑' },
    { key: 'artists', label: '艺术家' },
    { key: 'songs', label: '歌曲' },
  ];

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>音乐库</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <View style={styles.tabContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {activeTab === 'songs' && songs.length > 0 && (
            <TouchableOpacity style={styles.shuffleBtn} onPress={handleShuffleAll}>
              <Ionicons name="shuffle" size={20} color={CYBER.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {activeTab === 'albums' && (
          <FlatList
            data={albums}
            renderItem={renderAlbumItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
        {activeTab === 'artists' && (
          <FlatList
            data={artists}
            renderItem={renderArtistItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
        {activeTab === 'songs' && (
          <FlatList
            data={songs}
            renderItem={renderSongItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: CYBER.text,
    letterSpacing: 0.5,
  },
  tabRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16, gap: 8,
  },
  tabContainer: {
    flexDirection: 'row', flex: 1, gap: 8,
  },
  shuffleBtn: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: CYBER.card, borderWidth: 1, borderColor: CYBER.border,
    alignItems: 'center', justifyContent: 'center',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: CYBER.card,
    borderWidth: 1,
    borderColor: CYBER.border,
  },
  tabActive: {
    backgroundColor: CYBER.primary,
    borderColor: CYBER.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: CYBER.muted,
  },
  tabTextActive: {
    color: CYBER.bg,
  },
  listContent: {
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CYBER.border,
  },
  albumCover: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: CYBER.border,
  },
  albumInfo: {
    flex: 1,
    marginLeft: 12,
  },
  albumTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: CYBER.text,
  },
  albumArtist: {
    fontSize: 13,
    color: CYBER.muted,
    marginTop: 2,
  },
  albumMeta: {
    fontSize: 11,
    color: CYBER.muted,
    marginTop: 2,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CYBER.border,
  },
  artistAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: CYBER.card,
    borderWidth: 1,
    borderColor: CYBER.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: CYBER.primary,
  },
  artistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  
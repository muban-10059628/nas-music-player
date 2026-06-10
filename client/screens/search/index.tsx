import { View, Text, Image, TouchableOpacity, FlatList, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
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

interface SearchResult {
  artists: any[];
  albums: any[];
  songs: any[];
}

export default function SearchScreen() {
  const router = useSafeRouter();
  const { play } = usePlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ artists: [], albums: [], songs: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      search();
    } else {
      setResults({ artists: [], albums: [], songs: [] });
    }
  }, [query]);

  const search = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    }
    setLoading(false);
  };

  const handleAlbumPress = (album: any) => {
    router.push('/album', { id: album.id });
  };

  const handleArtistPress = (artist: any) => {
    router.push('/artist', { id: artist.id });
  };

  const handleSongPress = (song: any, index: number) => {
    play(song as any);
  };

  const hasResults = results.artists.length > 0 || results.albums.length > 0 || results.songs.length > 0;

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>搜索</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={CYBER.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索歌曲、专辑、艺术家..."
            placeholderTextColor={CYBER.muted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={CYBER.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Results */}
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>搜索中...</Text>
          </View>
        ) : !hasResults && query.length >= 2 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={CYBER.muted} />
            <Text style={styles.emptyText}>未找到相关结果</Text>
          </View>
        ) : query.length < 2 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={48} color={CYBER.muted} />
            <Text style={styles.emptyText}>输入关键词开始搜索</Text>
          </View>
        ) : (
          <FlatList
            data={[]}
            renderItem={null}
            ListHeaderComponent={
              <>
                {/* Albums */}
                {results.albums.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>专辑</Text>
                    {results.albums.map((album) => (
                      <TouchableOpacity
                        key={album.id}
                        style={styles.albumItem}
                        onPress={() => handleAlbumPress(album)}
                      >
                        <Image source={{ uri: album.coverUrl }} style={styles.albumCover} />
                        <View style={styles.albumInfo}>
                          <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
                          <Text style={styles.albumArtist}>{album.artist} · {album.year}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Artists */}
                {results.artists.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>艺术家</Text>
                    {results.artists.map((artist) => (
                      <TouchableOpacity
                        key={artist.id}
                        style={styles.artistItem}
                        onPress={() => handleArtistPress(artist)}
                      >
                        <View style={styles.artistAvatar}>
                          <Text style={styles.artistInitial}>{artist.name.charAt(0)}</Text>
                        </View>
                        <Text style={styles.artistName} numberOfLines={1}>{artist.name}</Text>
                        <Ionicons name="chevron-forward" size={18} color={CYBER.muted} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Songs */}
                {results.songs.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>歌曲</Text>
                    {results.songs.map((song, index) => (
                      <TouchableOpacity
                        key={song.id}
                        style={styles.songItem}
                        onPress={() => handleSongPress(song, index)}
                      >
                        <Image source={{ uri: song.coverUrl }} style={styles.songCover} />
                        <View style={styles.songInfo}>
                          <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                          <Text style={styles.songArtist} numberOfLines={1}>
                            {song.artist} · {song.album}
                          </Text>
                        </View>
                        <Ionicons name="play" size={20} color={CYBER.primary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            }
            contentContainerStyle={styles.listContent}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CYBER.card,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CYBER.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: CYBER.text,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: CYBER.muted,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CYBER.text,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: CYBER.border,
  },
  albumCover: {
    width: 50,
    height: 50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: CYBER.border,
  },
  albumInfo: {
    flex: 1,
    marginLeft: 12,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: CYBER.text,
  },
  albumArtist: {
    fontSize: 12,
    color: CYBER.muted,
    marginTop: 2,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: CYBER.border,
    gap: 12,
  },
  artistAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: CYBER.card,
    borderWidth: 1,
    borderColor: CYBER.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: CYBER.primary,
  },
  artistName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: CYBER.text,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: CYBER.border,
    gap: 12,
  },
  songCover: {
    width: 44,
    height: 44,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: CYBER.border,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: CYBER.text,
  },
  songArtist: {
    fontSize: 12,
    color: CYBER.muted,
    marginTop: 2,
  },
});

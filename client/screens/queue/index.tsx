import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { usePlayer } from '@/contexts/PlayerContext';
import { Screen } from '@/components/Screen';
import { useCallback } from 'react';

const CYBER = {
  primary: '#00F0FF',
  secondary: '#BF00FF',
  danger: '#FF003C',
  bg: '#0A0A0F',
  card: '#12121A',
  border: 'rgba(0, 240, 255, 0.15)',
  text: '#EAEAEA',
  muted: '#555570',
};

export default function QueueScreen() {
  const router = useSafeRouter();
  const { currentSong, queue, queueIndex, setQueue } = usePlayer();

  const handleRemove = useCallback((index: number) => {
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    if (newQueue.length === 0) {
      setQueue([], 0);
      router.back();
      return;
    }
    let newIndex = queueIndex;
    if (index < queueIndex) newIndex--;
    if (index === queueIndex) {
      if (index >= newQueue.length) newIndex = 0;
    }
    setQueue(newQueue, newIndex);
  }, [queue, queueIndex, setQueue, router]);

  const handlePlay = useCallback((index: number) => {
    setQueue(queue, index);
  }, [queue, setQueue]);

  const handleClear = useCallback(() => {
    setQueue([], 0);
    router.back();
  }, [setQueue, router]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-down" size={28} color={CYBER.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>播放队列</Text>
          <TouchableOpacity style={styles.headerBtn} onPress={handleClear}>
            <Text style={styles.clearText}>清空</Text>
          </TouchableOpacity>
        </View>

        {queue.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={48} color={CYBER.muted} />
            <Text style={styles.emptyText}>队列为空</Text>
          </View>
        ) : (
          <FlatList
            data={queue}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.item, index === queueIndex && styles.itemActive]}
                onPress={() => handlePlay(index)}
              >
                {index === queueIndex && (
                  <View style={styles.playingIndicator}>
                    <Ionicons name="musical-notes" size={14} color={CYBER.primary} />
                  </View>
                )}
                <View style={styles.titleCol}>
                  <Text
                    style={[styles.songTitle, index === queueIndex && styles.songTitleActive]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.songArtist} numberOfLines={1}>{item.artist} · {item.album}</Text>
                </View>
                <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemove(index)}
                >
                  <Ionicons name="close" size={18} color={CYBER.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CYBER.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: CYBER.border,
  },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: CYBER.text },
  clearText: { fontSize: 14, color: CYBER.danger, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: CYBER.muted },
  listContent: { paddingBottom: 120 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: CYBER.border, gap: 10,
  },
  itemActive: { backgroundColor: 'rgba(0, 240, 255, 0.06)' },
  playingIndicator: { width: 20, alignItems: 'center' },
  titleCol: { flex: 1 },
  songTitle: { fontSize: 14, fontWeight: '500', color: CYBER.text },
  songTitleActive: { color: CYBER.primary, fontWeight: '700' },
  songArtist: { fontSize: 12, color: CYBER.muted, marginTop: 2 },
  duration: { fontSize: 12, color: CYBER.muted, fontFamily: 'monospace' },
  removeBtn: { padding: 6 },
});

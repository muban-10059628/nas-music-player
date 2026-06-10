import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { usePlayer } from '@/contexts/PlayerContext';
import { Screen } from '@/components/Screen';
import MiniPlayer from '@/components/MiniPlayer';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

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

interface Playlist {
  id: string;
  name: string;
  songCount: number;
  coverUrl: string;
  songs: any[];
}

export default function PlaylistsScreen() {
  const router = useSafeRouter();
  const { setQueue } = usePlayer();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchPlaylists();
    }, [])
  );

  const fetchPlaylists = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/playlists`);
      const data = await res.json();
      setPlaylists(data);
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
    }
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.songs.length > 0) {
      setQueue(playlist.songs, 0);
    }
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    Alert.alert('删除播放列表', `确定要删除"${playlist.name}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/playlists/${playlist.id}`, {
              method: 'DELETE',
            });
            fetchPlaylists();
          } catch (err) {
            console.error('Failed to delete playlist:', err);
          }
        },
      },
    ]);
  };

  const handleCreatePlaylist = async (name: string) => {
    try {
      await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      setShowCreateModal(false);
      fetchPlaylists();
    } catch (err) {
      console.error('Failed to create playlist:', err);
    }
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => handlePlayPlaylist(item)}
      onLongPress={() => handleDeletePlaylist(item)}
    >
      <Image source={{ uri: item.coverUrl }} style={styles.playlistCover} />
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.playlistMeta}>{item.songCount} 首歌曲</Text>
      </View>
      <View style={styles.playlistActions}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => handlePlayPlaylist(item)}
        >
          <Ionicons name="play" size={20} color={CYBER.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>播放列表</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color={CYBER.primary} />
          </TouchableOpacity>
        </View>

        {/* Playlists */}
        {playlists.length > 0 ? (
          <FlatList
            data={playlists}
            renderItem={renderPlaylistItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={64} color={CYBER.muted} />
            <Text style={styles.emptyTitle}>暂无播放列表</Text>
            <Text style={styles.emptySubtitle}>点击右上角创建你的第一个播放列表</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color={CYBER.bg} />
              <Text style={styles.createButtonText}>创建播放列表</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <CreatePlaylistModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreatePlaylist}
          />
        )}

        <MiniPlayer />
      </View>
    </Screen>
  );
}

// Simple Create Modal
function CreatePlaylistModal({ onClose, onSubmit }: any) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>新建播放列表</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={CYBER.muted} />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.modalInput}
          placeholder="播放列表名称"
          placeholderTextColor={CYBER.muted}
          value={name}
          onChangeText={setName}
          autoFocus
        />
        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalSubmit} onPress={handleSubmit}>
            <Text style={styles.modalSubmitText}>创建</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

import { TextInput, Modal } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CYBER.bg,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: CYBER.text,
    letterSpacing: 0.5,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CYBER.card,
    borderWidth: 1,
    borderColor: CYBER.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: CYBER.border,
  },
  playlistCover: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CYBER.border,
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 14,
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '600',
    color: CYBER.text,
  },
  playlistMeta: {
    fontSize: 12,
    color: CYBER.muted,
    marginTop: 4,
  },
  playlistActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CYBER.card,
    borderWidth: 1,
    borderColor: CYBER.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CYBER.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: CYBER.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: CYBER.primary,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: CYBER.bg,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: CYBER.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CYBER.border,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CYBER.text,
  },
  modalInput: {
    backgroundColor: CYBER.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CYBER.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: CYBER.text,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancel: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: CYBER.muted,
  },
  modalSubmit: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: CYBER.primary,
    borderRadius: 8,
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: CYBER.bg,
  },
});

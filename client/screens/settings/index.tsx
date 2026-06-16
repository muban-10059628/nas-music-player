import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import MiniPlayer from '@/components/MiniPlayer';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CYBER = {
  primary: '#00F0FF',
  secondary: '#BF00FF',
  success: '#00FF88',
  danger: '#FF003C',
  bg: '#0A0A0F',
  card: '#12121A',
  border: 'rgba(0, 240, 255, 0.15)',
  text: '#EAEAEA',
  muted: '#555570',
};

export default function SettingsScreen() {
  const [navConfig, setNavConfig] = useState({
    url: '',
    username: '',
    password: '',
    enabled: false,
  });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchNavConfig();
  }, []);

  const fetchNavConfig = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/nav/config`);
      const data = await res.json();
      setNavConfig({
        url: data.url || '',
        username: data.username || '',
        password: '',
        enabled: data.enabled || false,
      });
    } catch (err) {
      console.error('Failed to fetch Navidrome config:', err);
    }
  };

  const saveNavConfig = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/nav/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: navConfig.url,
          username: navConfig.username,
          password: navConfig.password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('成功', 'Navidrome 配置已保存');
        fetchNavConfig();
      }
    } catch (err) {
      console.error('Failed to save Navidrome config:', err);
      Alert.alert('错误', '保存配置失败，请检查网络连接');
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/nav/test`, {
        method: 'POST',
      });
      const data = await res.json();
      Alert.alert(
        data.success ? '连接成功' : '连接失败',
        data.message
      );
    } catch (err) {
      Alert.alert('连接失败', '无法连接到服务器');
    }
    setTesting(false);
  };

  const clearCache = () => {
    Alert.alert('清除缓存', '确定要清除所有缓存数据吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清除',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          Alert.alert('成功', '缓存已清除');
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>设置</Text>
          </View>

          {/* Navidrome Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="server" size={20} color={CYBER.primary} />
              <Text style={styles.sectionTitle}>Navidrome 连接</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.statusBar}>
                <View style={[
                  styles.statusDot,
                  navConfig.enabled ? styles.statusOnline : styles.statusOffline,
                ]} />
                <Text style={styles.statusText}>
                  {navConfig.enabled ? '已连接' : '未连接'}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>服务器地址</Text>
                <TextInput
                  style={styles.input}
                  placeholder="http://192.168.1.100:4533"
                  placeholderTextColor={CYBER.muted}
                  value={navConfig.url}
                  onChangeText={(text) => setNavConfig({ ...navConfig, url: text })}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>用户名</Text>
                <TextInput
                  style={styles.input}
                  placeholder="admin"
                  placeholderTextColor={CYBER.muted}
                  value={navConfig.username}
                  onChangeText={(text) => setNavConfig({ ...navConfig, username: text })}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>密码</Text>
                <TextInput
                  style={styles.input}
                  placeholder="输入 Navidrome 密码"
                  placeholderTextColor={CYBER.muted}
                  value={navConfig.password}
                  onChangeText={(text) => setNavConfig({ ...navConfig, password: text })}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.hint}>
                <Ionicons name="information-circle" size={16} color={CYBER.muted} />
                <Text style={styles.hintText}>
                  支持所有 Subsonic 协议的服务器（Navidrome、Airsonic、Gonic 等）
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={testConnection}
                  disabled={testing}
                >
                  <Ionicons name="wifi" size={18} color={CYBER.primary} />
                  <Text style={styles.testButtonText}>
                    {testing ? '测试中...' : '测试连接'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={saveNavConfig}>
                  <Ionicons name="save" size={18} color={CYBER.bg} />
                  <Text style={styles.saveButtonText}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Playback Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="musical-notes" size={20} color={CYBER.primary} />
              <Text style={styles.sectionTitle}>播放设置</Text>
            </View>

            <View style={styles.card}>
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>流媒体音质</Text>
                  <Text style={styles.settingDesc}>由 Navidrome 控制</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={CYBER.muted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color={CYBER.primary} />
              <Text style={styles.sectionTitle}>关于</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>版本</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>

              <TouchableOpacity style={styles.settingItem} onPress={clearCache}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>清除缓存</Text>
                  <Text style={styles.settingDesc}>释放存储空间</Text>
                </View>
                <Ionicons name="trash-outline" size={20} color={CYBER.danger} />
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: CYBER.text,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CYBER.text,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: CYBER.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CYBER.border,
    padding: 16,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: CYBER.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOnline: {
    backgroundColor: CYBER.success,
  },
  statusOffline: {
    backgroundColor: CYBER.muted,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: CYBER.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: CYBER.muted,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: CYBER.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CYBER.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: CYBER.text,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 16,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    color: CYBER.muted,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CYBER.primary,
    backgroundColor: 'transparent',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: CYBER.primary,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: CYBER.primary,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: CYBER.bg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CYBER.border,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: CYBER.text,
  },
  settingDesc: {
    fontSize: 12,
    color: CYBER.muted,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: CYBER.border,
  },
  infoLabel: {
    fontSize: 14,
    color: CYBER.muted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: CYBER.text,
  },
});
                                                                                                  
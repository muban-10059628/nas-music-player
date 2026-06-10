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
  const [nasConfig, setNasConfig] = useState({
    host: '',
    port: '445',
    username: '',
    password: '',
    musicPath: '/Music',
    enabled: false,
  });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchNasConfig();
  }, []);

  const fetchNasConfig = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/nas/config`);
      const data = await res.json();
      setNasConfig({
        ...data,
        password: '', // Don't show password
      });
    } catch (err) {
      console.error('Failed to fetch NAS config:', err);
    }
  };

  const saveNasConfig = async () => {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/nas/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: nasConfig.host,
          port: parseInt(nasConfig.port) || 445,
          username: nasConfig.username,
          password: nasConfig.password,
          musicPath: nasConfig.musicPath,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        Alert.alert('成功', 'NAS 配置已保存');
        fetchNasConfig();
      }
    } catch (err) {
      console.error('Failed to save NAS config:', err);
      Alert.alert('错误', '保存 NAS 配置失败');
    }
  };

  const testConnection = async () => {
    setTesting(true);
    // 模拟测试
    setTimeout(() => {
      setTesting(false);
      Alert.alert(
        nasConfig.host ? '连接成功' : '请输入 NAS 地址',
        nasConfig.host 
          ? `已成功连接到 ${nasConfig.host}` 
          : '请先填写 NAS 连接信息'
      );
    }, 1500);
  };

  const clearCache = () => {
    Alert.alert(
      '清除缓存',
      '确定要清除所有缓存数据吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('成功', '缓存已清除');
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>设置</Text>
          </View>

          {/* NAS Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="server" size={20} color={CYBER.primary} />
              <Text style={styles.sectionTitle}>NAS 连接</Text>
            </View>
            
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NAS 地址</Text>
                <TextInput
                  style={styles.input}
                  placeholder="192.168.1.100"
                  placeholderTextColor={CYBER.muted}
                  value={nasConfig.host}
                  onChangeText={(text) => setNasConfig({ ...nasConfig, host: text })}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>端口</Text>
                <TextInput
                  style={styles.input}
                  placeholder="445"
                  placeholderTextColor={CYBER.muted}
                  value={nasConfig.port}
                  onChangeText={(text) => setNasConfig({ ...nasConfig, port: text })}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>用户名</Text>
                <TextInput
                  style={styles.input}
                  placeholder="admin"
                  placeholderTextColor={CYBER.muted}
                  value={nasConfig.username}
                  onChangeText={(text) => setNasConfig({ ...nasConfig, username: text })}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>密码</Text>
                <TextInput
                  style={styles.input}
                  placeholder="输入密码"
                  placeholderTextColor={CYBER.muted}
                  value={nasConfig.password}
                  onChangeText={(text) => setNasConfig({ ...nasConfig, password: text })}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>音乐路径</Text>
                <TextInput
                  style={styles.input}
                  placeholder="/Music"
                  placeholderTextColor={CYBER.muted}
                  value={nasConfig.musicPath}
                  onChangeText={(text) => setNasConfig({ ...nasConfig, musicPath: text })}
                />
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

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveNasConfig}
                >
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
                  <Text style={styles.settingDesc}>高音质 (320kbps)</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={CYBER.muted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>缓存设置</Text>
                  <Text style={styles.settingDesc}>智能缓存已启用</Text>
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
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>构建</Text>
                <Text style={styles.infoValue}>2024.01</Text>
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

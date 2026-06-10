import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// NAS 配置存储（内存中，演示用）
let nasConfig = {
  enabled: false,
  host: '',
  port: 445,
  username: '',
  password: '',
  musicPath: '/Music',
};

// 模拟音乐库数据（实际使用时从 NAS 读取）
const mockMusicLibrary = {
  artists: [
    { id: '1', name: '周杰伦', albumCount: 5, songCount: 50 },
    { id: '2', name: '林俊杰', albumCount: 4, songCount: 40 },
    { id: '3', name: '陈奕迅', albumCount: 6, songCount: 60 },
    { id: '4', name: 'Taylor Swift', albumCount: 8, songCount: 80 },
    { id: '5', name: 'Adele', albumCount: 3, songCount: 30 },
  ],
  albums: [
    { id: '1', title: '七里香', artist: '周杰伦', year: 2004, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', songCount: 10 },
    { id: '2', title: '范特西', artist: '周杰伦', year: 2001, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop', songCount: 10 },
    { id: '3', title: '江南', artist: '林俊杰', year: 2004, coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', songCount: 12 },
    { id: '4', title: '她说', artist: '林俊杰', year: 2010, coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop', songCount: 10 },
    { id: '5', title: '黑白灰', artist: '陈奕迅', year: 2003, coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop', songCount: 8 },
    { id: '6', title: '1989', artist: 'Taylor Swift', year: 2014, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', songCount: 13 },
    { id: '7', title: '25', artist: 'Adele', year: 2015, coverUrl: 'https://images.unsplash.com/photo-1484755560615-a4c64e778a6c?w=400&h=400&fit=crop', songCount: 11 },
  ],
  songs: [
    { id: '1', title: '七里香', artist: '周杰伦', album: '七里香', duration: 285, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: '2', title: '夜曲', artist: '周杰伦', album: '十一月的萧邦', duration: 252, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: '3', title: '简单爱', artist: '周杰伦', album: '范特西', duration: 267, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: '4', title: '稻香', artist: '周杰伦', album: '魔杰座', duration: 238, coverUrl: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=400&h=400&fit=crop', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: '5', title: '江南', artist: '林俊杰', album: '江南', duration: 245, coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { id: '6', title: '她说', artist: '林俊杰', album: '她说', duration: 253, coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { id: '7', title: '富士山下', artist: '陈奕迅', album: '黑白灰', duration: 268, coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
    { id: '8', title: '爱情转移', artist: '陈奕迅', album: '黑白灰', duration: 259, coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { id: '9', title: 'Shake It Off', artist: 'Taylor Swift', album: '1989', duration: 219, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
    { id: '10', title: 'Blank Space', artist: 'Taylor Swift', album: '1989', duration: 231, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
    { id: '11', title: 'Hello', artist: 'Adele', album: '25', duration: 295, coverUrl: 'https://images.unsplash.com/photo-1484755560615-a4c64e778a6c?w=400&h=400&fit=crop', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3' },
    { id: '12', title: 'Rolling in the Deep', artist: 'Adele', album: '21', duration: 228, coverUrl: 'https://images.unsplash.com/photo-1484755560615-a4c64e778a6c?w=400&h=400&fit=crop', streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3' },
  ],
  recentPlays: [
    { id: '1', title: '七里香', artist: '周杰伦', coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop', playedAt: Date.now() - 3600000 },
    { id: '5', title: '江南', artist: '林俊杰', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop', playedAt: Date.now() - 7200000 },
    { id: '7', title: '富士山下', artist: '陈奕迅', coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop', playedAt: Date.now() - 10800000 },
  ],
};

// 最近播放历史
let recentPlays = [...mockMusicLibrary.recentPlays];

// Health check
app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// 获取 NAS 配置
app.get('/api/v1/nas/config', (req, res) => {
  res.json({
    enabled: nasConfig.enabled,
    host: nasConfig.host,
    port: nasConfig.port,
    musicPath: nasConfig.musicPath,
  });
});

// 更新 NAS 配置
app.post('/api/v1/nas/config', (req, res) => {
  const { host, port, username, password, musicPath } = req.body;
  
  if (host) nasConfig.host = host;
  if (port) nasConfig.port = port;
  if (username) nasConfig.username = username;
  if (password) nasConfig.password = password;
  if (musicPath) nasConfig.musicPath = musicPath;
  
  nasConfig.enabled = !!(host && username && password);
  
  res.json({ success: true, enabled: nasConfig.enabled });
});

// 获取所有艺术家
app.get('/api/v1/artists', (req, res) => {
  res.json(mockMusicLibrary.artists);
});

// 获取艺术家详情及专辑
app.get('/api/v1/artists/:id', (req, res) => {
  const artist = mockMusicLibrary.artists.find(a => a.id === req.params.id);
  if (!artist) {
    return res.status(404).json({ error: 'Artist not found' });
  }
  
  const albums = mockMusicLibrary.albums.filter(a => a.artist === artist.name);
  const songs = mockMusicLibrary.songs.filter(s => s.artist === artist.name);
  
  res.json({ ...artist, albums, songs });
});

// 获取所有专辑
app.get('/api/v1/albums', (req, res) => {
  res.json(mockMusicLibrary.albums);
});

// 获取专辑详情及歌曲
app.get('/api/v1/albums/:id', (req, res) => {
  const album = mockMusicLibrary.albums.find(a => a.id === req.params.id);
  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }
  
  const songs = mockMusicLibrary.songs.filter(s => s.album === album.title);
  res.json({ ...album, songs });
});

// 获取所有歌曲
app.get('/api/v1/songs', (req, res) => {
  res.json(mockMusicLibrary.songs);
});

// 获取单曲详情
app.get('/api/v1/songs/:id', (req, res) => {
  const song = mockMusicLibrary.songs.find(s => s.id === req.params.id);
  if (!song) {
    return res.status(404).json({ error: 'Song not found' });
  }
  res.json(song);
});

// 搜索音乐
app.get('/api/v1/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  
  if (!query) {
    return res.json({ artists: [], albums: [], songs: [] });
  }
  
  const artists = mockMusicLibrary.artists.filter(a => 
    a.name.toLowerCase().includes(query)
  );
  
  const albums = mockMusicLibrary.albums.filter(a => 
    a.title.toLowerCase().includes(query) || a.artist.toLowerCase().includes(query)
  );
  
  const songs = mockMusicLibrary.songs.filter(s => 
    s.title.toLowerCase().includes(query) || 
    s.artist.toLowerCase().includes(query) || 
    s.album.toLowerCase().includes(query)
  );
  
  res.json({ artists, albums, songs });
});

// 获取最近播放
app.get('/api/v1/recent', (req, res) => {
  res.json(recentPlays);
});

// 添加到最近播放
app.post('/api/v1/recent', (req, res) => {
  const { songId } = req.body;
  const song = mockMusicLibrary.songs.find(s => s.id === songId);
  
  if (!song) {
    return res.status(404).json({ error: 'Song not found' });
  }
  
  // 移除已存在的记录
  recentPlays = recentPlays.filter(p => p.id !== songId);
  
  // 添加到开头
  recentPlays.unshift({
    id: song.id,
    title: song.title,
    artist: song.artist,
    coverUrl: song.coverUrl,
    playedAt: Date.now(),
  });
  
  // 只保留最近 20 首
  if (recentPlays.length > 20) {
    recentPlays = recentPlays.slice(0, 20);
  }
  
  res.json({ success: true });
});

// 流媒体播放代理（用于 NAS 音乐）
app.get('/api/v1/stream/:id', async (req, res) => {
  const song = mockMusicLibrary.songs.find(s => s.id === req.params.id);
  
  if (!song) {
    return res.status(404).json({ error: 'Song not found' });
  }
  
  // 如果配置了 NAS，使用 NAS 音乐
  if (nasConfig.enabled && song.nasPath) {
    try {
      const nasUrl = `smb://${nasConfig.username}:${nasConfig.password}@${nasConfig.host}:${nasConfig.port}${song.nasPath}`;
      const response = await axios.get(nasUrl, { responseType: 'stream' });
      
      res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      response.data.pipe(res);
    } catch (error) {
      console.error('NAS streaming error:', error);
      // Fallback to demo URL
      const response = await axios.get(song.streamUrl, { responseType: 'stream' });
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      response.data.pipe(res);
    }
  } else {
    // 使用示例音频流
    try {
      const response = await axios.get(song.streamUrl, { 
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
      
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      response.data.pipe(res);
    } catch (error) {
      console.error('Streaming error:', error);
      res.status(500).json({ error: 'Failed to stream audio' });
    }
  }
});

// 获取专辑封面（用于 NAS 封面缓存/代理）
app.get('/api/v1/cover/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  
  let item;
  if (type === 'album') {
    item = mockMusicLibrary.albums.find(a => a.id === id);
  } else if (type === 'song') {
    item = mockMusicLibrary.songs.find(s => s.id === id);
  }
  
  if (!item || !item.coverUrl) {
    return res.status(404).json({ error: 'Cover not found' });
  }
  
  try {
    const response = await axios.get(item.coverUrl, { responseType: 'arraybuffer' });
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(response.data);
  } catch (error) {
    console.error('Cover fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cover' });
  }
});

// 播放列表管理
let playlists = [
  {
    id: 'favorites',
    name: '我的收藏',
    songs: ['1', '5', '7'],
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
  },
  {
    id: 'chill',
    name: '放松时光',
    songs: ['3', '6', '10'],
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  },
];

// 获取所有播放列表
app.get('/api/v1/playlists', (req, res) => {
  const result = playlists.map(p => ({
    ...p,
    songs: p.songs.map(id => mockMusicLibrary.songs.find(s => s.id === id)).filter(Boolean),
    songCount: p.songs.length,
  }));
  res.json(result);
});

// 获取单个播放列表
app.get('/api/v1/playlists/:id', (req, res) => {
  const playlist = playlists.find(p => p.id === req.params.id);
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }
  
  res.json({
    ...playlist,
    songs: playlist.songs.map(id => mockMusicLibrary.songs.find(s => s.id === id)).filter(Boolean),
  });
});

// 创建播放列表
app.post('/api/v1/playlists', (req, res) => {
  const { name } = req.body;
  
  const newPlaylist = {
    id: `playlist_${Date.now()}`,
    name: name || '新播放列表',
    songs: [],
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
  };
  
  playlists.push(newPlaylist);
  res.json(newPlaylist);
});

// 添加歌曲到播放列表
app.post('/api/v1/playlists/:id/songs', (req, res) => {
  const { songId } = req.body;
  const playlist = playlists.find(p => p.id === req.params.id);
  
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }
  
  if (!playlist.songs.includes(songId)) {
    playlist.songs.push(songId);
  }
  
  res.json({ success: true });
});

// 从播放列表移除歌曲
app.delete('/api/v1/playlists/:id/songs/:songId', (req, res) => {
  const playlist = playlists.find(p => p.id === req.params.id);
  
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }
  
  playlist.songs = playlist.songs.filter(id => id !== req.params.songId);
  res.json({ success: true });
});

// 删除播放列表
app.delete('/api/v1/playlists/:id', (req, res) => {
  playlists = playlists.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});

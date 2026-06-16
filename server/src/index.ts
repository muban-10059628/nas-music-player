import express from "express";
import cors from "cors";
import axios from "axios";
import crypto from "crypto";

const app = express();
const port = process.env.PORT || 9091;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ===================== Subsonic API 工具 =====================

const SUB_API_VERSION = "1.16.1";
const SUB_CLIENT = "nas-music-player";

function subsonicToken(password: string, salt: string): string {
  return crypto.createHash("md5").update(password + salt).digest("hex");
}

let navConfig = {
  enabled: false,
  url: "",
  username: "",
  password: "",
};

function subParams(extra: Record<string, string> = {}): string {
  const salt = Math.random().toString(36).slice(2, 10);
  const token = subsonicToken(navConfig.password, salt);
  return new URLSearchParams({
    u: navConfig.username,
    t: token,
    s: salt,
    v: SUB_API_VERSION,
    c: SUB_CLIENT,
    f: "json",
    ...extra,
  }).toString();
}

async function subsonicCall<T>(endpoint: string, extra: Record<string, string> = {}): Promise<T> {
  const url = `${navConfig.url}/rest/${endpoint}?${subParams(extra)}`;
  const res = await axios.get(url, { timeout: 10000 });
  const sr = res.data["subsonic-response"] || res.data;
  if (sr.status === "failed") throw new Error(sr.error?.message || "Subsonic API error");
  return sr as T;
}

// ===================== 前端数据映射 =====================
// 所有 coverUrl / streamUrl 都走后端代理，不暴露 Navidrome 地址和 token
// 设置 SERVER_BASE_URL 环境变量告诉前端怎么访问本服务器
// 例如: SERVER_BASE_URL=http://192.168.1.50:9091
// 不设置时 fallback 到 http://localhost:PORT（只能 Web 调试用）
const serverBase = process.env.SERVER_BASE_URL || `http://localhost:${port}`;

function toCover(id: string): string {
  return id ? `${serverBase}/api/v1/cover/${id}` : "";
}

function toStream(id: string): string {
  return `${serverBase}/api/v1/stream/${id}`;
}

function toSong(s: any): any {
  return {
    id: s.id,
    title: s.title,
    artist: s.artist || "",
    album: s.album || "",
    duration: s.duration || 0,
    coverUrl: toCover(s.coverArt),
    streamUrl: toStream(s.id),
  };
}

function toAlbum(a: any): any {
  return {
    id: a.id,
    title: a.name,
    artist: a.artist || "",
    year: a.year || 0,
    coverUrl: toCover(a.coverArt),
    songCount: a.songCount || 0,
  };
}

function toArtist(a: any): any {
  return { id: a.id, name: a.name, albumCount: a.albumCount || 0, songCount: 0 };
}

// ===================== Nav 配置 =====================

let recentPlays: any[] = [];

app.get("/api/v1/nav/config", (_req, res) => {
  res.json({ enabled: navConfig.enabled, url: navConfig.url, username: navConfig.username });
});

app.post("/api/v1/nav/config", (req, res) => {
  const { url, username, password } = req.body;
  if (url) navConfig.url = url.replace(/\/+$/, "");
  if (username) navConfig.username = username;
  if (password !== undefined && password !== "") navConfig.password = password;
  navConfig.enabled = !!(navConfig.url && navConfig.username && navConfig.password);
  res.json({ success: true, enabled: navConfig.enabled });
});

app.post("/api/v1/nav/test", async (_req, res) => {
  try {
    await subsonicCall<any>("ping");
    res.json({ success: true, message: "连接成功" });
  } catch (err: any) {
    res.json({ success: false, message: err.message || "连接失败" });
  }
});

// ===================== API 代理 =====================

app.get("/api/v1/health", (_req, res) => res.json({ status: "ok" }));

// 艺术家
app.get("/api/v1/artists", async (_req, res) => {
  try {
    const data = await subsonicCall<any>("getArtists");
    const artists: any[] = [];
    for (const idx of data.artists?.index || []) {
      for (const a of idx.artist || []) artists.push(toArtist(a));
    }
    res.json(artists);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 艺术家详情（附带专辑和歌曲）
app.get("/api/v1/artists/:id", async (req, res) => {
  try {
    const data = await subsonicCall<any>("getArtist", { id: req.params.id });
    const artist = data.artist;
    const albums: any[] = [];
    const songs: any[] = [];
    for (const alb of artist.album || []) {
      const ad = await subsonicCall<any>("getAlbum", { id: alb.id });
      albums.push(toAlbum(alb));
      for (const s of ad.album?.song || []) songs.push(toSong(s));
    }
    res.json({
      id: artist.id, name: artist.name,
      albumCount: artist.albumCount || albums.length, songCount: songs.length,
      albums, songs,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 专辑列表
app.get("/api/v1/albums", async (_req, res) => {
  try {
    const data = await subsonicCall<any>("getAlbumList2", { type: "newest", size: "200" });
    res.json((data.albumList2?.album || []).map(toAlbum));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 专辑详情
app.get("/api/v1/albums/:id", async (req, res) => {
  try {
    const data = await subsonicCall<any>("getAlbum", { id: req.params.id });
    const a = data.album;
    res.json({ ...toAlbum(a), songs: (a.song || []).map(toSong) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 所有歌曲（search3 空查询拿大结果集）
app.get("/api/v1/songs", async (_req, res) => {
  try {
    const data = await subsonicCall<any>("search3", { query: "", songCount: "500" });
    res.json((data.searchResult3?.song || []).map(toSong));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 搜索
app.get("/api/v1/search", async (req, res) => {
  const q = (req.query.q || "") as string;
  if (!q) return res.json({ artists: [], albums: [], songs: [] });
  try {
    const data = await subsonicCall<any>("search3", { query: q, artistCount: "10", albumCount: "10", songCount: "20" });
    const r = data.searchResult3;
    res.json({
      artists: (r?.artist || []).map(toArtist),
      albums: (r?.album || []).map(toAlbum),
      songs: (r?.song || []).map(toSong),
    });
  } catch {
    res.json({ artists: [], albums: [], songs: [] });
  }
});

// 最近播放
app.get("/api/v1/recent", (_req, res) => res.json(recentPlays));

app.post("/api/v1/recent", (req, res) => {
  const { songId, title, artist, coverUrl } = req.body;
  if (!songId) return res.status(400).json({ error: "songId required" });
  recentPlays = recentPlays.filter((p: any) => p.id !== songId);
  recentPlays.unshift({ id: songId, title: title || "", artist: artist || "", coverUrl: coverUrl || "", playedAt: Date.now() });
  if (recentPlays.length > 20) recentPlays = recentPlays.slice(0, 20);
  res.json({ success: true });
});

// 流媒体代理（每次请求动态生成 token）
app.get("/api/v1/stream/:id", async (req, res) => {
  try {
    const url = `${navConfig.url}/rest/stream?${subParams({ id: req.params.id })}`;
    const response = await axios.get(url, { responseType: "stream", timeout: 30000 });
    res.setHeader("Content-Type", response.headers["content-type"] || "audio/mpeg");
    res.setHeader("Accept-Ranges", "bytes");
    response.data.pipe(res);
  } catch (err: any) {
    console.error("Stream error:", err.message);
    res.status(500).json({ error: "Failed to stream audio" });
  }
});

// 封面代理
app.get("/api/v1/cover/:id", async (req, res) => {
  try {
    const url = `${navConfig.url}/rest/getCoverArt?${subParams({ id: req.params.id })}`;
    const response = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
    res.setHeader("Content-Type", response.headers["content-type"] || "image/jpeg");
    res.send(response.data);
  } catch {
    res.status(404).json({ error: "Cover not found" });
  }
});

// 播放列表
app.get("/api/v1/playlists", async (_req, res) => {
  try {
    const data = await subsonicCall<any>("getPlaylists");
    res.json((data.playlists?.playlist || []).map((p: any) => ({ id: p.id, name: p.name, songCount: p.songCount || 0, coverUrl: "", songs: [] })));
  } catch {
    res.json([]);
  }
});

app.get("/api/v1/playlists/:id", async (req, res) => {
  try {
    const data = await subsonicCall<any>("getPlaylist", { id: req.params.id });
    const p = data.playlist;
    res.json({ id: p.id, name: p.name, songCount: p.songCount || 0, coverUrl: "", songs: (p.entry || []).map(toSong) });
  } catch {
    res.status(404).json({ error: "Playlist not found" });
  }
});

app.post("/api/v1/playlists", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  try {
    const data = await subsonicCall<any>("createPlaylist", { name });
    res.json({ id: data.playlist.id, name: data.playlist.name, songCount: 0, coverUrl: "", songs: [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/v1/playlists/:id/songs", async (req, res) => {
  const { songId } = req.body;
  if (!songId) return res.status(400).json({ error: "songId required" });
  try {
    await subsonicCall<any>("updatePlaylist", { playlistId: req.params.id, songIdToAdd: songId });
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to add song" }); }
});

app.delete("/api/v1/playlists/:id/songs/:songId", async (req, res) => {
  try {
    await subsonicCall<any>("updatePlaylist", { playlistId: req.params.id, songIdToRemove: req.params.songId });
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to remove song" }); }
});

app.delete("/api/v1/playlists/:id", async (req, res) => {
  try {
    await subsonicCall<any>("deletePlaylist", { id: req.params.id });
    res.json({ success: true });
  } catch { res.status(500).json({ error: "Failed to delete playlist" }); }
});

// ===================== 启动 =====================
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
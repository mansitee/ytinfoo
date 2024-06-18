const express = require('express');
const ytdl = require('ytdl-core');
const app = express();

// Endpoint utama untuk mendapatkan informasi format video
app.get("/api", async (req, res) => {
  try {
    const { url } = req.query;

    // Validasi URL parameter
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Invalid URL parameter.' });
    }

    // Mendapatkan informasi video dari ytdl-core
    const info = await ytdl.getInfo(url);

    // Memfilter format yang memiliki video dan audio
    const formats = info.formats.filter(format => format.hasVideo && format.hasAudio);
    
    // Menyusun statistik format video
    const stats = formats.map(format => {
      const { qualityLabel, url, hasVideo, hasAudio } = format;
      return {
        qualityLabel,
        downloadUrl: url,
        hasVideo,
        hasAudio,
      };
    });

    // Mengirimkan hasil dalam bentuk JSON
    res.json(stats);
  } catch (error) {
    console.error('Error fetching video formats:', error);
    res.status(500).json({ error: 'Failed to fetch video formats.' });
  }
});

// Endpoint tambahan untuk mendapatkan metadata dasar video
app.get("/api/metadata", async (req, res) => {
  try {
    const { url } = req.query;

    // Validasi URL parameter
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Invalid URL parameter.' });
    }

    // Mendapatkan informasi video dari ytdl-core
    const info = await ytdl.getInfo(url);

    // Mengambil metadata dasar
    const metadata = {
      videoDetails: {
        title: info.videoDetails.title,
        description: info.videoDetails.description,
        lengthSeconds: info.videoDetails.lengthSeconds,
        viewCount: info.videoDetails.viewCount,
        author: {
          name: info.videoDetails.author.name,
          channelUrl: info.videoDetails.author.channel_url
        }
      }
    };

    // Mengirimkan metadata dalam bentuk JSON
    res.json(metadata);
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    res.status(500).json({ error: 'Failed to fetch video metadata.' });
  }
});

// Endpoint tambahan untuk mendownload video dengan format tertentu
app.get("/api/download", async (req, res) => {
  try {
    const { url, format } = req.query;

    // Validasi URL parameter
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Invalid URL parameter.' });
    }

    // Validasi format parameter
    if (!format || typeof format !== 'string') {
      return res.status(400).json({ error: 'Invalid format parameter.' });
    }

    // Mendapatkan informasi video dari ytdl-core
    const info = await ytdl.getInfo(url);

    // Memilih format video yang sesuai dengan parameter format
    const videoFormat = info.formats.find(f => f.itag.toString() === format);

    // Validasi apakah format ditemukan
    if (!videoFormat) {
      return res.status(400).json({ error: 'Invalid format itag.' });
    }

    // Mengatur header untuk mendownload video
    res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
    
    // Stream video dengan format yang dipilih
    ytdl(url, { format: videoFormat }).pipe(res);
  } catch (error) {
    console.error('Error downloading video:', error);
    res.status(500).json({ error: 'Failed to download video.' });
  }
});

// Memulai server pada port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const app = require("express")();
const ytdl = require("ytdl-core");

app.get("/api", async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Invalid URL parameter.' });
    }

    const info = await ytdl.getInfo(url);
    const formats = info.formats.filter(format => format.hasVideo && format.hasAudio);
    
    const stats = formats.map(format => {
      const { qualityLabel, url, hasVideo, hasAudio } = format;
      return {
        qualityLabel,
        downloadUrl: url,
        hasVideo,
        hasAudio,
      };
    });
 
    res.json(stats);
  } catch (error) {
    console.error('Error fetching video formats:', error);
    res.status(500).json({ error: 'Failed to fetch video formats.' });
  }
});

module.exports = app;
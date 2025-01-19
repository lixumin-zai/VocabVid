const express = require('express');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 43256;

// 视频文件路径
const videoPath = path.join(__dirname, 'Show.mp4');

// 监控视频文件变化
chokidar.watch(videoPath).on('change', () => {
  console.log('Video file has been updated!');
  const currentModifiedTime = fs.statSync(videoPath).mtime.getTime();
  if (currentModifiedTime !== lastModifiedTime) {
    lastModifiedTime = currentModifiedTime;
    // 发送一个刷新页面的请求到所有客户端
    app.locals.videoUpdated = true;
  }
});

// 提供静态文件（视频文件）
app.use(express.static(path.join(__dirname, 'public')));

// 路由：返回HTML文件
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MP4 Player</title>
    </head>
    <body>
      <h1>Video Player</h1>
      <video width="800" controls>
        <source src="/video.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </body>
    </html>
  `);
});

// 路由：视频文件流式传输
app.get('/video.mp4', (req, res) => {
  const range = req.headers.range;
  if (!range) {
    return res.status(400).send('Range header is required');
  }

  const videoSize = fs.statSync(videoPath).size;
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  const stream = fs.createReadStream(videoPath, { start, end });
  res.status(206).header({
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': end - start + 1,
    'Content-Type': 'video/mp4',
  });

  stream.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// npm install express chokidar
// node server.js Explanify
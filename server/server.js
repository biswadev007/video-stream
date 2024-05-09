import express, { json, urlencoded, static as static_ } from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import fs from 'node:fs';
import { exec } from 'node:child_process';

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + uuidv4() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
  })
);
app.use((req, res, next) => {
  req.header('Access-Control-Allow-Origin', '*');
  req.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
app.use(json());
app.use(urlencoded({ extended: true }));
app.use('/uploads', static_('uploads'));

app.get('/', (req, res) => {
  return res.send('Getting from server!');
});

app.post('/upload', upload.single('file'), (req, res) => {
  const lessionId = uuidv4();
  const videoPath = req.file.path;
  const outputPath = `./uploads/lession/${lessionId}`;
  const hlsPath = `${outputPath}/index.m3u8`;

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  /** ffmpeg */
  const ffmpegCmd = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

  /** Converting video :: not prod level */
  exec(ffmpegCmd, (err, stdout, stderr) => {
    if (err) console.log('Exec error::', err);

    console.log('stdout::', stdout);
    console.log('stderr::', stderr);
    const vdoUrl = `http://localhost:4000/uploads/lession/${lessionId}/index.m3u8`;
    return res.json({
      message: 'Video converted to HLS format',
      vdoUrl,
      lessionId,
    });
  });
});

app.listen(4000, () =>
  console.log(`Server running at:: http://localhost:4000/`)
);

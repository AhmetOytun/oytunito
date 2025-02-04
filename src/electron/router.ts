import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import os from "os";

const DESKTOP_DIR = path.join(os.homedir(), "Desktop", "oytunito_uploads");
const CHUNKS_DIR = path.join(DESKTOP_DIR, "chunks");
const FILES_DIR = path.join(DESKTOP_DIR, "files");

fs.ensureDirSync(CHUNKS_DIR);
fs.ensureDirSync(FILES_DIR);

const upload = multer({ dest: CHUNKS_DIR });
const router = Router();

export let isDownloading: boolean = false;
export let progress: number = 0;

router.post("/upload-chunk", upload.single("chunk"), async (req, res) => {
  isDownloading = true;

  const fileName = req.header("X-File-Name");
  const { chunkIndex } = req.body;

  const fileChunksDir = path.join(CHUNKS_DIR, fileName || "");
  await fs.ensureDir(fileChunksDir);

  const chunkFilePath = path.join(fileChunksDir, `${chunkIndex}`);

  if (req.file) {
    await fs.move(req.file.path, chunkFilePath);

    progress = Math.ceil(
      ((parseInt(chunkIndex) + 1) / parseInt(req.body.totalChunks)) * 100
    );

    res.status(200).send({ message: "Chunk uploaded successfully" });
  } else {
    res.status(400).send({ message: "File not uploaded" });
  }
});

router.post("/merge-chunks", async (req, res) => {
  const { totalChunks } = req.body;
  const fileName = req.header("X-File-Name");

  const fileChunksDir = path.join(CHUNKS_DIR, fileName || "");
  const outputPath = path.join(FILES_DIR, fileName || "");

  const writeStream = fs.createWriteStream(outputPath);

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(fileChunksDir, `${i}`);
    const data = await fs.readFile(chunkPath);
    writeStream.write(data);
  }

  writeStream.end();

  await fs.remove(fileChunksDir);

  isDownloading = false;
  progress = 0;

  res
    .status(200)
    .send({ message: "File merged successfully", path: outputPath });
});

export default router;

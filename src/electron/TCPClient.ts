import net from "net";
import fs from "fs";
import path from "path";

function sendFile(
  ip: string,
  port: number,
  filePath: string,
  progressCallback?: (progress: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const socket = net.createConnection(port, ip, () => {
      console.log(`Connected to ${ip}:${port}`);

      const stats = fs.statSync(filePath);
      const header =
        JSON.stringify({
          filename: path.basename(filePath),
          size: stats.size,
        }) + "\n";

      socket.write(header);

      const readStream = fs.createReadStream(filePath);

      let sentBytes = 0;
      readStream.on("data", (chunk) => {
        sentBytes += chunk.length;
        if (progressCallback) {
          const progress = (sentBytes / stats.size) * 100;
          progressCallback(progress);
        }
      });

      readStream.pipe(socket, { end: false });

      readStream.on("end", () => {
        console.log("File data sent");
        socket.end();
      });

      socket.on("close", () => {
        console.log("Socket closed, file send complete");
        resolve();
      });
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
      reject(err);
    });
  });
}

export default sendFile;

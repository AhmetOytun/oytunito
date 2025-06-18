import net from "net";
import fs from "fs";
import path from "path";
import { app } from "electron";

const FILE_RECEIVE_PORT = 3132;

function startFileReceiver(eventSender: Electron.WebContents) {
  const server = net.createServer((socket) => {
    let fileStream: fs.WriteStream | null = null;
    let receivedBytes = 0;
    let fileSize = 0;
    let headerBuffer = Buffer.alloc(0);
    let headerParsed = false;

    socket.on("data", (chunk: Buffer) => {
      if (!headerParsed) {
        headerBuffer = Buffer.concat([headerBuffer, chunk]);
        const delimiterIndex = headerBuffer.indexOf("\n");

        if (delimiterIndex !== -1) {
          const headerStr = headerBuffer.slice(0, delimiterIndex).toString();
          const header = JSON.parse(headerStr);

          const filename = path.basename(header.filename);
          fileSize = header.size;

          const baseDir = path.join(app.getPath("documents"), "oytunito");

          if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
          }

          const savePath = path.join(baseDir, filename);
          fileStream = fs.createWriteStream(savePath);

          const remaining = headerBuffer.slice(delimiterIndex + 1);
          if (remaining.length > 0) {
            fileStream.write(remaining);
            receivedBytes += remaining.length;

            eventSender.send(
              "receive-file-progress",
              (receivedBytes / fileSize) * 100
            );
          }

          headerParsed = true;
        }
      } else {
        if (fileStream) {
          fileStream.write(chunk);
          receivedBytes += chunk.length;

          // Progress update
          eventSender.send(
            "receive-file-progress",
            (receivedBytes / fileSize) * 100
          );

          if (receivedBytes >= fileSize) {
            fileStream.end();
            socket.end();
            eventSender.send("receive-file-complete");
          }
        }
      }
    });

    socket.on("end", () => {
      if (fileStream && !fileStream.closed) fileStream.end();
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
      if (fileStream && !fileStream.closed) fileStream.end();
      eventSender.send("receive-file-error", err.message);
    });
  });

  server.listen(FILE_RECEIVE_PORT, () => {
    // server is listening
  });

  return server;
}

export default startFileReceiver;

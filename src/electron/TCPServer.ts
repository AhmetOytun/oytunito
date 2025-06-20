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

        if (delimiterIndex === -1) {
          // Still waiting for full header
          return;
        }

        // Try to parse header
        const headerStr = headerBuffer.slice(0, delimiterIndex).toString();
        let header;
        try {
          header = JSON.parse(headerStr);
        } catch (err) {
          console.error("Failed to parse header JSON:", err);
          socket.destroy();
          return;
        }

        const filename = path.basename(header.filename || "received-file");
        fileSize = header.size || 0;

        const baseDir = path.join(app.getPath("documents"), "oytunito");
        if (!fs.existsSync(baseDir)) {
          fs.mkdirSync(baseDir, { recursive: true });
        }

        const savePath = path.join(baseDir, filename);
        console.log("Saving file to:", savePath);
        fileStream = fs.createWriteStream(savePath);

        // Handle the remaining part of the chunk after the header
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
      } else {
        // Normal data chunks
        if (fileStream) {
          fileStream.write(chunk);
          receivedBytes += chunk.length;

          eventSender.send(
            "receive-file-progress",
            (receivedBytes / fileSize) * 100
          );

          if (receivedBytes >= fileSize) {
            fileStream.end();
            socket.end();
            eventSender.send("receive-file-complete");
            console.log("File transfer complete.");
          }
        }
      }
    });

    socket.on("end", () => {
      console.log("Socket ended");
      if (fileStream && !fileStream.closed) fileStream.end();
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
      if (fileStream && !fileStream.closed) fileStream.end();
      eventSender.send("receive-file-error", err.message);
    });
  });

  server.listen(FILE_RECEIVE_PORT, () => {
    console.log(`File receiver listening on port ${FILE_RECEIVE_PORT}`);
  });

  return server;
}

export default startFileReceiver;

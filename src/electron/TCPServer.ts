import net from "net";
import fs from "fs";
import path from "path";
import { app } from "electron";

const FILE_RECEIVE_PORT = 3132;

function startFileReceiver() {
  const server = net.createServer((socket) => {
    console.log("Client connected:", socket.remoteAddress);

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

          const savePath = path.join(app.getPath("downloads"), filename);
          fileStream = fs.createWriteStream(savePath);

          const remaining = headerBuffer.slice(delimiterIndex + 1);
          if (remaining.length > 0) {
            fileStream.write(remaining);
            receivedBytes += remaining.length;
          }

          headerParsed = true;
          console.log(`Receiving file ${filename} (${fileSize} bytes)`);
        }
      } else {
        if (fileStream) {
          fileStream.write(chunk);
          receivedBytes += chunk.length;

          if (receivedBytes >= fileSize) {
            console.log("File received fully");
            fileStream.end();
            socket.end();
          }
        }
      }
    });

    socket.on("end", () => {
      console.log("Client disconnected");
      if (fileStream && !fileStream.closed) fileStream.end();
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
      if (fileStream && !fileStream.closed) fileStream.end();
    });
  });

  server.listen(FILE_RECEIVE_PORT, () => {
    console.log(`File receiver listening on port ${FILE_RECEIVE_PORT}`);
  });

  return server;
}

export default startFileReceiver;

# oytunito - File Transfer App

oytunito is a simple and efficient file transfer application that allows seamless sharing of files between devices.

![image](https://raw.githubusercontent.com/AhmetOytun/oytunito/refs/heads/main/screenshots/1.png)

## 🚀 Features

- Fast and secure file transfers
- Easy-to-use interface
- Cross-platform support (macOS & Windows)
- No internet connection required for local transfers

## 📚 Usage

1. **Open oytunito** on both the sender and receiver devices.

2. **Receiving a file:**

   - Click **Receive** and wait for a file.

   ![image](https://raw.githubusercontent.com/AhmetOytun/oytunito/refs/heads/main/screenshots/2.png)

3. **Sending a file:**

   - Click **Send** and wait for a receiver device to appear.
   - Select the file and the target device.
   - Click **Send** to start the transfer.

   ![image](https://raw.githubusercontent.com/AhmetOytun/oytunito/refs/heads/main/screenshots/3.png)

4. **Receiving the file:**

   - The received file will be saved in:
     ```
     Desktop/oytunito_uploads/files/(filename)
     ```

5. **That's it!** Your file transfer is complete. 🎉

---

## 🔧 Building oytunito from Source

If you'd like to build oytunito yourself, follow these steps:

1. Clone the repository:

   ```sh
   git clone https://github.com/AhmetOytun/oytunito
   ```

2. Navigate to the project folder:

   ```sh
   cd oytunito
   ```

3. Install dependencies:

   ```sh
   npm install
   ```

4. Build the application:

   - **For macOS (ARM64)**:
     ```sh
     npm run dist:mac
     ```
   - **For Windows (64-bit)**:
     ```sh
     npm run dist:win
     ```
   - **For Linux (64-bit)**:
     ```sh
     npm run dist:linux
     ```

5. Once the build is complete, your executable will be available in the `dist` folder.

---

Enjoy seamless file transfers with oytunito! 🚀

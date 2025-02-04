import { useEffect, useState } from "react";
import backButton from "../../assets/back-button.svg";
import { useNavigate } from "react-router-dom";

function SendPage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const getDevices = async () => {
    window.electron.getDevices().then((devices) => {
      setDevices(devices);
    });
  };

  const handleUpload = async () => {
    if (!file || !selectedDevice) {
      console.error("No movie file selected or no device chosen");
      return;
    }

    try {
      const CHUNK_SIZE = 10 * 1024 * 1024;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("chunkIndex", i.toString());
        formData.append("totalChunks", totalChunks.toString());
        formData.append("originalname", file.name);

        await fetch(
          `http://${selectedDevice.address}:${selectedDevice.expressPort}/upload-chunk`,
          {
            headers: { "X-File-Name": file.name },
            method: "POST",
            body: formData,
          }
        );

        setProgress(((i + 1) / totalChunks) * 100);
      }

      await fetch(
        `http://${selectedDevice.address}:${selectedDevice.expressPort}/merge-chunks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-File-Name": file.name,
          },
          body: JSON.stringify({ originalname: file.name, totalChunks }),
        }
      );

      alert("File has been sent successfully!");
      setProgress(0);
    } catch (e) {
      console.error("Error uploading file:", e);
    }
  };

  useEffect(() => {
    getDevices();
    const interval = setInterval(getDevices, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-800 flex flex-col items-center h-screen text-white">
      <img
        className="absolute top-8 left-8 w-8 h-8 hover:cursor-pointer"
        src={backButton}
        style={{ filter: "invert(1)" }}
        onClick={() => navigate("/")}
      />

      <h1 className="text-2xl font-semibold mt-6 mb-2">Device List</h1>

      <div className="w-80 h-54 border border-slate-600 rounded-lg p-2 overflow-y-auto">
        {devices.length > 0 ? (
          devices.map((device) => (
            <div key={device.name} className="flex items-center justify-center">
              <p
                className={`w-full text-center py-2 rounded-lg transition-all cursor-pointer ${
                  selectedDevice?.name === device.name
                    ? "bg-slate-700"
                    : "bg-slate-800"
                } hover:bg-slate-700`}
                onClick={() =>
                  setSelectedDevice(
                    selectedDevice?.name === device.name ? null : device
                  )
                }
              >
                {device.name}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No devices found</p>
        )}
      </div>

      <div className="flex items-center gap-x-5 mt-4">
        <label className="rounded-lg bg-slate-700 border border-slate-600 px-4 py-2 text-white text-center cursor-pointer transition-all hover:bg-slate-600 active:bg-slate-500">
          Select File
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <button
          className={`rounded-lg px-4 py-2 transition-all ${
            file && selectedDevice
              ? "bg-green-600 hover:bg-green-500 active:bg-green-400"
              : "bg-slate-700 border border-slate-600 hover:bg-slate-600 active:bg-slate-500 cursor-not-allowed"
          }`}
          onClick={handleUpload}
          disabled={!file || !selectedDevice}
        >
          Send File
        </button>
      </div>

      {progress > 0 && (
        <div className="w-80 mt-4 bg-gray-700 rounded-lg h-4">
          <div
            className="bg-green-500 h-4 rounded-lg transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {progress > 0 && (
        <p className="mt-1 text-sm">{Math.round(progress)}% Uploaded</p>
      )}
    </div>
  );
}

export default SendPage;

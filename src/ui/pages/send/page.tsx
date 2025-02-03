import { useEffect, useState } from "react";
import backButton from "../../assets/back-button.svg";
import { useNavigate } from "react-router-dom";

function SendPage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const getDevices = async () => {
    window.electron.getDevices().then((devices) => {
      setDevices(devices);
    });
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        console.error("No movie file selected");
        return;
      }
      const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB
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
          `http://${selectedDevice?.address}:${selectedDevice?.expressPort}/upload-chunk`,
          {
            headers: {
              "X-File-Name": file.name,
            },
            method: "POST",
            body: formData,
          }
        );
      }

      await fetch(
        `http://${selectedDevice?.address}:${selectedDevice?.expressPort}/merge-chunks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-File-Name": file.name,
          },
          body: JSON.stringify({ originalname: file.name, totalChunks }),
        }
      );

      alert("movieFile uploaded and merged successfully!");
    } catch (e) {
      console.error("Error uploading image:", e);
    }
  };

  useEffect(() => {
    getDevices();
    const interval = setInterval(() => {
      getDevices();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-800 items-center flex flex-col h-screen text-white">
      <img
        className="absolute top-8 left-8 w-8 h-8 hover:cursor-pointer"
        src={backButton}
        style={{ filter: "invert(1)" }}
        onClick={() => navigate("/")}
      />
      <h1 className="text-lg mb-2 mt-5">Device List</h1>
      <div className="w-80 h-64 border rounded-lg">
        {devices.map((device) => (
          <div key={device.name} className="flex items-center justify-center">
            <p
              className={`w-full text-center py-1 rounded-lg ${
                selectedDevice?.name === device.name
                  ? "bg-slate-700"
                  : "bg-slate-800"
              } hover:bg-slate-700 hover:cursor-pointer`}
              onClick={() => {
                if (selectedDevice?.name === device.name) {
                  setSelectedDevice(null);
                } else {
                  setSelectedDevice(device);
                }
              }}
            >
              {device.name}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-x-5">
        <label className="mt-4 rounded-lg bg-slate-700 border p-2 w-28 text-white text-center cursor-pointer inline-block">
          Select File
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
            }}
          />
        </label>
        <button
          className="mt-4 rounded-lg bg-slate-700 border p-2 w-28 cursor-pointer"
          onClick={handleUpload}
        >
          Send file
        </button>
      </div>
    </div>
  );
}

export default SendPage;

import { useEffect, useState } from "react";
import backButton from "../../assets/back-button.svg";
import { useNavigate } from "react-router-dom";

function SendPage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [progress] = useState<number | null>(null);

  const handleSelectFile = async () => {
    const path = await window.electronApi.openFileDialog();
    if (path) setFilePath(path);
  };

  const handleSendFile = async () => {
    if (!selectedDevice || !filePath) return;

    try {
      await window.fileTransfer.sendFile({
        ip: selectedDevice.addresses[0],
        port: selectedDevice.port,
        filePath,
      });

      console.log("File sent successfully");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    window.deviceDiscovery.start();

    const removeListener = window.deviceDiscovery.onDeviceFound((device) => {
      setDevices((prevDevices) => {
        if (device.event === "up") {
          const exists = prevDevices.some(
            (d) => d.name === device.name && d.host === device.host
          );
          if (!exists) {
            return [...prevDevices, device];
          }
          return prevDevices;
        }

        if (device.event === "down") {
          return prevDevices.filter(
            (d) => !(d.name === device.name && d.host === device.host)
          );
        }

        return prevDevices;
      });
    });

    return () => {
      removeListener();
      window.deviceDiscovery.stop();
      setDevices([]);
    };
  }, []);

  return (
    <div className="bg-slate-800 flex flex-col items-center h-screen text-white justify-center">
      <img
        className="absolute top-8 left-8 w-8 h-8 cursor-pointer hover:opacity-80"
        src={backButton}
        style={{ filter: "invert(1)" }}
        onClick={() => navigate("/")}
      />

      {progress === null && (
        <h1 className="text-2xl font-semibold mt-6 mb-2">Device List</h1>
      )}

      {progress === null && (
        <div className="w-80 h-54 border border-slate-600 rounded-lg p-2 overflow-y-auto">
          {devices.length > 0 ? (
            devices.map((device) => (
              <div
                key={device.name}
                className="flex items-center justify-center"
              >
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
      )}

      {progress === null && (
        <div className="flex items-center gap-x-5 mt-4">
          <button
            className="rounded-lg bg-slate-700 border border-slate-600 px-4 py-2 text-white text-center cursor-pointer transition-all hover:bg-slate-600 active:bg-slate-500"
            onClick={handleSelectFile}
          >
            {filePath
              ? `Selected: ${filePath.split(/(\\|\/)/g).pop()}`
              : "Select File"}
          </button>

          <button
            className={`rounded-lg px-4 py-2 transition-all ${
              filePath && selectedDevice
                ? "bg-green-600 hover:bg-green-500 active:bg-green-400 cursor-pointer"
                : "bg-slate-700 border border-slate-600 hover:bg-slate-600 active:bg-slate-500 cursor-not-allowed"
            }`}
            disabled={!filePath || !selectedDevice}
            onClick={handleSendFile}
          >
            Send File
          </button>
        </div>
      )}

      {progress !== null && (
        <div className="w-80 mt-4 bg-gray-700 rounded-lg h-4 overflow-hidden">
          <div
            className="bg-green-500 h-4 transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {progress !== null && (
        <p className="mt-1 text-sm">{Math.round(progress)}% Uploaded</p>
      )}
    </div>
  );
}

export default SendPage;

import { useEffect, useState } from "react";
import backButton from "../../assets/back-button.svg";
import { useNavigate } from "react-router-dom";

function SendPage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const handleSelectFile = async () => {
    const path = await window.electronApi.openFileDialog();
    if (path) setFilePath(path);
  };

  const handleSendFile = async () => {
    if (!selectedDevice || !filePath) return;

    setSending(true);
    setProgress(0);

    const removeListener = window.fileTransfer.onSendFileProgress((p) => {
      setProgress(p);
    });

    const ipv4 = selectedDevice.addresses.find((addr) =>
      /^\d{1,3}(\.\d{1,3}){3}$/.test(addr)
    );

    if (!ipv4) {
      window.electronApi.showMessageDialog({
        title: "Error",
        message: "No valid IPv4 address found for the selected device.",
      });
      removeListener();
      setSending(false);
      setProgress(null);
      setFilePath(null);
      return;
    }

    try {
      await window.fileTransfer.sendFile({
        ip: ipv4,
        port: selectedDevice.port,
        filePath,
      });

      await window.electronApi.showMessageDialog({
        title: "Success",
        message: "File has been sent successfully!",
      });
    } catch (err) {
      console.error(err);
    } finally {
      removeListener();
      setSending(false);
      setProgress(null);
      setFilePath(null);
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

      {sending === false && (
        <h1 className="text-2xl font-semibold mt-6 mb-2">Device List</h1>
      )}

      {sending === false && (
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

      {sending === false && (
        <div className="flex items-center gap-x-5 mt-4">
          <button
            className="rounded-lg bg-slate-700 border border-slate-600 px-4 py-2 text-white text-center cursor-pointer transition-all hover:bg-slate-600 active:bg-slate-500"
            onClick={handleSelectFile}
          >
            {filePath ? `File Selected` : "Select File"}
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

      {sending === true && (
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

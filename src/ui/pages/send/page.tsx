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
      <h1 className="text-lg mb-2 mt-10">Device List</h1>
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
    </div>
  );
}

export default SendPage;

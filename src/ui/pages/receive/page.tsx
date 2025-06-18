import { useNavigate } from "react-router-dom";
import backButton from "../../assets/back-button.svg";
import { useEffect, useState } from "react";

function ReceivePage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    window.deviceDiscovery.startBroadcast();
    window.fileTransfer.startFileReceiver();

    const removeProgress = window.fileTransfer.onReceiveFileProgress((p) => {
      setProgress(Math.floor(p));
    });
    const removeComplete = window.fileTransfer.onReceiveFileComplete(() => {
      window.electronApi.showMessageDialog({
        title: "Success",
        message: "File has been received successfully!",
      });
      setProgress(null);
    });
    const removeError = window.fileTransfer.onReceiveFileError((msg) => {
      window.electronApi.showMessageDialog({
        title: "Error",
        message: `Failed to receive file: ${msg}`,
      });
      setProgress(null);
    });

    return () => {
      window.deviceDiscovery.stopBroadcast();
      window.fileTransfer.stopFileReceiver();
      removeProgress();
      removeComplete();
      removeError();
    };
  }, []);

  return (
    <div className="bg-slate-800 flex flex-col items-center justify-center h-screen text-white">
      <img
        className="absolute top-8 left-8 w-8 h-8 cursor-pointer hover:opacity-80"
        src={backButton}
        style={{ filter: "invert(1)" }}
        onClick={() => navigate("/")}
      />

      <h1 className="text-xl font-semibold mt-4">
        {progress !== null
          ? `Receiving File: ${progress}%`
          : "Waiting for a file..."}
      </h1>

      {progress !== null && (
        <div className="w-80 mt-4 bg-gray-700 rounded-lg h-4 overflow-hidden">
          <div
            className="bg-green-500 h-4 transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

export default ReceivePage;

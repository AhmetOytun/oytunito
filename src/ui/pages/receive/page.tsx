import { useNavigate } from "react-router-dom";
import backButton from "../../assets/back-button.svg";
import { useEffect, useState } from "react";

function ReceivePage() {
  const navigate = useNavigate();

  const handleStartServer = () => {
    window.electron.startServer();
  };

  useEffect(() => {
    handleStartServer();
  }, []);

  return (
    <div className="bg-slate-800 items-center justify-center flex flex-col h-screen text-white">
      <img
        className="absolute top-8 left-8 w-8 h-8 hover:cursor-pointer"
        src={backButton}
        style={{ filter: "invert(1)" }}
        onClick={() => {
          navigate("/");
        }}
      />
      <h1>Waiting for a file...</h1>
    </div>
  );
}

export default ReceivePage;

import { useState } from "react";

function App() {
  const [serverStatus, setServerStatus] = useState("Server is not running");

  const handleToggleServer = () => {
    window.electron.toggleServer();

    window.electron.getServerStatus().then((status) => {
      setServerStatus(status ? "Server is running" : "Server is not running");
    });
  };

  return (
    <div>
      <h1>HAHA</h1>
      <button onClick={handleToggleServer}>{serverStatus}</button>
    </div>
  );
}

export default App;

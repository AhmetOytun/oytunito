import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/page";
import SendPage from "./pages/send/page";
import ReceivePage from "./pages/receive/page";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/send" element={<SendPage />} />
      <Route path="/receive" element={<ReceivePage />} />
    </Routes>
  );
}

export default App;

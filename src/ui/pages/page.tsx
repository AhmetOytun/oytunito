import { useNavigate } from "react-router-dom";
import monaIcon from "../assets/desktopicon.png";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-800 items-center flex flex-col h-screen text-white">
      <img className="w-30 mb-4 mt-16" src={monaIcon} />
      <h1 className="text-5xl font-bold mb-16">Oytunito.</h1>
      <div className="w-full flex justify-evenly">
        <button
          className="w-44 py-3 px-6 text-lg font-semibold rounded-lg transition-all duration-300 bg-slate-700 border border-slate-600 hover:bg-slate-600 hover:border-slate-500 shadow-md cursor-pointer"
          onClick={() => {
            navigate("/send");
          }}
        >
          Send a file
        </button>
        <button
          className="w-44 py-3 px-6 text-lg font-semibold rounded-lg transition-all duration-300 bg-slate-700 border border-slate-600 hover:bg-slate-600 hover:border-slate-500 shadow-md cursor-pointer"
          onClick={() => {
            navigate("/receive");
          }}
        >
          Receive a file
        </button>
      </div>
    </div>
  );
}

export default HomePage;

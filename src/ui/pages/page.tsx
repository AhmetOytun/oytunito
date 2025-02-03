import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-800 items-center flex flex-col h-screen text-white">
      <h1 className="text-5xl text-white my-10">Top Text.</h1>
      <p className="mb-10 mx-4">
        Description Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Assumenda necessitatibus beatae ullam magni vel, molestias maxime odit
        debitis eligendi facilis!
      </p>
      <div className="w-full flex justify-evenly">
        <button
          className="border p-2 rounded-lg w-44"
          onClick={() => {
            navigate("/send");
          }}
        >
          Send a file ⬆️
        </button>
        <button
          className="border p-2 rounded-lg w-44"
          onClick={() => {
            navigate("/receive");
          }}
        >
          Receive a file ⬇️
        </button>
      </div>
    </div>
  );
}

export default HomePage;

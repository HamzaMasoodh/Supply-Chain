import React, { useState, useEffect } from "react";
import Tool from "../../components/Tool";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Home = ({ setuser }) => {
  const [navbarOpen, setNavbarOpen] = React.useState(false);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        if (!navigator.onLine) {
          return toast.error("No Internet Connection!");
        }
      } catch (err) {
        toast.error(err.message)
      }
    }, 6000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <nav className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-500 relative flex flex-wrap items-center justify-between px-2 py-3 text-white rounded-xl">
        <div className="container px-4 mx-auto ">
          <div className="w-full relative flex justify-between lg:w-auto">
            <Link
              className="text-lg md:text-3xl font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap text-white cursor-pointer outline-none focus:outline-none"
              to="/Home"
            >
              Supply Chain Tool
            </Link>
            <Link
              className="text-lg md:text-3xl font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap text-white cursor-pointer outline-none focus:outline-none"
              to="/chat"
            >
              Chat
            </Link>
            <button
              className="text-white cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              <i className="fa fa-bars"></i>
            </button>
          </div>
          <div
            className={
              "flex flex-col items-center justify-center lg:flex flex-grow items-center border-t-2 border-white lg:border-none p-6 lg:p-0" +
              (navbarOpen ? " flex" : " hidden")
            }
          >
          </div>
        </div>
      </nav>
      <div className="grid gap-4 mt-5">
        <Tool toolname={"automation"} heading={"Automation"} gradient={"bg-gradient-to-r from-cyan-500 to-blue-500"} />
      </div>
    </>
  );
};
export default Home;

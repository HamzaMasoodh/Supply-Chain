import React, { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const App = () => {

  return (
    <BrowserRouter>
      <div className="max-w-[1500px] mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" />}></Route>
        </Routes>
      </div>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;

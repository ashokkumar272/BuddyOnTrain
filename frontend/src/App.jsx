import React from 'react';
import { TrainProvider } from './context/Context';
import Home from "./pages/Home"
import Login from "./pages/Login"
import Navbar from "./components/Navbar"
import { Routes, Route } from "react-router-dom";
import Hero from './components/Hero';

function App() {
  return (
    <TrainProvider>
      <div className="App">
        <Navbar/>
        <Routes>
          <Route path="/" element = {<Home/>}/>
          <Route path="/login" element ={<Login/>}/>
        </Routes>
      </div>
    </TrainProvider>
  );
}

export default App;

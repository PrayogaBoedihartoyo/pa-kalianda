import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation"; // ini akan jadi halaman Home
import FormulirPengambilan from "./components/FormulirPengambilan";
import FormulirEAC from "./components/FormulirEAC";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigation />} />          {/* Home menu */}
        <Route path="/pengambilan" element={<FormulirPengambilan />} />
        <Route path="/eac" element={<FormulirEAC />} />
      </Routes>
    </Router>
  );
}
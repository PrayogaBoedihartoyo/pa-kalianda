import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import FormulirPengambilan from './components/FormulirPengambilan';
import FormulirEAC from './components/FormulirEAC';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<FormulirPengambilan />} />
          <Route path="/eac" element={<FormulirEAC />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
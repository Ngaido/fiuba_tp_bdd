import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import ItemManagerSQL from "./ItemManagerSQL";
import ItemManagerNoSQL from "./ItemManagerNoSQL.jsx";
import "./App.css"; // Asegúrate de tener este archivo de estilos

function App() {
  return (
    <Router>
      <div className="app-container">
        <h1 className="title">Gestión de Productos</h1>
        <div className="button-container">
          <Link to="/sql" className="button sql-button">
            Gestionar Productos SQL
          </Link>
          <Link to="/nosql" className="button nosql-button">
            Gestionar Productos NoSQL
          </Link>
        </div>
        <Routes>
          <Route path="/sql" element={<ItemManagerSQL />} />
          <Route path="/nosql" element={<ItemManagerNoSQL />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


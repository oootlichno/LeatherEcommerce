import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import LeatherPage from "./pages/Leather_category";
import HandToolsPage from "./pages/Handtools_category";
import MoldsPage from "./pages/Mold_category";
import ProductPage from "./pages/ProductPage";


function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leather" element={<LeatherPage />} />
          <Route path="/handtools" element={<HandToolsPage />} />
          <Route path="/molds" element={<MoldsPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

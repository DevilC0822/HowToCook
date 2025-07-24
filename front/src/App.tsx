import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Tips from "./pages/Tips";
import TipDetail from "./pages/TipDetail";
import StarSystem from "./pages/StarSystem";
import StarSystemDetail from "./pages/StarSystemDetail";
import Dishes from "./pages/Dishes";
import DishDetail from "./pages/DishDetail";
import Favorites from "./pages/Favorites";
import { AppCacheProvider } from "./contexts/AppCacheContext";

function App() {
  return (
    <AppCacheProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/tips/:id" element={<TipDetail />} />
          <Route path="/starsystem" element={<StarSystem />} />
          <Route path="/starsystem/:id" element={<StarSystemDetail />} />
          <Route path="/dishes" element={<Dishes />} />
          <Route path="/dishes/:filePath" element={<DishDetail />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </Layout>
    </AppCacheProvider>
  );
}

export default App;

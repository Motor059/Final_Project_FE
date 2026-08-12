import { BrowserRouter, Routes, Route} from "react-router-dom";
import StyleGuide from "./pages/StyleGuide";
import Interview from "./pages/Interview";
import History from "./pages/History";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StyleGuide />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}
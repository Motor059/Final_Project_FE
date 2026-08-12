import { BrowserRouter, Routes, Route} from "react-router-dom";
import StyleGuide from "./pages/StyleGuide";
import Interview from "./pages/Interview";
import Setup from "./pages/Setup";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StyleGuide />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/interview" element={<Interview />} />
      </Routes>
    </BrowserRouter>
  );
}
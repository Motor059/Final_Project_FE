import { BrowserRouter, Routes, Route} from "react-router-dom";
import StyleGuide from "./pages/StyleGuide";
import Interview from "./pages/Interview";
import ReportPage from "./pages/Report";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StyleGuide />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}
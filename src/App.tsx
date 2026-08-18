import { BrowserRouter, Routes, Route} from "react-router-dom";
import StyleGuide from "./pages/StyleGuide";
import Interview from "./pages/Interview";
import MyPage from "./pages/MyPage";
import Setup from "./pages/Setup";
import ReportPage from "./pages/Report";
import HomePage from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<StyleGuide />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </BrowserRouter>
  );
}
import { BrowserRouter, Routes, Route} from "react-router-dom";
import StyleGuide from "./pages/StyleGuide";
import Interview from "./pages/Interview";
import History from "./pages/History";
import MyPage from "./pages/MyPage";
import Setup from "./pages/Setup";
import ReportPage from "./pages/Report";
import HomePage from "./pages/Home";
import KakaoCallback from "./pages/KakaoCallback";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<StyleGuide />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/history" element={<History />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/oauth/callback/kakao" element={<KakaoCallback />} />
      </Routes>
    </BrowserRouter>
  );
}
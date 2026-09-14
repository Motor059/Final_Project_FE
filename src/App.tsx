import { BrowserRouter, Routes, Route} from "react-router-dom";
import Interview from "./pages/Interview";
import History from "./pages/History";
import MyPage from "./pages/MyPage";
import Setup from "./pages/Setup";
import ReportPage from "./pages/Report";
import HomePage from "./pages/Home";
import KakaoCallback from "./pages/KakaoCallback";
import GlobalAlertModal from "@/components/common/GlobalAlertModal";

export default function App() {
  return (
    <BrowserRouter>
      <GlobalAlertModal />
      <Routes>
        <Route path="/" element={<HomePage />} />
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
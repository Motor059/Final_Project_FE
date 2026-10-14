import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Interview from "./pages/Interview";
import History from "./pages/History";
import MyPage from "./pages/MyPage";
import Setup from "./pages/Setup";
import ReportPage from "./pages/Report";
import HomePage from "./pages/Home";
import KakaoCallback from "./pages/KakaoCallback";
import GlobalAlertModal from "@/components/common/GlobalAlertModal";

const router = createBrowserRouter([
  {
    element: <><GlobalAlertModal /><Outlet /></>,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/setup", element: <Setup /> },
      { path: "/interview", element: <Interview /> },
      { path: "/history", element: <History /> },
      { path: "/mypage", element: <MyPage /> },
      { path: "/report", element: <ReportPage /> },
      { path: "/oauth/callback/kakao", element: <KakaoCallback /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

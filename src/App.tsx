import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Interview from "./pages/Interview";
import History from "./pages/History";
import MyPage from "./pages/MyPage";
import MyPagePreview from "./pages/MyPagePreview";
import ArchivePreviewSessionSync from "@/components/archive/ArchivePreviewSessionSync";
import Setup from "./pages/Setup";
import PTPreparation from "./pages/PTPreparation";
import PTPresentation from "./pages/PTPresentation";
import ReportPage from "./pages/Report";
import ReportPreview from "./pages/ReportPreview";
import HomePage from "./pages/Home";
import KakaoCallback from "./pages/KakaoCallback";
import GlobalAlertModal from "@/components/common/GlobalAlertModal";
import Archive from "./pages/Archive";

const router = createBrowserRouter([
  {
    element: (
      <>
        <ArchivePreviewSessionSync />
        <GlobalAlertModal />
        <Outlet />
      </>
    ),
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/setup", element: <Setup /> },
      { path: "/pt/preparation", element: <PTPreparation /> },
      { path: "/pt/presentation", element: <PTPresentation /> },
      { path: "/interview", element: <Interview /> },
      { path: "/archive", element: <Archive /> },
      { path: "/archive/preview", element: <Archive preview /> },
      { path: "/history", element: <History /> },
      { path: "/mypage", element: <MyPage /> },
      { path: "/mypage/preview", element: <MyPagePreview /> },
      { path: "/report", element: <ReportPage /> },
      { path: "/report/preview", element: <ReportPreview /> },
      { path: "/oauth/callback/kakao", element: <KakaoCallback /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
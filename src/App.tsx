import { BrowserRouter, Routes, Route} from "react-router-dom";
import StyleGuide from "./pages/StyleGuide";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StyleGuide />} />
      </Routes>
    </BrowserRouter>
  );
}
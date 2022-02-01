import { Route, Routes, BrowserRouter } from "react-router-dom";
import SingleVaultPage from "./pages/SingleVault";
import DefaultPage from "./pages/Default";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" exact={true} element={<DefaultPage />}></Route>
          <Route path="/vault" element={<SingleVaultPage />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

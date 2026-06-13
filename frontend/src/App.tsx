import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ListagemPage } from "./pages/ListagemPage";
import { CadastroPage } from "./pages/CadastroPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListagemPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/editar/:id" element={<CadastroPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;

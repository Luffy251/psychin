import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <div className="app-orb orb-1"></div>
      <div className="app-orb orb-2"></div>
      <div className="app-orb orb-3"></div>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useThemeStore } from "./store/useThemeStore";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { theme } = useThemeStore();

  return (
    <div data-theme={theme}>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;

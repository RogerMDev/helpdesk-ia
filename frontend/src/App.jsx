import AuthProvider from "./context/AuthContext.jsx"; // o sin .jsx
import AppRouter from "./router/AppRouter.jsx";       // o sin .jsx

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

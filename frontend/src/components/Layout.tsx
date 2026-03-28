import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <Outlet />
      </main>
      <footer className="footer footer-center p-4 bg-base-100 text-base-content border-t border-base-200">
        <p className="text-sm text-base-content/50">
          © 2026 ViBuild — AI-Powered Project Generator
        </p>
      </footer>
    </div>
  );
}

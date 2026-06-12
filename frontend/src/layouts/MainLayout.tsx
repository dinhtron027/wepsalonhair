import { ReactNode, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  // simple scroll-to-top on route change handled by AnimatePresence key in App
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-pink-50 text-slate-900">
      <Navbar />
      <main className="pt-20 lg:pt-24 overflow-hidden">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;

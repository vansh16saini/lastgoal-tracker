// src/app/layout.js
import '../styles/globals.css';
import { Inter } from "next/font/google";
//import AuthProvider from "@/components/AuthProvider"; // ✅ Make sure this is correct path

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LastGoal Tracker",
  description: "Track and smash your goals!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

// src/app/layout.js
import '../styles/globals.css';
import { Inter } from "next/font/google";
// Corrected import path and capitalization
import AuthProvider from "@/components/Authprovider"; // <-- CORRECTED HERE

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LastGoal Tracker",
  description: "Track and smash your goals!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
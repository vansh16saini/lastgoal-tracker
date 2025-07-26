// src/app/layout.js
import '../styles/globals.css';
import { Inter } from "next/font/google";
import AuthProvider from "@/components/Authprovider"; // <-- UNCOMMENT THIS LINE

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LastGoal Tracker",
  description: "Track and smash your goals!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {/* <-- WRAP CHILDREN WITH AUTHPROVIDER */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
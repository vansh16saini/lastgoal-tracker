'use client';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Logo or Title */}
      <Link href="/dashboard">
        <h1 className="text-xl font-bold text-blue-600 hover:opacity-80 transition">
          LastGoal Tracker
        </h1>
      </Link>

      {/* Right side user info */}
      {session?.user ? (
        <div className="flex items-center gap-4">
          {/* User Name */}
          <p className="text-sm font-medium text-gray-700 hidden sm:block">
            {session.user.name}
          </p>

          {/* Profile Image */}
          {session.user.image && (
            <Image
              src={session.user.image}
              alt="Profile"
              width={36}
              height={36}
              className="rounded-full"
            />
          )}

          {/* Logout Button */}
          <button
            onClick={() => signOut()}
            className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link href="/login">
          <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Login
          </button>
        </Link>
      )}
    </nav>
  );
};

export default Navbar;

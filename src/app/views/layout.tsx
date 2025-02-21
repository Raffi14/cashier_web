"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MenuIcon } from "lucide-react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState("");

  useEffect(() => {
    const roleFromCookie = Cookies.get("role");
    if (roleFromCookie) {
      setRole(roleFromCookie);
    }
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full relative">
        <AppSidebar className="w-64 transition-all duration-300" />
        <div className="flex-1 flex flex-col">
          <header className="flex items-center justify-between bg-white dark:bg-gray-800 border-b p-4 fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4 p-2 -mt-1 absolute bg-gray-800 text-white rounded-md">
                <MenuIcon />
              </SidebarTrigger>
              <span className="ml-12 text-2xl font-bold text-gray-900 dark:text-gray-100">
                Hai, {role}!
              </span>
            </div>
          </header>
          <main className="flex-1 mt-16 overflow-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useState } from "react";
import { MenuIcon } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [activeItem, setActiveItem] = useState('/views/product');
  const handleItemSelect = (url: any) => {
    setActiveItem(url);
  };

  return (
    <SidebarProvider>
      <AppSidebar className="w-64" activeItem={activeItem} onItemSelect={handleItemSelect}/>
      <div className="flex-1 relative">
        <SidebarTrigger className="absolute top-5 left-[-15px] z-50 p-2 bg-gray-800 text-white rounded-md">
          <MenuIcon />
        </SidebarTrigger>
        {children}
      </div>
    </SidebarProvider>
  )
}

"use client"

import * as React from "react"
import {
  Box,
  HistoryIcon,
  Package,
  ReceiptTextIcon,
  UserPlus2,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-log_out"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleTrigger } from "./ui/collapsible"
import Cookies from "js-cookie"
import { useEffect, useState } from "react"

const getNavItems = (role: string | undefined) => {
  const menu = [
    { title: "Produk", url: "/views/product", icon: Box },
    { title: "Pelanggan", url: "/views/customer", icon: Users },
    { title: "Transaksi", url: "/views/transaction", icon: ReceiptTextIcon },
    { title: "Riwayat Transaksi", url: "/views/history", icon: HistoryIcon },
    { title: "Pengguna", url: "/views/user", icon: UserPlus2 },
  ];

  return role === "petugas" ? menu.filter(item => item.title !== "Pengguna") : menu;
};

export function AppSidebar({ ...props }) {
  const [navMain, setNavMain] = useState<{ title: string; url: string; icon: any }[]>([]);

  useEffect(() => {
    const role = Cookies.get("role");
    setNavMain(getNavItems(role));
  }, []);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center h-16">
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

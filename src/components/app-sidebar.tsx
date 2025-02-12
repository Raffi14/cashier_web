"use client"

import * as React from "react"
import {
  Box,
  Package,
  ReceiptTextIcon,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

const data = {
  navMain: [
    {
      title: "Products",
      url: "/views/product",
      icon: Box,
    },
    {
      title: "Customers",
      url: "/views/customer",
      icon: Users,
    },
    {
      title: "Transactions",
      url: "/views/transaction",
      icon: ReceiptTextIcon,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeItem: string;
  onItemSelect: (url: string) => void;
}

export function AppSidebar({ activeItem, onItemSelect, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center border-b-2 p-4 h-16">
        <Collapsible className="group/collapsible">
          <SidebarMenuItem className="flex">
            <CollapsibleTrigger asChild>
              <SidebarMenuSub className="border-none">
              <span className="block text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
                SwiftPOS
              </span>
              </SidebarMenuSub>
            </CollapsibleTrigger>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} activeItem={activeItem} onItemSelect={onItemSelect} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

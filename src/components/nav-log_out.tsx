"use client"

import {
  LogOut,
} from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleTrigger } from "./ui/collapsible"

export function NavUser(){
  return (
    <SidebarMenu>
      <Collapsible className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className="w-full flex justify-center items-center gap-2 px-4 py-3 
                        border-2 rounded-lg font-medium 
                        hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                        tooltip="Log out"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-center">Log out</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  )
}

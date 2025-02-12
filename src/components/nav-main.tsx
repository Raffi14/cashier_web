"use client"

import { type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface NavMainProps {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
  activeItem: string;
  onItemSelect: (url: string) => void;
}

export function NavMain({ items, activeItem, onItemSelect }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            className="group/collapsible"
          >
            <a href={item.url}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all 
                              hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                activeItem === item.url ? 'bg-gray-200 dark:bg-gray-700' : ''
                                }`}
                              key={item.url}
                              onClick={() => onItemSelect(item.url)}
                                >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
            </a>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

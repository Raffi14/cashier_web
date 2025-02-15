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
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NavMainProps {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}

export function NavMain({ items}: NavMainProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  useEffect(() => {
    setActiveItem(pathname);
  }, [pathname]);
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
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all 
                              hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                pathname === item.url ? 'bg-gray-200 dark:bg-gray-700' : ''
                                }`}
                              key={item.url}
                              onClick={() => router.push(item.url)}
                                >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

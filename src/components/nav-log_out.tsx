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
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { AlertDialogHeader, AlertDialogFooter } from "./ui/alert-dialog"

export function NavUser(){
  const router = useRouter();
  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };
  return (
    <SidebarMenu>
      <Collapsible className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
          <AlertDialog>
              <AlertDialogTrigger asChild>
                <SidebarMenuButton
                  className="w-full flex justify-center items-center gap-2 px-4 py-3 
                            border-2 rounded-lg font-medium 
                            hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  tooltip="Log out"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-center">Log out</span>
                </SidebarMenuButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah kamu yakin ingin logout? Semua sesi akan diakhiri.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CollapsibleTrigger>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  )
}

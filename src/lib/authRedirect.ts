"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export default function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    const token = Cookies.get("token");
    
    if (token && pathname === "/login") {
      router.replace("/views/product");
    }
  }, [pathname]);

  return null;
}

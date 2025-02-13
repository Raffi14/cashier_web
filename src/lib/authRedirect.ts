"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export default function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    const token = Cookies.get("token");

    if (!token && pathname !== "/login") {
      router.push("/login");
    }

    if (!token && pathname == "/") {
      router.push("/");
    }

    if (token && pathname === "/login") {
      router.push("/views/product");
    }
  }, [pathname]);

  return null
}

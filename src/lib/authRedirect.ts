"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export default function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    console.log("AuthGuard Running"); // Debugging pertama

    const token = Cookies.get("token");
    console.log("Token:", token); // Debugging kedua

    if (!token && pathname !== "/login") {
      console.log("Redirecting to /login");
      router.replace("/login");
    }

    if (token && pathname === "/login") {
      console.log("Redirecting to /views/product");
      router.replace("/views/product");
    }
  }, [pathname]);

  return null;
}

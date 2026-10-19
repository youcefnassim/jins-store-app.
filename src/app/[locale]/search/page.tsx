"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";

export default function SearchPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/games");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
      Redirection vers le catalogue des jeux...
    </div>
  );
}

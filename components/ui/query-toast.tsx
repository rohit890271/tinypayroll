"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useToast } from "./toast";

function QueryToastInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { error: toastError, success: toastSuccess } = useToast();

  useEffect(() => {
    const errorMsg = searchParams.get("error");
    const successMsg = searchParams.get("success");

    if (errorMsg) {
      toastError(errorMsg);
    }
    if (successMsg) {
      toastSuccess(successMsg);
    }

    if (errorMsg || successMsg) {
      // Clean up the URL search params without triggering a reload
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      params.delete("success");
      
      const query = params.toString();
      const newUrl = query ? `${pathname}?${query}` : pathname;
      router.replace(newUrl);
    }
  }, [searchParams, pathname, router, toastError, toastSuccess]);

  return null;
}

export function QueryToast() {
  return (
    <Suspense fallback={null}>
      <QueryToastInner />
    </Suspense>
  );
}

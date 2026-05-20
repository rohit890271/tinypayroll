"use client";

import { useTransition } from "react";
import { manageSubscriptionAction } from "@/app/billing/manage/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ManageButton() {
  const [isPending, startTransition] = useTransition();
  const { error } = useToast();

  const handleManage = () => {
    startTransition(async () => {
      try {
        await manageSubscriptionAction();
      } catch (err: any) {
        if (err.message && err.message.includes("NEXT_REDIRECT")) {
          throw err;
        }
        error(err?.message || "Something went wrong. Try again.");
      }
    });
  };

  return (
    <Button onClick={handleManage} loading={isPending} variant="primary">
      Manage Subscription
    </Button>
  );
}

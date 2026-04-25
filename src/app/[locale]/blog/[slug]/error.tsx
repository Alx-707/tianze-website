"use client";

import { useTranslations } from "next-intl";
import { RouteErrorView } from "@/components/errors/route-error-view";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogDetailRouteError({
  error,
  reset,
}: RouteErrorProps) {
  const t = useTranslations("errors.blog");
  return (
    <RouteErrorView
      error={error}
      reset={reset}
      logContext="BlogDetail"
      translationFn={t}
    />
  );
}

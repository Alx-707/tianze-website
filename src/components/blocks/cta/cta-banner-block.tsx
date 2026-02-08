"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CTABannerBlockProps {
  className?: string;
  i18nNamespace?: string;
}

export function CTABannerBlock({
  className,
  i18nNamespace = "home.cta",
}: CTABannerBlockProps) {
  const t = useTranslations(i18nNamespace);

  return (
    <section
      className={cn(
        "bg-gradient-to-r from-primary to-primary/80 py-16 sm:py-20",
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-6 text-center sm:flex-row sm:gap-8">
          <p className="text-lg font-medium text-primary-foreground sm:text-xl">
            {t("message")}
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/contact" className="flex items-center gap-2">
              {t("button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

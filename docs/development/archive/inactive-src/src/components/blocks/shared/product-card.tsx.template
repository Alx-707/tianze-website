import Image from "next/image";
// eslint-disable-next-line no-restricted-imports -- receives locale-prefixed href as prop, i18n Link would double-prefix
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ProductCardProps {
  image: { src: string; alt: string };
  title: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  isPrimary?: boolean;
  className?: string;
}

export function ProductCard({
  image,
  title,
  features,
  buttonText,
  buttonHref,
  isPrimary = false,
  className,
}: ProductCardProps) {
  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              {feature}
            </li>
          ))}
        </ul>
        <Button
          variant={isPrimary ? "default" : "outline"}
          className="w-full"
          asChild
        >
          <Link
            href={buttonHref}
            className="flex items-center justify-center gap-2"
          >
            {buttonText}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

import Image from "next/image";

import { cn } from "@/lib/utils";

export interface CarouselImage {
  src: string;
  alt: string;
}

export interface ImageCarouselProps {
  images: CarouselImage[];
  className?: string;
}

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  return (
    <div
      data-scroll-container
      className={cn(
        "flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide",
        "md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0",
        className
      )}
    >
      {images.map((image) => (
        <div
          key={image.src}
          className="relative aspect-[4/3] min-w-[280px] flex-shrink-0 snap-center overflow-hidden rounded-xl md:min-w-0"
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 280px, 33vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

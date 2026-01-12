import { cn } from "@/lib/utils";
import {
  TestimonialCard,
  type Testimonial,
} from "@/components/trust/testimonial-card";

export interface TestimonialsSectionProps {
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle: string | undefined;
  /** Testimonials to display */
  testimonials: Testimonial[];
  /** Custom class name */
  className?: string;
}

/**
 * Testimonials section component.
 * Displays a grid of client testimonials for trust building.
 */
export function TestimonialsSection({
  title,
  subtitle,
  testimonials,
  className,
}: TestimonialsSectionProps) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-12 md:py-16", className)}>
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-2xl font-bold">{title}</h2>
          {subtitle !== undefined && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

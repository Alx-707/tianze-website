import { notFound } from "next/navigation";

/**
 * Catch-all route for unmatched paths under /[locale]/...
 *
 * Without this, Next.js renders its default 404 page instead of
 * the custom not-found.tsx in the [locale] segment. This ensures
 * users see the localized 404 page with a "Go Home" button.
 */
export default function CatchAllNotFound() {
  notFound();
}

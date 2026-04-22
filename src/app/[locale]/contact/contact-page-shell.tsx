import { Card } from "@/components/ui/card";
import {
  SINGLE_SITE_CONTACT_PAGE_FALLBACK,
  getSingleSiteContactPageFallbackCopy,
} from "@/config/single-site-page-expression";

export function getContactPageFallbackCopy(locale: string) {
  return getSingleSiteContactPageFallbackCopy(locale);
}

export function ContactFormFallback({
  title,
  description,
  labels,
}: {
  title: string;
  description: string;
  labels: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    subject: string;
    message: string;
    acceptPrivacy: string;
    submit: string;
  };
}) {
  return (
    <Card className="mx-auto w-full max-w-2xl">
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>{labels.firstName}</span>
              <input
                className="flex h-10 w-full rounded-xl border border-input bg-transparent px-4 py-1 text-base md:text-sm"
                autoComplete="given-name"
                disabled
                name="firstName"
                required
                type="text"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>{labels.lastName}</span>
              <input
                className="flex h-10 w-full rounded-xl border border-input bg-transparent px-4 py-1 text-base md:text-sm"
                autoComplete="family-name"
                disabled
                name="lastName"
                required
                type="text"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>{labels.email}</span>
              <input
                className="flex h-10 w-full rounded-xl border border-input bg-transparent px-4 py-1 text-base md:text-sm"
                autoComplete="email"
                disabled
                name="email"
                required
                type="email"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>{labels.company}</span>
              <input
                className="flex h-10 w-full rounded-xl border border-input bg-transparent px-4 py-1 text-base md:text-sm"
                autoComplete="organization"
                disabled
                name="company"
                required
                type="text"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm">
            <span>{labels.subject}</span>
            <input
              className="flex h-10 w-full rounded-xl border border-input bg-transparent px-4 py-1 text-base md:text-sm"
              autoComplete="off"
              disabled
              name="subject"
              type="text"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span>{labels.message}</span>
            <textarea
              className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              autoComplete="off"
              disabled
              name="message"
              required
              rows={4}
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              className="h-4 w-4 rounded border border-input"
              disabled
              name="acceptPrivacy"
              required
              type="checkbox"
            />
            <span>{labels.acceptPrivacy}</span>
          </label>

          <button
            className="inline-flex h-[38px] w-full items-center justify-center rounded-[6px] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground opacity-80"
            disabled
            type="submit"
          >
            {labels.submit}
          </button>
        </form>
      </div>
    </Card>
  );
}

export function ContactFaqFallback({
  title,
  items,
}: {
  title: string;
  items: Array<{ key: string; question: string; answer: string }>;
}) {
  return (
    <section className="section-divider py-14 md:py-[72px]">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="mb-9">
          <h2 className="text-[32px] font-bold leading-[1.2] tracking-[-0.02em]">
            {title}
          </h2>
        </div>
        <div className="rounded-xl border bg-card">
          {items.map((item, index) => (
            <details
              key={item.key}
              className={index === 0 ? "" : "border-t border-border"}
            >
              <summary className="cursor-pointer px-6 py-4 text-left text-sm font-medium">
                {item.question}
              </summary>
              <div className="px-6 pb-4 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-12 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {title}
        </span>
      </h1>
      <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function ContactPageFallback({
  locale,
  siteKey = SINGLE_SITE_CONTACT_PAGE_FALLBACK.siteKey,
}: {
  locale: string;
  siteKey?: typeof SINGLE_SITE_CONTACT_PAGE_FALLBACK.siteKey;
}) {
  const fallbackCopy = getContactPageFallbackCopy(locale);

  return (
    <div className="min-h-[80vh] px-4 py-16" data-site-key={siteKey}>
      <div className="mx-auto max-w-4xl space-y-8">
        <ContactPageHeader
          title={fallbackCopy.title}
          description={fallbackCopy.description}
        />
        <ContactFormFallback
          title={fallbackCopy.formTitle}
          description={fallbackCopy.formDescription}
          labels={fallbackCopy.labels}
        />
      </div>
    </div>
  );
}

export function ContactSidebarFallback() {
  return (
    <div className="space-y-6">
      <Card className="min-h-[220px] p-6" />
      <Card className="min-h-[160px] p-6" />
    </div>
  );
}

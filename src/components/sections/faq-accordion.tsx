"use client";

import { ChevronDownIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqAccordionProps {
  items: Array<{
    key: string;
    question: string;
    answer: string;
  }>;
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <Accordion
      type="multiple"
      className="notranslate divide-y-0 rounded-lg border-0 bg-card shadow-card"
      data-testid="faq-accordion"
      translate="no"
    >
      {items.map((item) => (
        <AccordionItem
          key={item.key}
          value={item.key}
          className="border-b-0 border-t border-border first:border-t-0"
        >
          <AccordionTrigger className="group min-h-[44px] px-6 text-[15px] font-medium">
            <span data-testid={`faq-question-${item.key}`} translate="no">
              {item.question}
            </span>
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <p
              className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
              data-testid={`faq-answer-${item.key}`}
              translate="no"
            >
              {item.answer}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

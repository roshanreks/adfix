"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/data";
import { FadeIn } from "@/components/animations";

export function FAQ() {
  return (
    <section id="faq" className="bg-white py-[120px]">
      <div className="mx-auto max-w-[720px] px-6 lg:px-12">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-[#0F172A]">
            Frequently Asked Questions
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Accordion className="w-full">
            {FAQ_ITEMS.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="border-b border-[#E2E8F0] py-5"
              >
                <AccordionTrigger className="text-left text-[16px] font-medium text-[#0F172A] hover:text-[#6D28D9] hover:no-underline [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-[#94A3B8] [&[data-state=open]>svg]:rotate-180">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pt-3 text-[14px] leading-[1.6] text-[#475569]">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do guides adopt Monte without extra training time?",
    answer:
      "We deliver Montessori-specific onboarding with your team, import existing lesson records, and tailor prompts to your materials list so guides feel at home from day one.",
  },
  {
    question: "Does Monte support multi-age and multi-campus organizations?",
    answer:
      "Yes. Flexible cohorts, permissions, and cross-campus reporting make it simple to respect each environment while surfacing insights to leadership.",
  },
  {
    question: "How does pricing work for part-time enrollments?",
    answer:
      "Only active students are billed. You can archive and reactivate children as schedules shift without losing their history.",
  },
  {
    question: "Can families access Monte on mobile?",
    answer:
      "Families receive delightful mobile-ready updates, can reply with messages or photos, and choose the channels that work best for them.",
  },
];

export function MarketingFaq() {
  return (
    <section
      aria-labelledby="faq"
      className="mx-auto mt-24 max-w-4xl px-4 md:px-6"
      id="faq"
    >
      <div className="text-center">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.3em]">
          FAQ
        </p>
        <h2 className="mt-4 text-balance font-semibold text-3xl text-foreground tracking-tight sm:text-4xl">
          Answers for Montessori leaders
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          If you do not see what you need, we are happy to craft a custom plan
          for your school community.
        </p>
      </div>
      <Accordion
        className="mt-10 rounded-3xl border border-border/70 bg-background/90 shadow-md"
        collapsible
        type="single"
      >
        {faqs.map((faq) => (
          <AccordionItem key={faq.question} value={faq.question}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

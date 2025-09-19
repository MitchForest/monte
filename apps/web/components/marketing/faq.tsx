import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    answer:
      "Yes. Homeschool guides gain access to the same curriculum, AI copilots, and reporting that our school partners use. Schedule a demo and we will tailor onboarding to your family or pod.",
    question: "Is Monte available for homeschoolers?",
  },
  {
    answer:
      "Absolutely. Schools with more than 100 students receive bespoke onboarding support and discounted per-student pricing; reach out to craft a plan for your campuses.",
    question: "Do Montessori schools receive bulk pricing?",
  },
  {
    answer:
      "The day stays child-led. Most learners choose Monte on a computer or tablet for one to two hours, then return to hands-on materials, movement, and outdoor work for the remainder of the cycle.",
    question: "How long do students spend on computers each day?",
  },
  {
    answer:
      "We administer nationally normed assessments multiple times per year across our network. Students who engage with Monte's 2 Hour Learning model show academic growth roughly twice as fast as matched peers.",
    question: "Where does the 2× as fast in two hours metric come from?",
  },
  {
    answer:
      "Implementation typically takes four to six weeks. We import your existing records, configure classrooms, and provide live coaching so guides feel confident before launch.",
    question: "How quickly can we launch Monte?",
  },
  {
    answer:
      "Monte connects with SIS, LMS, and communication tools through secure integrations, keeping enrollment, attendance, and messaging in sync without duplicate entry.",
    question: "Does Monte integrate with the systems we already use?",
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
        className="mt-10 rounded-3xl border border-border/70 bg-background/90 px-4 shadow-md sm:px-6"
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

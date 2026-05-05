import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Friction } from "@/components/landing/friction";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Trust } from "@/components/landing/trust";
import { Testimonials } from "@/components/landing/testimonials";
import { ReportPreview } from "@/components/landing/report-preview";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { SmoothScroll } from "@/components/ui/smooth-scroll";

export default function LandingPage() {
  return (
    <SmoothScroll>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Friction />
        <HowItWorks />
        <Trust />
        <Testimonials />
        <ReportPreview />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </SmoothScroll>
  );
}

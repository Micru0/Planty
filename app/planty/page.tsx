import { Footer } from "@/components/app/Footer";
import { Header } from "@/components/app/Header";

export default function PlantyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="mb-4 text-5xl font-bold">Welcome to Planty!</h1>
          <p className="mb-8 text-xl text-gray-600">
            The future of plant care is here. Discover, manage, and love your
            plants like never before.
          </p>
          <a
            href="https://planty.macrokw.com/app/listings"
            className="rounded-lg bg-primary px-8 py-4 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Explore the App
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
} 
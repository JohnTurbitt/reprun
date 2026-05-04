import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact - RepRun",
  description: "Contact RepRun for support, billing, and account requests.",
};

export default function ContactPage() {
  return (
    <main className="legal-page">
      <Link className="legal-page__back" href="/">
        Back to RepRun
      </Link>
      <p className="eyebrow">Contact</p>
      <h1>Contact RepRun</h1>
      <p>
        For account, billing, privacy, or product support, email{" "}
        <a href="mailto:support@reprun.app">support@reprun.app</a>.
      </p>

      <h2>Useful Details To Include</h2>
      <p>
        Include the email on your RepRun account, what you were trying to do,
        and any relevant checkout or billing context. Do not send card details.
      </p>

      <h2>Response Time</h2>
      <p>
        During early access, support is handled manually. Response times may vary
        while the product is being prepared for launch.
      </p>
    </main>
  );
}

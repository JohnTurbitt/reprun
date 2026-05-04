import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - RepRun",
  description: "How RepRun handles account, billing, and race report data.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link className="legal-page__back" href="/">
        Back to RepRun
      </Link>
      <p className="eyebrow">Privacy</p>
      <h1>Privacy Policy</h1>
      <p>
        RepRun stores the account and race report data needed to provide saved
        reports, subscription access, and race analysis features.
      </p>

      <h2>Data We Collect</h2>
      <p>
        We collect your email address, optional display name, saved report
        inputs, generated report summaries, profile defaults, session cookies,
        and subscription status. Payment details are handled by Stripe and are
        not stored by RepRun.
      </p>

      <h2>How Data Is Used</h2>
      <p>
        Data is used to authenticate your account, save and load race reports,
        unlock paid report features, process subscription status, and improve
        the product experience.
      </p>

      <h2>Third Parties</h2>
      <p>
        Stripe processes checkout, billing portal, and subscription webhook
        events. Hosting, database, and email providers may process operational
        data when RepRun is deployed.
      </p>

      <h2>Retention And Deletion</h2>
      <p>
        Account and report data is retained while your account exists. Contact
        support to request account or report deletion.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy requests, email{" "}
        <a href="mailto:support@reprun.app">support@reprun.app</a>.
      </p>
      <p className="legal-page__note">
        Last updated: May 4, 2026. Replace this page with lawyer-reviewed copy
        before broad public launch.
      </p>
    </main>
  );
}

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>RepRun</strong>
        <span>Hybrid race split analytics.</span>
      </div>
      <nav aria-label="Trust and legal links">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/refunds">Refunds</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </footer>
  );
}

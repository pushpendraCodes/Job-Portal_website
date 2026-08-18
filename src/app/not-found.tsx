import Link from "next/link";
import "./globals.css";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <div className="mesh-bg flex min-h-screen items-center justify-center px-6 text-center">
          <div>
            <p className="font-display text-7xl text-accent/25">404</p>
            <h1 className="mt-3 font-display text-3xl text-ink">Page not found</h1>
            <p className="mx-auto mt-3 max-w-md text-ink-soft">
              The link may be broken, or the page may have been moved.
            </p>
            <Link href="/en" className="btn btn-primary mt-7">
              Go to homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

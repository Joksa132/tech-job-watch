import type { Metadata } from "next";
import { Newsreader, Manrope, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignInButton, SignOutButton } from "@/components/auth-buttons";
import { fmtDate } from "@/lib/format";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TechJobWatch — Every Serbian JavaScript job",
  description:
    "Every Serbian JavaScript job, in one place, current as of today.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() });
  const today = fmtDate(new Date());

  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${manrope.variable} ${jetbrains.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground">
        <header className="border-b border-rule">
          <div className="mx-auto max-w-5xl px-6 pt-12 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <Link href="/" className="block group">
              <h1 className="font-serif font-medium text-5xl md:text-6xl leading-[0.95] tracking-tight">
                TechJobWatch
              </h1>
            </Link>
            <div className="flex flex-col md:items-end gap-3 shrink-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                {today}
              </p>
              <div className="font-mono text-[11px] uppercase tracking-[0.15em] flex items-center gap-3">
                {session ? (
                  <>
                    <span className="text-muted normal-case tracking-normal">
                      {session.user.name}
                    </span>
                    <SignOutButton />
                  </>
                ) : (
                  <SignInButton />
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-rule mt-24">
          <div className="mx-auto max-w-5xl px-6 py-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            Scraped daily · helloworld.rs · joberty.com · infostud.com
          </div>
        </footer>
      </body>
    </html>
  );
}

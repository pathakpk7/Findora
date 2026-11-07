import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Search, Plus, ArrowRight, ShieldCheck, Lock, CheckCircle2, QrCode } from 'lucide-react';
import { CampusItemsDirectory } from '@/components/home/CampusItemsDirectory';
import { FindoraLogo } from '@/components/brand/FindoraLogo';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col selection:bg-stone-900 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Editorial Hero Section */}
        <section className="relative pt-16 sm:pt-24 pb-20 border-b border-stone-200 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Editorial Headline & Narrative */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center space-x-2 text-xs font-semibold text-stone-500 tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                  <span>Campus Custody Network Active</span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-950 leading-[1.05]">
                  Reuniting campus with what went missing
                </h1>

                <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
                  A modern custody and return protocol for university grounds. Search the public directory without an account, or file a confidential notice to claim your property.
                </p>

                {/* Primary Action Triggers */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href="/found-items"
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-stone-950 hover:bg-stone-800 text-white font-medium text-sm rounded-md transition-all active:scale-[0.98]"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Found Directory</span>
                  </Link>

                  <Link
                    href="/lost-reports/new"
                    className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 bg-white hover:bg-stone-50 text-stone-800 font-medium text-sm rounded-md border border-stone-200 transition-colors"
                  >
                    <span>File Lost Notice</span>
                  </Link>

                  <Link
                    href="/found-items/new"
                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-3.5 text-stone-600 hover:text-stone-950 font-medium text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Report Found Item</span>
                  </Link>
                </div>

                {/* Subtle reassurance metrics */}
                <div className="pt-6 border-t border-stone-200/80 flex items-center gap-8 text-xs text-stone-500">
                  <div>
                    <span className="block font-semibold text-stone-900 text-sm">Zero-Knowledge</span>
                    <span>Serial numbers encrypted</span>
                  </div>
                  <div className="w-px h-8 bg-stone-200" />
                  <div>
                    <span className="block font-semibold text-stone-900 text-sm">QR Authenticated</span>
                    <span>Physical return verification</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Custody Artifact */}
              <div className="lg:col-span-5 relative">
                <div className="bg-white rounded-lg border border-stone-200/90 shadow-sm p-6 space-y-6">
                  {/* Live Simulation Stream */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse-dot" />
                      <span className="font-semibold text-stone-900">Custody Radar</span>
                    </div>
                    <span className="text-stone-400 font-mono text-[11px]">AUTO-MATCHING</span>
                  </div>

                  <div className="relative aspect-[16/10] bg-stone-50 rounded border border-stone-100 overflow-hidden flex flex-col justify-between p-4">
                    {/* Simulated Scanner Line */}
                    <div className="absolute inset-x-0 h-0.5 bg-blue-600/40 animate-scan-line pointer-events-none" />

                    <div className="flex justify-between items-start text-[11px] text-stone-400">
                      <span>STATION: LIBRARY 2F</span>
                      <span>SECURE VAULT</span>
                    </div>

                    <div className="space-y-1 my-auto text-center">
                      <p className="text-xs font-semibold text-stone-900">
                        Item Awaiting Verified Owner
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Identifying markings matched against 1 pending student report
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-stone-200/60 text-stone-500">
                      <span>CONFIDENTIAL CLAIM</span>
                      <span className="text-blue-700 font-medium">94% Semantic Match</span>
                    </div>
                  </div>

                  {/* Verification Protocol Guarantee */}
                  <div className="bg-stone-50/80 rounded p-4 border border-stone-200/60 text-xs text-stone-600 space-y-1.5">
                    <div className="flex items-center space-x-2 font-medium text-stone-900">
                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                      <span>University Custody Standard</span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Lost property is registered with public photos, while serial numbers and internal markings remain encrypted for staff verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Campus Telemetry Strip */}
        <section className="bg-white border-b border-stone-200/80 py-4 text-xs font-medium text-stone-600 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-stone-900 font-medium">Live Campus Operations</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-stone-600">
              <span>Main Library Desk · 08:00 - 22:00</span>
              <span>Student Union Hub · Open</span>
              <span>Engineering Complex Intake · Active</span>
            </div>
          </div>
        </section>

        {/* Live Campus Items Directory */}
        <CampusItemsDirectory />

        {/* The Architecture of Return (Editorial Process Section) */}
        <section className="py-24 border-t border-stone-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="max-w-xl space-y-3">
              <span className="text-xs font-semibold text-blue-700 tracking-wider uppercase">
                The Protocol
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-950">
                How items return home
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Designed to protect honest finders, safeguard owner privacy, and eliminate false claims through strict custody verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="text-xs font-mono font-semibold text-stone-400">01 / REGISTRATION</div>
                <h3 className="text-lg font-semibold text-stone-900">
                  Visual Intake & Masking
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  The finder logs the item with general appearance and location. Sensitive characteristics like serial numbers and internal wallpapers are kept strictly confidential.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="text-xs font-mono font-semibold text-stone-400">02 / MATCHING</div>
                <h3 className="text-lg font-semibold text-stone-900">
                  Semantic Cross-Referencing
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  When a student files a private lost report, our matching engine compares temporal, spatial, and visual parameters without exposing personal contact details.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <div className="text-xs font-mono font-semibold text-stone-400">03 / HANDOVER</div>
                <h3 className="text-lg font-semibold text-stone-900">
                  Cryptographic Handoff
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Approved claimants present a dynamic QR token at campus security or directly to the finder. Scanning validates identity and releases custody in the immutable log.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Editorial Footer */}
      <footer className="bg-stone-950 text-stone-400 py-16 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-12 border-b border-stone-800/80">
            <div className="space-y-2">
              <FindoraLogo variant="dark" size="md" withTagline={true} />
              <p className="text-xs text-stone-400 max-w-sm mt-2 leading-relaxed">
                Campus property registry and verification framework. Built for honest student communities.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-stone-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
              <span>Network status: All campus desks operational</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-stone-400">
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/found-items" className="hover:text-white transition-colors">
                Public Directory
              </Link>
              <Link href="/lost-reports/new" className="hover:text-white transition-colors">
                File Lost Report
              </Link>
              <Link href="/found-items/new" className="hover:text-white transition-colors">
                Report Found Property
              </Link>
              <Link href="/login" className="hover:text-white transition-colors">
                Account Sign In
              </Link>
            </div>

            <p className="text-stone-400">
              © {new Date().getFullYear()} Findora Campus Network
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

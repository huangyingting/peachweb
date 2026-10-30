import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#06070c] text-slate-400 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff6b4a] to-[#9333ea] flex items-center justify-center font-bold text-white">
              P
            </div>
            <span className="text-lg font-extrabold text-white">
              Peach<span className="text-[#ff6b4a]">Web</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            The no-code 3D WebGL website builder and spatial storytelling platform. Design UI, choreograph 3D scenes, and publish globally in one click.
          </p>
          <div className="text-xs text-slate-500">
            © 2026 PeachWorlds Inc. All rights reserved.
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="font-bold text-white uppercase tracking-wider mb-3">
            Product
          </div>
          <div>
            <Link href="/features" className="hover:text-white">
              Features
            </Link>
          </div>
          <div>
            <Link href="/technology" className="hover:text-white">
              3D Technology
            </Link>
          </div>
          <div>
            <Link href="/pricing" className="hover:text-white">
              Pricing Plans
            </Link>
          </div>
          <div>
            <Link href="/remix" className="hover:text-white">
              AI Site Generator
            </Link>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="font-bold text-white uppercase tracking-wider mb-3">
            Use Cases
          </div>
          <div>
            <Link href="/ecommerce" className="hover:text-white">
              3D E-Commerce
            </Link>
          </div>
          <div>
            <Link href="/portfolio" className="hover:text-white">
              Creative Portfolios
            </Link>
          </div>
          <div>
            <Link href="/storytelling" className="hover:text-white">
              Spatial Storytelling
            </Link>
          </div>
          <div>
            <Link href="/gallery" className="hover:text-white">
              Community Gallery
            </Link>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="font-bold text-white uppercase tracking-wider mb-3">
            PeachWorlds Studio
          </div>
          <div>
            <Link href="/workspace" className="hover:text-white">
              Builder Dashboard
            </Link>
          </div>
          <div>
            <Link href="/templates" className="hover:text-white">
              3D Templates
            </Link>
          </div>
          <div>
            <Link href="/login" className="hover:text-white">
              Sign In
            </Link>
          </div>
          <div>
            <Link href="/register" className="hover:text-white">
              Redeem Invite Code
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

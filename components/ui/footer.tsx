"use client"

import { Code2, Camera, AtSign, Mail, Box, ExternalLink } from "lucide-react"
import { siteConfig } from "@/lib/site-config"
import { useThemeStore } from "@/lib/use-theme-store"

export function Footer() {
  const siteName = useThemeStore((s) => s.siteName)

  const socials = [
    { icon: Code2, href: siteConfig.social.github, label: "GitHub" },
    { icon: Camera, href: siteConfig.social.instagram, label: "Instagram" },
    { icon: AtSign, href: siteConfig.social.twitter, label: "Twitter" },
    { icon: Mail, href: `mailto:${siteConfig.social.email}`, label: "Email" },
  ].filter((s) => s.href)

  return (
    <footer
      className="border-t border-white/[0.06] mt-24"
      style={{ background: "rgba(0,0,0,0.3)" }}
      id="contact"
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--accent)" }}
              >
                <Box className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg font-display">{siteName}</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">{siteConfig.bio}</p>
          </div>

          {/* Links */}
          <div id="about">
            <h4 className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Gallery", href: "/#gallery" },
                { label: "Thingiverse", href: siteConfig.social.thingiverse },
                { label: "Printables", href: siteConfig.social.printables },
              ]
                .filter((l) => l.href)
                .map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {l.label}
                      {l.href.startsWith("http") && <ExternalLink className="w-3 h-3" />}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-4">
              Connect
            </h4>
            <div className="flex gap-3 flex-wrap">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all duration-200 cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            {siteConfig.social.email && (
              <a
                href={`mailto:${siteConfig.social.email}`}
                className="mt-4 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                {siteConfig.social.email}
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <span>© {new Date().getFullYear()} {siteName}. All rights reserved.</span>
          <span>Built with Next.js · All models free to download & print</span>
        </div>
      </div>
    </footer>
  )
}

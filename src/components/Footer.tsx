"use client";

import Link from "next/link";
import Image from "next/image";
import { Smile, Mail, MapPin, Phone, MessageSquare, Clock } from "lucide-react";
import { getAssetPath } from "@/lib/getAssetPath";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (href === "#home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          window.history.pushState(null, "", window.location.pathname);
          return;
        }
        const headerEl = document.querySelector("header");
        const navbarHeight = headerEl ? headerEl.getBoundingClientRect().height + 16 : 96;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 12;
        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: "smooth",
        });
        window.history.pushState(null, "", href);
      } else {
        e.preventDefault();
        window.location.href = getAssetPath(`/${href}`);
      }
    }
  };

  return (
    <footer className="w-full bg-[#0F172A] text-white/90 pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand Column */}
        <div className="flex flex-col gap-6">
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, "#home")}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 text-accent flex items-center justify-center">
              <Smile className="w-5 h-5 text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-sm tracking-tight text-white leading-tight uppercase">
                V.R. Dental Care
              </span>
              <span className="font-sans font-medium text-[8px] tracking-[0.05em] text-accent uppercase leading-none mt-0.5">
                & Dental Implant Centre
              </span>
            </div>
          </a>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm text-left">
            Transforming Smiles, Transforming Lives. Professional and personalized dental care in a modern and comfortable environment.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[12px] bg-primary/20 text-accent px-3.5 py-1 rounded-full font-semibold border border-primary/10 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Hours: Monday – Saturday: 9:00 AM – 8:00 PM (Sunday: Closed)
            </span>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="flex flex-col gap-5 text-left">
          <h4 className="font-heading font-bold text-base text-white tracking-wide uppercase">
            Navigation
          </h4>
          <ul className="flex flex-col gap-3.5 text-sm text-white/60">
            {[
              { name: "Home", href: "#home" },
              { name: "Services", href: "#services" },
              { name: "About", href: "#about" },
              { name: "Blog", href: "#blog" },
              { name: "Contact", href: "#contact" },
              { name: "Book Appointment", href: "#appointment" },
            ].map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="hover:text-accent transition-colors duration-200"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Services Column */}
        <div className="flex flex-col gap-5 text-left">
          <h4 className="font-heading font-bold text-base text-white tracking-wide uppercase">
            Services
          </h4>
          <ul className="flex flex-col gap-3.5 text-sm text-white/60">
            {[
              { name: "Root Canal Treatment", href: "#services" },
              { name: "Cavity Inspection", href: "#services" },
              { name: "Dental Implants", href: "#services" },
              { name: "Orthodontics", href: "#services" },
              { name: "Teeth Alignment", href: "#services" },
              { name: "Cosmetic Dentistry", href: "#services" },
            ].map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="hover:text-accent transition-colors duration-200"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Column */}
        <div className="flex flex-col gap-5 text-left">
          <h4 className="font-heading font-bold text-base text-white tracking-wide uppercase">
            Contact Us
          </h4>
          <div className="flex flex-col gap-4 text-sm text-white/60">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>P6M6+2M Yanam, Puducherry</span>
            </div>
            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <a href="tel:09885349798" className="hover:text-white transition-colors">
                098853 49798
              </a>
            </div>
            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <a
                href="mailto:VRdental.yanam@gmail.com"
                className="hover:text-white transition-colors"
              >
                VRdental.yanam@gmail.com
              </a>
            </div>
            <div className="flex gap-3">
              <MessageSquare className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <a
                href="https://wa.me/919885349798"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-white/10 max-w-[1440px] mx-auto px-6 md:px-12" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 text-center md:text-left">
        <p>© {currentYear} V.R. Dental Care & Dental Implant Centre. All rights reserved.</p>
        <p className="text-white/40 flex items-center justify-center gap-1.5">
          <Image
            src={getAssetPath("/jk-logo.png")}
            alt="JK & Co."
            width={18}
            height={18}
            className="w-[18px] h-[18px] object-contain shrink-0"
            unoptimized
          />
          <span>Designed and Managed by JK & Co.</span>
        </p>
        <div className="flex items-center justify-center gap-6">
          <Link href="/privacy-policy" className="hover:text-white transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-white transition-colors duration-200">
            Terms of Service
          </Link>
          <a href="#" className="hover:text-white transition-colors duration-200">
            Sitemap
          </a>
          <Link
            href="/login"
            className="hover:text-white transition-colors duration-200 opacity-70 hover:opacity-100"
          >
            Login
          </Link>
        </div>
      </div>
    </footer>
  );
}

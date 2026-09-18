"use client";

import React from "react";
import Link from "next/link";
import { DentalLogo } from "@/components/dental-logo";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <DentalLogo />
            <p className="text-xs text-slate-400 leading-relaxed">
              Comprehensive dental care and patient management system delivering high-quality oral healthcare services with modern clinical excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link href="/services" className="hover:text-blue-400 transition-colors">Services & Procedures</Link></li>
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Our Clinic</Link></li>
              <li><Link href="/book-appointment" className="hover:text-blue-400 transition-colors">Book Appointment</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal & Access</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/login" className="hover:text-blue-400 transition-colors">Staff Portal Sign In</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Clinical Dashboard</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Clinic Location</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>VR Dental Clinic, MG Road, Bengaluru, Karnataka 560001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <span>+91 98112 09230</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <span>contact@vrdentalclinic.com</span>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Mon - Sat: 09:00 AM - 08:00 PM<br />Sun: Emergency Only</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 pb-20 sm:pb-6">
          <p>© {new Date().getFullYear()} DentPro OS. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:pr-24 lg:pr-28">
            <Link href="/privacy-policy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-slate-400">Terms of Service</Link>
            <Link href="/login" className="hover:text-slate-400">Staff Sign In</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

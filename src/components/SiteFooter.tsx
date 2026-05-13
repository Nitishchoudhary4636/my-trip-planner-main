import { Link } from "@tanstack/react-router";
import { Plane, Mail, Phone, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-cta">
              <Plane className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-extrabold text-brand-teal-deep">TripWave</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Plan smarter. Travel further. Your one-stop trip planning companion.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/flights" className="hover:text-brand-teal-deep">Flights</Link></li>
            <li><Link to="/hotels" className="hover:text-brand-teal-deep">Hotels</Link></li>
            <li><Link to="/holidays" className="hover:text-brand-teal-deep">Holidays</Link></li>
            <li><Link to="/trains" className="hover:text-brand-teal-deep">Trains</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/login" className="hover:text-brand-teal-deep">Log in</Link></li>
            <li><Link to="/register" className="hover:text-brand-teal-deep">Sign up</Link></li>
            <li><Link to="/profile" className="hover:text-brand-teal-deep">Profile</Link></li>
            <li><Link to="/my-bookings" className="hover:text-brand-teal-deep">My Bookings</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@tripwave.app</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Bengaluru, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TripWave. Demo project — data stored locally in your browser.
      </div>
    </footer>
  );
}

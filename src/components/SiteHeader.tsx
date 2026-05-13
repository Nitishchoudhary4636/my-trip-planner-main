import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Plane, Hotel, Palmtree, Train, Bus, Car, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, notifyAuthChanged } from "@/hooks/use-auth";
import { auth } from "@/lib/auth";

const navItems = [
  { to: "/flights", label: "Flights", icon: Plane },
  { to: "/hotels", label: "Hotels", icon: Hotel },
  { to: "/holidays", label: "Holidays", icon: Palmtree },
  { to: "/trains", label: "Trains", icon: Train },
  { to: "/buses", label: "Buses", icon: Bus },
  { to: "/cabs", label: "Cabs", icon: Car },
] as const;

export function SiteHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
    notifyAuthChanged();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-cta shadow-cta">
            <Plane className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-extrabold tracking-tight text-brand-teal-deep">TripWave</div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">plan • book • go</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-brand-teal-deep"
              activeProps={{ className: "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold bg-secondary text-brand-teal-deep" }}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  {user.fullName.split(" ")[0]}
                </Button>
              </Link>
              <Link to="/my-bookings"><Button variant="outline" size="sm">My Bookings</Button></Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link to="/register"><Button size="sm" className="gradient-cta border-0 text-white shadow-cta hover:opacity-95">Sign up</Button></Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {navItems.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                <n.icon className="h-4 w-4 text-brand-teal" />
                {n.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary">Profile</Link>
                <Link to="/my-bookings" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary">My Bookings</Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-secondary">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary">Log in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-orange-deep">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

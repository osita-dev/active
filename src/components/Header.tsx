import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

const Header = () => (
  <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8">
    <Logo />
    <nav className="flex items-center gap-5 text-sm font-semibold">
      <Link to="/become-provider" className="text-primary transition hover:text-primary/80">
        List your service
      </Link>
      <Link to="/login" className="text-muted-foreground transition hover:text-foreground">
        Sign in
      </Link>
      <Link to="/provider/dashboard" className="text-muted-foreground transition hover:text-foreground">
        Dashboard
      </Link>
    </nav>
  </header>
);

export default Header;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Search from "./pages/Search";
import ProviderPage from "./pages/Provider";
import Login from "./pages/Login";
import BecomeProvider from "./pages/BecomeProvider";
import ProviderDashboard from "./pages/ProviderDashboard";
import ChatNew from "./pages/ChatNew";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/provider/:id" element={<ProviderPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/become-provider" element={<BecomeProvider />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/chat/new/:providerId" element={<ChatNew />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

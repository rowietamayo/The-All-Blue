import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import { CartProvider } from "@/context/cart";
import { AuthProvider } from "@/context/auth";
import { CartDrawer } from "@/components/cart-drawer";
import { LoadingProvider } from "@/context/loading";
import { ChefHatLoader } from "@/components/chef-hat-loader";
import { CurrencyProvider } from "@/context/currency";

import Home from "@/pages/home";
import Menu from "@/pages/menu";
import Chefs from "@/pages/chefs";
import Reviews from "@/pages/reviews";
import Track from "@/pages/track";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Admin from "@/pages/admin";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/menu" component={Menu} />
        <Route path="/chefs" component={Chefs} />
        <Route path="/reviews" component={Reviews} />
        <Route path="/track" component={Track} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LoadingProvider>
          <AuthProvider>
            <CurrencyProvider>
              <CartProvider>
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <Router />
                  <CartDrawer />
                </WouterRouter>
              </CartProvider>
            </CurrencyProvider>
          </AuthProvider>
          <ChefHatLoader />
        </LoadingProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

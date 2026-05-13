import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script src="//cdn.evgnet.com/beacon/a556rq555550mxe43n3n3n091568480/demos/scripts/evergage.min.js" async></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try{
    window.dataLayer = window.dataLayer || [];

    function safeJSONParse(s){ try{ return JSON.parse(s); }catch(e){ return null; } }

    function getCart(){
      try{
        var raw = localStorage.getItem('mcp_cart') || localStorage.getItem('cart') || localStorage.getItem('cart_items') || '[]';
        return safeJSONParse(raw) || [];
      }catch(e){ return []; }
    }

    function derivePageName(){
      var p = location.pathname.replace(/^\\/+|\\/+$/g, '');
      if(!p) return 'Home';
      var seg = p.split('/')[0];
      var map = { flights: 'Flights', hotels: 'Hotels', trains: 'Trains', buses: 'Buses', cabs: 'Cabs', holidays: 'Holidays', checkout: 'Checkout', login: 'Login', register: 'Register', 'my-bookings': 'Orders' };
      return map[seg] || document.title || seg.charAt(0).toUpperCase()+seg.slice(1);
    }

    function derivePageType(){
      var path = location.pathname;
      if(path === '/' || path === '') return 'Home';
      if(path.indexOf('/checkout') === 0) return 'view_checkout';
      if(path.indexOf('/cart') === 0) return 'Cart';
      if(path.indexOf('/login') === 0) return 'login';
      if(path.indexOf('/register') === 0) return 'login';
      if(path.indexOf('/product') === 0 || path.indexOf('/p/') === 0) return 'Product';
      return 'default';
    }

    function deriveItem(){
      try{
        var metaId = document.querySelector('meta[name="product-id"]') || document.querySelector('meta[property="og:product_id"]');
        var title = (document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="title"]'));
        var price = (document.querySelector('meta[property="product:price:amount"]') || document.querySelector('meta[name="price"]'));
        return {
          id: metaId && metaId.getAttribute('content') || null,
          name: title && title.getAttribute('content') || document.title || null,
          price: price && price.getAttribute('content') || null
        };
      }catch(e){ return {}; }
    }

    function getCartCurrency(){
      try{
        var last = (window.dataLayer && window.dataLayer.slice().reverse().find(function(x){ return x && x.MCP && x.MCP.currency; })) || {};
        return (last.MCP && last.MCP.currency) || 'INR';
      }catch(e){ return 'INR'; }
    }

    function pushMCP(){
      try{
        var cart = getCart();
        var items = (cart || []).map(function(it){ return {
          catalogObjectType: 'Product',
          catalogObjectId: it.item_id || it.id || it.sku || null,
          price: parseFloat(it.price) || parseFloat(it.amount) || 0,
          quantity: parseInt(it.quantity,10) || parseInt(it.qty,10) || 1,
          attributes: {
            sku: it.item_sku || it.sku || it.id,
            name: it.item_name || it.name || '',
            currency: window.__CURRENCY__ || getCartCurrency()
          }
        }; }).filter(function(i){ return !!i && !!i.catalogObjectId; });

        var mcp = {
          pageName: derivePageName(),
          pageType: derivePageType(),
          items: items,
          currency: window.__CURRENCY__ || getCartCurrency(),
          Item: deriveItem(),
          itemListId: null,
          itemListName: null
        };

        window.dataLayer.push({ MCP: mcp });
      }catch(e){ console.error('pushMCP error', e); }
    }

    // Initial push
    pushMCP();

    // Hook SPA navigation
    (function(){
      var _push = history.pushState;
      history.pushState = function(){ var res = _push.apply(this, arguments); setTimeout(pushMCP, 60); return res; };
      var _replace = history.replaceState;
      history.replaceState = function(){ var res = _replace.apply(this, arguments); setTimeout(pushMCP, 60); return res; };
      window.addEventListener('popstate', function(){ setTimeout(pushMCP, 60); });
      window.addEventListener('storage', function(e){ if(e.key && e.key.toLowerCase().indexOf('cart') !== -1) setTimeout(pushMCP, 60); });
    })();

    // Expose helper for manual updates
    window.MCP = window.MCP || {};
    window.MCP.push = function(obj){ try{ window.dataLayer.push({ MCP: obj }); }catch(e){} };

  }catch(e){ console.error('dataLayer init failed', e); }
})();`
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}

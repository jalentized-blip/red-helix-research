import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// PASS 2: Lazy-load non-landing routes so they don't inflate the initial bundle
const KitInfo = React.lazy(() => import('./pages/KitInfo'));
const SkuMismatchDashboard = React.lazy(() => import('./pages/SkuMismatchDashboard'));
const AdminBannerManager = React.lazy(() => import('./pages/AdminBannerManager'));
const WishList = React.lazy(() => import('./pages/WishList'));

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Minimal skeleton shown while lazy chunks load
const PageSkeleton = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-slate-100 border-t-[#8B2635] rounded-full animate-spin" />
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  React.useEffect(() => {
    const el = document.getElementById('root-loading');
    if (el) el.remove();
  }, []);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return null;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Landing route — NOT lazy so LCP is not delayed */}
        <Route path="/" element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        } />
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        <Route path="/KitInfo" element={<LayoutWrapper currentPageName="KitInfo"><KitInfo /></LayoutWrapper>} />
        <Route path="/AdminBannerManager" element={<LayoutWrapper currentPageName="AdminBannerManager"><AdminBannerManager /></LayoutWrapper>} />
        <Route path="/WishList" element={<LayoutWrapper currentPageName="WishList"><WishList /></LayoutWrapper>} />
        <Route path="/SkuMismatchDashboard" element={<LayoutWrapper currentPageName="SkuMismatchDashboard"><SkuMismatchDashboard /></LayoutWrapper>} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
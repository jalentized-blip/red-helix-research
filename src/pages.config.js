/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import Account from './pages/Account';
import AdminCustomerManagement from './pages/AdminCustomerManagement';
import AdminManualOrders from './pages/AdminManualOrders';
import AdminOrderManagement from './pages/AdminOrderManagement';
import AdminPriceManagement from './pages/AdminPriceManagement';
import AdminStockManagement from './pages/AdminStockManagement';
import AdminSupport from './pages/AdminSupport';
import COAReports from './pages/COAReports';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import CryptoCheckout from './pages/CryptoCheckout';
import CustomerInfo from './pages/CustomerInfo';
import GrayMarketInsights from './pages/GrayMarketInsights';
import GroupBuy from './pages/GroupBuy';
import Home from './pages/Home';
import LearnMore from './pages/LearnMore';
import Login from './pages/Login';
import OrderTracking from './pages/OrderTracking';
import OurStory from './pages/OurStory';
import PaymentCompleted from './pages/PaymentCompleted';
import PeppyBot from './pages/PeppyBot';
import PeptideCalculator from './pages/PeptideCalculator';
import PeptideCategory from './pages/PeptideCategory';
import PeptideLearn from './pages/PeptideLearn';
import PeptideReconstitution from './pages/PeptideReconstitution';
import PeptideReconstitutionGuide from './pages/PeptideReconstitutionGuide';
import Policies from './pages/Policies';
import VoiceAssistant from './pages/VoiceAssistant';
import VoiceAssistantNav from './pages/VoiceAssistantNav';
import SEOGuide from './pages/SEOGuide';
import BlogGuide from './pages/BlogGuide';
import ProductBPC157 from './pages/ProductBPC157';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Account": Account,
    "AdminCustomerManagement": AdminCustomerManagement,
    "AdminManualOrders": AdminManualOrders,
    "AdminOrderManagement": AdminOrderManagement,
    "AdminPriceManagement": AdminPriceManagement,
    "AdminStockManagement": AdminStockManagement,
    "AdminSupport": AdminSupport,
    "COAReports": COAReports,
    "Cart": Cart,
    "Contact": Contact,
    "CryptoCheckout": CryptoCheckout,
    "CustomerInfo": CustomerInfo,
    "GrayMarketInsights": GrayMarketInsights,
    "GroupBuy": GroupBuy,
    "Home": Home,
    "LearnMore": LearnMore,
    "Login": Login,
    "OrderTracking": OrderTracking,
    "OurStory": OurStory,
    "PaymentCompleted": PaymentCompleted,
    "PeppyBot": PeppyBot,
    "PeptideCalculator": PeptideCalculator,
    "PeptideCategory": PeptideCategory,
    "PeptideLearn": PeptideLearn,
    "PeptideReconstitution": PeptideReconstitution,
    "PeptideReconstitutionGuide": PeptideReconstitutionGuide,
    "Policies": Policies,
    "VoiceAssistant": VoiceAssistant,
    "VoiceAssistantNav": VoiceAssistantNav,
    "SEOGuide": SEOGuide,
    "BlogGuide": BlogGuide,
    "ProductBPC157": ProductBPC157,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
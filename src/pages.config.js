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
import BacklinkStrategy from './pages/BacklinkStrategy';
import BlogGuide from './pages/BlogGuide';
import COAReports from './pages/COAReports';
import Cart from './pages/Cart';
import CompetitivePositioning from './pages/CompetitivePositioning';
import Contact from './pages/Contact';
import ConversionTracking from './pages/ConversionTracking';
import CryptoCheckout from './pages/CryptoCheckout';
import CustomerInfo from './pages/CustomerInfo';
import CustomerTestimonials from './pages/CustomerTestimonials';
import DeploymentGuide from './pages/DeploymentGuide';
import EmailAutomationStrategy from './pages/EmailAutomationStrategy';
import ExpandedFAQ from './pages/ExpandedFAQ';
import GrayMarketInsights from './pages/GrayMarketInsights';
import GroupBuy from './pages/GroupBuy';
import Home from './pages/Home';
import InternalLinkingStrategy from './pages/InternalLinkingStrategy';
import LaunchChecklist from './pages/LaunchChecklist';
import LearnMore from './pages/LearnMore';
import Login from './pages/Login';
import MonitoringSetup from './pages/MonitoringSetup';
import OrderTracking from './pages/OrderTracking';
import OurStory from './pages/OurStory';
import PaymentCompleted from './pages/PaymentCompleted';
import PaymentSecurity from './pages/PaymentSecurity';
import PeppyBot from './pages/PeppyBot';
import PeptideCalculator from './pages/PeptideCalculator';
import PeptideCategory from './pages/PeptideCategory';
import PeptideComparison from './pages/PeptideComparison';
import PeptideLearn from './pages/PeptideLearn';
import PeptideReconstitution from './pages/PeptideReconstitution';
import PeptideReconstitutionGuide from './pages/PeptideReconstitutionGuide';
import Policies from './pages/Policies';
import ProductBPC157 from './pages/ProductBPC157';
import ProductSemaglutide from './pages/ProductSemaglutide';
import ProductTB500 from './pages/ProductTB500';
import ProductTirzepatide from './pages/ProductTirzepatide';
import ProductionChecklist from './pages/ProductionChecklist';
import ResourceHub from './pages/ResourceHub';
import SEOGuide from './pages/SEOGuide';
import SEOMonitoring from './pages/SEOMonitoring';
import SecurityCompliance from './pages/SecurityCompliance';
import VoiceAssistant from './pages/VoiceAssistant';
import VoiceAssistantNav from './pages/VoiceAssistantNav';
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
    "BacklinkStrategy": BacklinkStrategy,
    "BlogGuide": BlogGuide,
    "COAReports": COAReports,
    "Cart": Cart,
    "CompetitivePositioning": CompetitivePositioning,
    "Contact": Contact,
    "ConversionTracking": ConversionTracking,
    "CryptoCheckout": CryptoCheckout,
    "CustomerInfo": CustomerInfo,
    "CustomerTestimonials": CustomerTestimonials,
    "DeploymentGuide": DeploymentGuide,
    "EmailAutomationStrategy": EmailAutomationStrategy,
    "ExpandedFAQ": ExpandedFAQ,
    "GrayMarketInsights": GrayMarketInsights,
    "GroupBuy": GroupBuy,
    "Home": Home,
    "InternalLinkingStrategy": InternalLinkingStrategy,
    "LaunchChecklist": LaunchChecklist,
    "LearnMore": LearnMore,
    "Login": Login,
    "MonitoringSetup": MonitoringSetup,
    "OrderTracking": OrderTracking,
    "OurStory": OurStory,
    "PaymentCompleted": PaymentCompleted,
    "PaymentSecurity": PaymentSecurity,
    "PeppyBot": PeppyBot,
    "PeptideCalculator": PeptideCalculator,
    "PeptideCategory": PeptideCategory,
    "PeptideComparison": PeptideComparison,
    "PeptideLearn": PeptideLearn,
    "PeptideReconstitution": PeptideReconstitution,
    "PeptideReconstitutionGuide": PeptideReconstitutionGuide,
    "Policies": Policies,
    "ProductBPC157": ProductBPC157,
    "ProductSemaglutide": ProductSemaglutide,
    "ProductTB500": ProductTB500,
    "ProductTirzepatide": ProductTirzepatide,
    "ProductionChecklist": ProductionChecklist,
    "ResourceHub": ResourceHub,
    "SEOGuide": SEOGuide,
    "SEOMonitoring": SEOMonitoring,
    "SecurityCompliance": SecurityCompliance,
    "VoiceAssistant": VoiceAssistant,
    "VoiceAssistantNav": VoiceAssistantNav,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
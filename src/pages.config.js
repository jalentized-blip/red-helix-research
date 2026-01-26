import About from './pages/About';
import Account from './pages/Account';
import AdminOrderManagement from './pages/AdminOrderManagement';
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
import PaymentCompleted from './pages/PaymentCompleted';
import PeppyBot from './pages/PeppyBot';
import PeptideCalculator from './pages/PeptideCalculator';
import PeptideLearn from './pages/PeptideLearn';
import PeptideReconstitution from './pages/PeptideReconstitution';
import PeptideReconstitutionGuide from './pages/PeptideReconstitutionGuide';
import VettedVendors from './pages/VettedVendors';
import VoiceAssistant from './pages/VoiceAssistant';
import VoiceAssistantNav from './pages/VoiceAssistantNav';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Account": Account,
    "AdminOrderManagement": AdminOrderManagement,
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
    "PaymentCompleted": PaymentCompleted,
    "PeppyBot": PeppyBot,
    "PeptideCalculator": PeptideCalculator,
    "PeptideLearn": PeptideLearn,
    "PeptideReconstitution": PeptideReconstitution,
    "PeptideReconstitutionGuide": PeptideReconstitutionGuide,
    "VettedVendors": VettedVendors,
    "VoiceAssistant": VoiceAssistant,
    "VoiceAssistantNav": VoiceAssistantNav,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};

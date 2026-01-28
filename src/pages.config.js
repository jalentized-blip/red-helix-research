import About from './pages/About';
import AdminOrderManagement from './pages/AdminOrderManagement';
import AdminPriceManagement from './pages/AdminPriceManagement';
import AdminStockManagement from './pages/AdminStockManagement';
import AdminSupport from './pages/AdminSupport';
import COAReports from './pages/COAReports';
import Contact from './pages/Contact';
import CustomerInfo from './pages/CustomerInfo';
import GrayMarketInsights from './pages/GrayMarketInsights';
import GroupBuy from './pages/GroupBuy';
import Home from './pages/Home';
import LearnMore from './pages/LearnMore';
import Login from './pages/Login';
import PeppyBot from './pages/PeppyBot';
import PeptideCalculator from './pages/PeptideCalculator';
import PeptideLearn from './pages/PeptideLearn';
import PeptideReconstitution from './pages/PeptideReconstitution';
import PeptideReconstitutionGuide from './pages/PeptideReconstitutionGuide';
import VoiceAssistant from './pages/VoiceAssistant';
import VoiceAssistantNav from './pages/VoiceAssistantNav';
import Account from './pages/Account';
import OrderTracking from './pages/OrderTracking';
import PaymentCompleted from './pages/PaymentCompleted';
import Cart from './pages/Cart';
import CryptoCheckout from './pages/CryptoCheckout';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminOrderManagement": AdminOrderManagement,
    "AdminPriceManagement": AdminPriceManagement,
    "AdminStockManagement": AdminStockManagement,
    "AdminSupport": AdminSupport,
    "COAReports": COAReports,
    "Contact": Contact,
    "CustomerInfo": CustomerInfo,
    "GrayMarketInsights": GrayMarketInsights,
    "GroupBuy": GroupBuy,
    "Home": Home,
    "LearnMore": LearnMore,
    "Login": Login,
    "PeppyBot": PeppyBot,
    "PeptideCalculator": PeptideCalculator,
    "PeptideLearn": PeptideLearn,
    "PeptideReconstitution": PeptideReconstitution,
    "PeptideReconstitutionGuide": PeptideReconstitutionGuide,
    "VoiceAssistant": VoiceAssistant,
    "VoiceAssistantNav": VoiceAssistantNav,
    "Account": Account,
    "OrderTracking": OrderTracking,
    "PaymentCompleted": PaymentCompleted,
    "Cart": Cart,
    "CryptoCheckout": CryptoCheckout,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
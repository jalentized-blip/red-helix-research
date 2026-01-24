import About from './pages/About';
import Account from './pages/Account';
import COAReports from './pages/COAReports';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import CryptoCheckout from './pages/CryptoCheckout';
import CustomerInfo from './pages/CustomerInfo';
import GroupBuy from './pages/GroupBuy';
import Home from './pages/Home';
import LearnMore from './pages/LearnMore';
import OrderTracking from './pages/OrderTracking';
import PaymentCompleted from './pages/PaymentCompleted';
import PeppyBot from './pages/PeppyBot';
import PeptideCalculator from './pages/PeptideCalculator';
import PeptideLearn from './pages/PeptideLearn';
import PeptideReconstitutionGuide from './pages/PeptideReconstitutionGuide';
import VoiceAssistant from './pages/VoiceAssistant';
import VoiceAssistantNav from './pages/VoiceAssistantNav';
import PeptideReconstitution from './pages/PeptideReconstitution';
import GLP1Plotter from './pages/GLP1Plotter';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Account": Account,
    "COAReports": COAReports,
    "Cart": Cart,
    "Contact": Contact,
    "CryptoCheckout": CryptoCheckout,
    "CustomerInfo": CustomerInfo,
    "GroupBuy": GroupBuy,
    "Home": Home,
    "LearnMore": LearnMore,
    "OrderTracking": OrderTracking,
    "PaymentCompleted": PaymentCompleted,
    "PeppyBot": PeppyBot,
    "PeptideCalculator": PeptideCalculator,
    "PeptideLearn": PeptideLearn,
    "PeptideReconstitutionGuide": PeptideReconstitutionGuide,
    "VoiceAssistant": VoiceAssistant,
    "VoiceAssistantNav": VoiceAssistantNav,
    "PeptideReconstitution": PeptideReconstitution,
    "GLP1Plotter": GLP1Plotter,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
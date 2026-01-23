import About from './pages/About';
import Account from './pages/Account';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import CryptoCheckout from './pages/CryptoCheckout';
import CustomerInfo from './pages/CustomerInfo';
import GroupBuy from './pages/GroupBuy';
import Home from './pages/Home';
import LearnMore from './pages/LearnMore';
import OrderTracking from './pages/OrderTracking';
import PaymentCompleted from './pages/PaymentCompleted';
import PeptideAI from './pages/PeptideAI';
import PeptideCalculator from './pages/PeptideCalculator';
import PeptideLearn from './pages/PeptideLearn';
import PeptideReconstitutionGuide from './pages/PeptideReconstitutionGuide';
import VoiceAssistant from './pages/VoiceAssistant';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Account": Account,
    "Cart": Cart,
    "Contact": Contact,
    "CryptoCheckout": CryptoCheckout,
    "CustomerInfo": CustomerInfo,
    "GroupBuy": GroupBuy,
    "Home": Home,
    "LearnMore": LearnMore,
    "OrderTracking": OrderTracking,
    "PaymentCompleted": PaymentCompleted,
    "PeptideAI": PeptideAI,
    "PeptideCalculator": PeptideCalculator,
    "PeptideLearn": PeptideLearn,
    "PeptideReconstitutionGuide": PeptideReconstitutionGuide,
    "VoiceAssistant": VoiceAssistant,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
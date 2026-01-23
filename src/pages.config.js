import About from './pages/About';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import CryptoCheckout from './pages/CryptoCheckout';
import Home from './pages/Home';
import PaymentCompleted from './pages/PaymentCompleted';
import PeptideCalculator from './pages/PeptideCalculator';
import PeptideReconstitutionGuide from './pages/PeptideReconstitutionGuide';
import AgeGate from './pages/AgeGate';
import Account from './pages/Account';
import OrderTracking from './pages/OrderTracking';
import LearnMore from './pages/LearnMore';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Cart": Cart,
    "Contact": Contact,
    "CryptoCheckout": CryptoCheckout,
    "Home": Home,
    "PaymentCompleted": PaymentCompleted,
    "PeptideCalculator": PeptideCalculator,
    "PeptideReconstitutionGuide": PeptideReconstitutionGuide,
    "AgeGate": AgeGate,
    "Account": Account,
    "OrderTracking": OrderTracking,
    "LearnMore": LearnMore,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
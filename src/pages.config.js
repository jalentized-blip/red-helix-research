import About from './pages/About';
import Account from './pages/Account';
import AgeGate from './pages/AgeGate';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import CryptoCheckout from './pages/CryptoCheckout';
import Home from './pages/Home';
import LearnMore from './pages/LearnMore';
import OrderTracking from './pages/OrderTracking';
import PaymentCompleted from './pages/PaymentCompleted';
import PeptideCalculator from './pages/PeptideCalculator';
import PeptideLearn from './pages/PeptideLearn';
import PeptideReconstitutionGuide from './pages/PeptideReconstitutionGuide';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Account": Account,
    "AgeGate": AgeGate,
    "Cart": Cart,
    "Contact": Contact,
    "CryptoCheckout": CryptoCheckout,
    "Home": Home,
    "LearnMore": LearnMore,
    "OrderTracking": OrderTracking,
    "PaymentCompleted": PaymentCompleted,
    "PeptideCalculator": PeptideCalculator,
    "PeptideLearn": PeptideLearn,
    "PeptideReconstitutionGuide": PeptideReconstitutionGuide,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
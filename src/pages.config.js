import About from './pages/About';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import Home from './pages/Home';
import CryptoCheckout from './pages/CryptoCheckout';
import PaymentCompleted from './pages/PaymentCompleted';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Cart": Cart,
    "Contact": Contact,
    "Home": Home,
    "CryptoCheckout": CryptoCheckout,
    "PaymentCompleted": PaymentCompleted,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
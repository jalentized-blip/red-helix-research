import Cart from './pages/Cart';
import Home from './pages/Home';
import About from './pages/About';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Cart": Cart,
    "Home": Home,
    "About": About,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
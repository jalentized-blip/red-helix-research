import Home from './pages/Home';
import Cart from './pages/Cart';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Cart": Cart,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import Landing from './components/Landing';
import About from './components/About';
import Contact from './components/Contact';
import ReOrder from './components/ReOrder';
import Products from './components/Products';
import StoreLocator from './components/StoreLocator';

const App = () => {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/views/landing" component={Landing} />
        <Route path="/views/about" component={About} />
        <Route path="/views/contact" component={Contact} />
        <Route path="/views/re-order" component={ReOrder} />
        <Route path="/views/products" component={Products} />
        <Route path="/views/store_locator" component={StoreLocator} />
      </Switch>
    </Router>
  );
};

export default App;

import styles from "./App.module.css"
import TopBar from './components/topbar';
import Mint from './components/mint';
import HomePage from './components/homepage';
import Collections from './components/collections';
// import Modal from 'react-bootstrap/Modal'
import { NotificationContainer } from 'react-notifications';
import { Routes, Route } from "react-router-dom";
import Marketplace from "./components/marketplace";
import Wallets from "./components/wallets";
import Mandala from "./components/mandala";
import { useEffect, useState } from "react";

function App() {
  const [addr, setAddr] = useState();

  useEffect(() => {
    async function fetchAddr() {
      const localAddr = localStorage.getItem('addr')
      if (localAddr !== null) {
        setAddr(localAddr)
      }
    }
    fetchAddr()
  }, [])

  return (
    <div className={styles.App}>
      <TopBar loggedIn={false} />
      <NotificationContainer className={styles.Notifs} />
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/mint" element={<Mint addr={addr}/>} />
        <Route path="/collections" element={<Collections addr={addr} />} />
        <Route path="/marketplace" element={<Marketplace addr={addr} />} />
        <Route path="/wallet/:id" element={<Wallets addr={addr}/>} />
        <Route path="/mandala/:id" element={<Mandala addr={addr} />} />
      </Routes>
    </div>
  );
}

export default App;

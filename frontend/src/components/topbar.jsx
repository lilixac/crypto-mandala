import { Nav, Navbar, Modal, Button, InputGroup, FormControl } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { formatAddress } from '../utils/formatting';
import { setAddrToLocalStorage } from '../helpers/iconservice';
import styles from "../App.module.css"

const TopBar = ({ loggedIn }) => {
  const [privateKey, setPrivateKey] = useState('');
  const [addr, setAddr] = useState();
  const [logIn, setLoggedIn] = useState(loggedIn);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    async function fetchAddr() {
      const addr = localStorage.getItem('addr')
      if (addr !== null) {
        setAddr(addr)
        setLoggedIn(true)
      }
    }
    fetchAddr();
  }, [])

  const saveData = () => {
    setAddrToLocalStorage(privateKey)
    setLoggedIn(true)
    window.location.reload()
    handleClose();
  }

  const disconnect = () => {
    localStorage.clear();
    setLoggedIn(false);
  }

  return (
    <>
      <Navbar sticky="top" collapseOnSelect bg="white" expand="lg" variant="light" className={styles.TopBar}>
        <Navbar.Brand style={{ "marginLeft": "10%", "height": "50px" }}><h3><Link to="/" className={styles.PlainText}>CRYPTO MANDALA</Link></h3></Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto" ></Nav>
          <Nav className={styles.PlainText} style={{ "paddingRight": "10%" }}>
            <Nav.Link><Link to="/mint" className={styles.PlainText}>Mint</Link></Nav.Link>
            <Nav.Link><Link to="/collections" className={styles.PlainText}>Collections</Link></Nav.Link>
            <Nav.Link><Link to="/marketplace" className={styles.PlainText}>Marketplace</Link></Nav.Link>
            {
              logIn ?
                <>
                  <Nav.Link><Link to={`/wallet/${addr}`} className={styles.PlainText}>{formatAddress(addr)}</Link></Nav.Link>
                  <Nav.Link onClick={disconnect} className={styles.PlainText}>Disconnect</Nav.Link>
                </> :
                <Nav.Link onClick={handleShow}> Connect Wallet </Nav.Link>
            }

          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Connect Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>Enter your private key:
          <InputGroup className="mb-3">
            <FormControl
              placeholder="Enter private key"
              onChange={e => setPrivateKey(e.target.value)}
            />
            <InputGroup.Text id="basic-addon2">ICX</InputGroup.Text>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Exit
          </Button>
          <Button variant="primary" onClick={saveData}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}


export default TopBar;
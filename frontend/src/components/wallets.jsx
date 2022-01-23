import { readOnly, sendTx } from "../helpers/iconservice"
import { useState, useEffect } from 'react'
import { NotificationManager } from 'react-notifications'
import { useParams } from 'react-router-dom'
import { BigNumber } from "bignumber.js";
import styles from '../App.module.css'
import { Container, Modal, Card, Row, Col, ListGroup, Button, InputGroup, FormControl } from 'react-bootstrap';

const Wallets = ({ addr }) => {
    const [tokens, setTokens] = useState(["1"]);
    const { id } = useParams();

    useEffect(() => {
        async function fetchMyAPI(addr) {
            let response = await readOnly('getTokensByAddress', { '_owner': String(addr) })
            setTokens(response)
        }
        fetchMyAPI(id)
    }, [id])


    return <Container>
        <h1> <br />Wallet Collections: <br /></h1>
        <Row xs={1} md={4} className="g-4">
            {
                tokens && tokens.map(i => <Wallet key={i} addr={addr} disable={addr===undefined} id={parseInt(i)} />)
            }
            {
                (tokens && tokens.length === 0) ? <p> You do not own any tokens. You can buy from Marketplace.</p> : null
            }
        </Row>
    </Container>
}

const Wallet = ({ id, addr, disable }) => {
    const [uri, setURI] = useState();
    const [isOnSale, setIsOnSale] = useState();
    const [price, setPrice] = useState(0);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        async function fetchMyAPI() {
            let response = await readOnly('getTokenURI', { "_tokenId": JSON.stringify(id) })
            let response2 = await readOnly('isOnSale', { "_tokenId": JSON.stringify(id) })
            setIsOnSale(response2)
            let ipfsResponse = await fetch(`https://ipfs.io/ipfs/${response}/1.png`);
            try {
                const responseJSON = await Promise.resolve(ipfsResponse);
                setURI(responseJSON.url)
            } catch (err) {
                console.log(err);
                throw err;
            }
        }
        fetchMyAPI()
    }, [id])

    const setOnSale = async () => {
        const params = {
            _tokenId: JSON.stringify(id),
            _price: `${BigNumber(parseInt(price) * 10 ** 18)}`
        }
        handleClose()
        NotificationManager.info("Setting on sale....")
        const txResult = await sendTx("listOnSale", params, 0)
        if (txResult.status === 0) {
            NotificationManager.error("Error listing on sale...")
        } else {
            NotificationManager.success("List on sale complete.", txResult.txHash)
            window.location.reload()
        }
    }

    const removeFromSale = async () => {
        const params = {
            _tokenId: JSON.stringify(id)
        }
        handleClose()
        NotificationManager.info("Removing from sale....")
        const txResult = await sendTx("removeFromSale", params, 0)
        if (txResult.status === 0) {
            NotificationManager.error("Error removing from on sale...")
        } else {
            NotificationManager.success("Remove from sale complete.", txResult.txHash)
            window.location.reload()
        }
    }

    return (
        <Col>
            <Card>
                <Card.Img src={uri} />
                <Card.Body>
                    <ListGroup>
                        <ListGroup.Item>CryptoMandala#{id}</ListGroup.Item>
                        {
                            isOnSale === "0x1" ?
                                <>
                                    <ListGroup.Item> &nbsp;
                                        <Button variant="outline-danger"
                                            disabled={disable}
                                            className={styles.CenterButtonSale}
                                            onClick={removeFromSale}
                                        >
                                            On Sale
                                        </Button>
                                    </ListGroup.Item>
                                </>
                                :
                                <>
                                    <ListGroup.Item>&nbsp;
                                        <Button onClick={handleShow}
                                            disabled={disable}
                                            className={styles.CenterButtonSale}
                                            variant="outline-dark"
                                        >
                                            Set On Sale
                                        </Button>
                                    </ListGroup.Item>
                                </>
                        }
                    </ListGroup>
                </Card.Body>
            </Card>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Set On Sale</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <InputGroup className="mb-3">
                        <FormControl
                            placeholder="Set Price in ICX"
                            onChange={e => setPrice(e.target.value)}
                        />
                        <InputGroup.Text id="basic-addon2">ICX</InputGroup.Text>
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-dark" onClick={handleClose}>
                        Exit
                    </Button>
                    <Button variant="outline-danger" onClick={setOnSale}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </Col>
    );
}

export default Wallets;
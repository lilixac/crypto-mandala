import { readOnly, sendTx } from "../helpers/iconservice";
import { Card, Container, ListGroup, Col, Row, Button, Modal, Badge } from 'react-bootstrap';
import { useState, useEffect } from "react";
import { NotificationManager } from 'react-notifications'
import { Link } from "react-router-dom"
import styles from "../App.module.css"

const Marketplace = ({addr}) => {
    const [onSale, setOnSale] = useState();
    useEffect(() => {
        async function fetchMyAPI() {
            let response = await readOnly('getTokensOnSale', {})
            setOnSale(response)
        }
        fetchMyAPI()
    }, [])

    return (
        <Container>
            <h1> <br />Marketplace: <br /></h1>
            <Row xs={1} md={4} className="g-4">
                {
                    onSale && onSale.map(i =>
                        <IndividualItem addr={addr} key={i} id={parseInt(i)} />
                    )
                }
                {
                    (onSale && onSale.length === 0) ? <p> Nothing on sale right now, please check later</p> : null
                }
            </Row>
        </Container >
    )
}

const IndividualItem = ({ id, addr }) => {
    const [URI, setURI] = useState();
    const [price, setPrice] = useState();
    const [owner, setOwner] = useState();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        async function fetchMyAPI() {
            let response = await readOnly('getTokenURI', { "_tokenId": JSON.stringify(id) })
            let response2 = await readOnly('getPrice', { '_tokenId': JSON.stringify(id) })
            let response3 = await readOnly('ownerOf', { "_tokenId": JSON.stringify(id) })
            setOwner(response3)
            setPrice(parseInt(response2, 16))
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

    const buyToken = async () => {
        const params = {
            _tokenId: JSON.stringify(id),
        }
        handleClose()
        NotificationManager.info("Sending buy order...")
        const txResult = await sendTx("buy", params, price)
        if (txResult.status === 0) {
            NotificationManager.error("Error buying...")
        } else {
            NotificationManager.success("Buy complete.", txResult.txHash)
            window.location.reload()
        }
    }

    return (
        <Col>
            <Card>
                <Card.Img src={URI} />
                <Card.Text>
                    <ListGroup>
                        <ListGroup.Item ><Link to={`/mandala/${id}`} className={styles.PlainText}>CryptoMandala#{id}</Link></ListGroup.Item>
                        <ListGroup.Item >{price / 10 ** 18} ICX
                            {
                                addr === owner ?                                 
                                <Badge className={styles.RightAlign} pill bg="danger"> On Sale </Badge> : 
                                <>{
                                    addr ? 
                                        <Button
                                            variant="outline-dark"
                                            className={styles.RightAlign}
                                            onClick={handleShow}
                                        >
                                        Buy Now
                                        </Button> 
                                        : 
                                    null
                                    }
                                </>
                            }

                        </ListGroup.Item>
                    </ListGroup>
                </Card.Text>
            </Card>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Buy Mandala</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to buy this token?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-dark" onClick={handleClose}>
                        Exit
                    </Button>
                    <Button variant="outline-success" onClick={buyToken}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </Col>
    )
}


export default Marketplace;
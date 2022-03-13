import styles from "../App.module.css"
import { readOnly } from "../helpers/iconservice";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { Card, Row, Col, ProgressBar } from 'react-bootstrap'

const Description = () => {
    const [totalSupply, setTotalSupply] = useState([1]);

    useEffect(() => {
        async function fetchMyAPI() {
            let response = await readOnly('totalSupply', {})
            setTotalSupply(parseInt(response))
        }
        fetchMyAPI()
    }, [])

    return (
        <>
            <Card className="text-center">
                <Card.Body>
                    <Card.Title className={styles.BottomSpace} >Crypto Mandala is a collection of 100 unique algorithmically generated mandalas.</Card.Title>
                    <Card.Text>
                        <h3> Digital Collectible <br /><br /></h3>
                        <Row>
                            <Col sm={4}></Col>
                            <Col sm={4}>
                                Cypto Mandalas are a set of 100 mandalas, generated algorithmically and permanently engraved on the ICON blockchain.
                                Each mandala has a unique appearance, design and colors.
                                No two mandalas will be same.<br /><br />
                                Users can mint the mandalas, and the mandalas will be generated algorithmically, and once 100 is reached, they can no longer be minted.
                            </Col>
                            <Col sm={4}></Col>
                        </Row>
                    </Card.Text>
                </Card.Body>
            </Card>
            {/* credit: https://www.reddit.com/r/generative/comments/gznobv/mandalas/ */}
            <img className={styles.SmallerImage} alt="Some generated mandalas" src="https://i.redd.it/c91no5r62w351.png" />
            <br /><br /><br />
            <Row>
                <Col sm={3}></Col>
                <Col sm={6}>
                    <Card.Text className={styles.CenterAlign}>
                        3 days since launch.
                        <br />
                        {totalSupply} mandalas has already been minted.
                        <br /><br />
                        <ProgressBar animated variant="dark" now={100} />
                        <br />
                        You can still mint mandalas, Mint your mandalas <Link to="/mint">here</Link>.
                        <br />
                    </Card.Text>
                </Col>
                <Col sm={3}></Col>
            </Row>


        </>)
};

export default Description;
import { readOnly } from "../helpers/iconservice";
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom"
import styles from '../App.module.css'
import { Container, Card, Row, Col } from 'react-bootstrap';

const Collections = () => {
    const [totalSupply, setTotalSupply] = useState([1]);

    useEffect(() => {
        async function fetchMyAPI() {
            let response = await readOnly('totalSupply', {})
            let arr = []
            for (let i = 1; i <= parseInt(response); i++) {
                arr.push(i)
            }
            setTotalSupply(arr)
        }
        fetchMyAPI()
    }, [])

    return <Container>
        <h1> <br />Collections: <br /></h1>
        <Row xs={1} md={4} className="g-4">
            {
                totalSupply.map(i => <Collection key={i} id={i} />)
            }
        </Row>
    </Container>
}

const Collection = ({ id }) => {
    const [uri, setURI] = useState();

    useEffect(() => {
        async function fetchMyAPI() {
            let response = await readOnly('getTokenURI', { "_tokenId": JSON.stringify(id) })
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

    return (
        <Col>
            <Card>
                <Card.Img src={uri} />
                <Card.Body><Link className={styles.PlainText} to={`/mandala/${id}`}>CryptoMandala#{id}</Link></Card.Body>
            </Card>
        </Col>
    );
}

export default Collections;
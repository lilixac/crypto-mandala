import { readOnly } from "../helpers/iconservice";
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'
import styles from '../App.module.css'
import { Container, Row, Col, Badge, ListGroup } from 'react-bootstrap';

const Mandala = ({addr}) => {
    const [uri, setURI] = useState("1")
    const [owner, setOwner] = useState()
    const { id } = useParams();

    useEffect(() => {
        async function fetchMyAPI() {
            let response = await readOnly('getTokenURI', { "_tokenId": id })
            let response2 = await readOnly('ownerOf', { "_tokenId": id })
            setOwner(response2)
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


    return <Container>

        <Row>
            <Col sm={5}>
                <ListGroup className={styles.SpaceOnTop}>
                    <ListGroup.Item>CryptoMandala#{id}</ListGroup.Item>
                    <ListGroup.Item>Owner: <Link className={styles.PlainText} to={`/wallet/${owner}`}>{owner}
                    </Link></ListGroup.Item>
                    {addr === owner ? <ListGroup.Item><Badge pill bg="success">Your's truly</Badge></ListGroup.Item> : null}

                </ListGroup>
            </Col>
            <Col sm={7}><img alt="mandala" className={styles.SmallerImage} src={uri} /></Col>
        </Row>

    </Container>
}


export default Mandala;
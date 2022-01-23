import styles from "../App.module.css"
import {Link} from 'react-router-dom'
import { Card, Row, Col, Alert, ProgressBar } from 'react-bootstrap'

const Description = () => <>
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
                All 100 mandalas has already been minted.
                <br /><br />
                You can no longer mint mandalas, but you can buy them from the marketplace. They'll last forever.
                <br/><br/>
                <ProgressBar animated variant="info" now={100} />
                <br/>
                <Alert variant="info">
                    <Link to="/marketplace">MARKETPLACE</Link>
                </Alert>
            </Card.Text>
        </Col>
        <Col sm={3}></Col>
    </Row>


</>;

export default Description;
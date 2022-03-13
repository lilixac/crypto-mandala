import { sendTx } from "../helpers/iconservice";
import styles from "../App.module.css"
import { NotificationManager } from 'react-notifications'
import { InputGroup, Container, Button } from 'react-bootstrap';

const Mint = ({addr}) => {

    const mintNFT = async () => {
        const params = {
            _to: addr
        }
        NotificationManager.info("Sending mint request...")
        var txResult = await sendTx("mint", params, '40000000000000000000');
        if (txResult.status === 0) {
            NotificationManager.error("Error minting...")
        } else {
            NotificationManager.success("Mint complete.", txResult.txHash)
        }
    }

    return (
        <Container>
            <h1 className={styles.MintTitle}> Create New </h1>
            <p className={styles.CenterAlign}> Minting costs 40 ICX. </p>
            <img className={styles.SmallerImage} alt="random" src="https://upload.wikimedia.org/wikipedia/commons/2/21/Mandel_zoom_00_mandelbrot_set.jpg" />
            <InputGroup className="mb-3">
                <Button className={styles.CenterButton} size="lg" variant="outline-dark" onClick={mintNFT}>Generate</Button>
            </InputGroup>
        </Container>
    )
}


export default Mint;
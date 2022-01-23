import { sendTx } from "../helpers/iconservice";
import styles from "../App.module.css"
import { NotificationManager } from 'react-notifications'
import { InputGroup, Container, Button } from 'react-bootstrap';

const Mint = ({addr}) => {
    const generateMandala = () => {
        return "bafybeigwmyvhjkjego7u377piopff7hg65d3kpqcciyjbyzogr7b2dsnbm"
    }

    const mintNFT = async () => {
        const params = {
            _to: addr,
            _tokenURI: generateMandala()
        }
        NotificationManager.info("Sending mint request...")
        var txResult = await sendTx("mint", params, 0)
        if (txResult.status === 0) {
            NotificationManager.error("Error minting...")
        } else {
            NotificationManager.success("Mint complete.", txResult.txHash)
        }
    }

    return (
        <Container>
            <h1 className={styles.MintTitle}> Create New </h1>
            <img className={styles.SmallerImage} alt="random" src="https://ipfs.io/ipfs/bafybeigwmyvhjkjego7u377piopff7hg65d3kpqcciyjbyzogr7b2dsnbm/1.png" />
            <InputGroup className="mb-3">
                <Button className={styles.CenterButton} size="lg" variant="outline-dark" onClick={mintNFT}>Generate</Button>
            </InputGroup>
        </Container>
    )
}


export default Mint;
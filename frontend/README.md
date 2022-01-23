# CryptoMandala Frontend

This site does not need any separate constants or environment variables to run. The required constants are listed in `consts.js`.

A NFT contract was written and deployed to sejong testnet of ICON Blockchain. This web apps calls various methods of the `crypto_mandala` smart contract on the UI. The hashes of images are stored on chain, and the images are stored off chain in IPFS. The frontend queries the smart contract, which points to the ipfs link, and the frontend renders the image stored in IPFS.

## TODO
- Generate mandala algorithmically in image/gif format
- Store the generated image in IPFS and save use that hash during mint

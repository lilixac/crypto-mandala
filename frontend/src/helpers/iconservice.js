import CONSTS from "../consts"
import IconService from 'icon-sdk-js'

export async function readOnly(method, params) {
	const txObj = {
		jsonrpc: "2.0",
		method: "icx_call",
		id: 1234,
		params: {
			to: CONSTS.crypto_mandala,
			dataType: "call",
			data: {
				"method": method,
				"params": params
			}
		}
	}
	try {
		const responsePromise = await fetch(CONSTS.sejongRpcUrl,
			{
				method: 'POST',
				body: JSON.stringify(txObj),
				headers: {
					"Content-Type": "application/json"
				}
			}
		);
		const responseJSON = await responsePromise.json();
		return responseJSON.result;


	} catch (err) {
		console.error("FETCH:", err);
		throw err;
	}
}

export async function setAddrToLocalStorage(pk) {
	const { IconWallet } = IconService
	const wallet = IconWallet.loadPrivateKey(pk)
	localStorage.setItem("addr", wallet.getAddress())
	localStorage.setItem("pk", pk)
}

function timeout(instance) {
    const seconds = instance === 1 ? 5000 : 1000;
    return new Promise(resolve => setTimeout(resolve, seconds));
  }

export async function sendTx(method, params, value) {
	
	const { IconBuilder, SignedTransaction, IconWallet, HttpProvider, IconConverter } = IconService
	const iconService = new IconService(new HttpProvider(CONSTS.sejongRpcUrl))
	const callTxnBuilder = new IconBuilder.CallTransactionBuilder()
	const pk = localStorage.getItem("pk")
	const wallet = IconWallet.loadPrivateKey(pk)

	const txObj = callTxnBuilder
		.nid(CONSTS.NID)
		.from(wallet.getAddress())
		.to(CONSTS.crypto_mandala)
		.stepLimit(IconConverter.toBigNumber('2000000'))
		.version(IconConverter.toBigNumber(3))
		.timestamp(Date.now() * 1000)
		.value(IconConverter.toBigNumber(value))
		.nonce(IconConverter.toBigNumber(1))
		.method(method)
		.params(params)
		.build();

	/* Create SignedTransaction instance */
	const signedTransaction = new SignedTransaction(txObj, wallet)

	const txHash = await iconService.sendTransaction(signedTransaction).execute()
	let instance = 1
	/* Send transaction. It returns transaction hash. */
	
	try {
		await timeout(instance)
		console.log(txHash)
		const txnResult =  await iconService.getTransactionResult(txHash).execute()
		console.log(txnResult)
		return txnResult

	} catch (error) {
		console.log(error)
		throw error
	}
}
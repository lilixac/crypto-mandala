from iconservice import AddressPrefix, Address
from iconsdk.exception import JSONRPCException
from iconsdk.libs.in_memory_zip import gen_deploy_data_content
from iconsdk.icon_service import IconService
from iconsdk.providers.http_provider import HTTPProvider
from iconsdk.builder.transaction_builder import CallTransactionBuilder, TransactionBuilder, DeployTransactionBuilder,DepositTransactionBuilder
from iconsdk.builder.call_builder import CallBuilder
from iconsdk.signed_transaction import SignedTransaction
from iconsdk.wallet.wallet import KeyWallet
from pprint import pprint
from checkscore.repeater import retry

NETWORK = "sejong"

connections = {
    "mainnet": {"iconservice": "https://ctz.solidwallet.io", "nid": 1},
    "goloop": {"iconservice": "http://18.237.205.52:9082/", "nid": 3},
    "berlin": {"iconservice": "https://berlin.net.solidwallet.io", "nid": 7},
    "lisbon": {"iconservice": "https://lisbon.net.solidwallet.io", "nid": 2},
    "sejong": {"iconservice": "https://sejong.net.solidwallet.io", "nid": 83}
}

env = connections[NETWORK]

icon_service = IconService(HTTPProvider(env["iconservice"], 3))
NID = env["nid"]

print(f"network -> {NETWORK}")
print(f"nid -> {NID}")

deployer_wallet = KeyWallet.load(bytes.fromhex('<PK>'))
print(deployer_wallet.get_address())
print(icon_service.get_balance(deployer_wallet.get_address())/10**18)
SCORE = "cx0000000000000000000000000000000000000000"
################
#### UTILS #####
################

@retry(JSONRPCException, tries=5, delay=1, back_off=2)
def get_tx_result(_tx_hash):
    tx_result = icon_service.get_transaction_result(_tx_hash)
    return tx_result

def deploy_contract(_contract_name, params):
    deploy_transaction = DeployTransactionBuilder() \
        .from_(deployer_wallet.get_address()) \
        .to(SCORE) \
        .nid(NID) \
        .nonce(100) \
        .step_limit(9000000000) \
        .content_type("application/zip") \
        .content(gen_deploy_data_content(_contract_name)) \
        .params(params) \
        .build()
    signed_transaction = SignedTransaction(deploy_transaction, deployer_wallet)
    tx_hash = icon_service.send_transaction(signed_transaction)
    res = get_tx_result(tx_hash)
    pprint(res)
    return res.get('scoreAddress')


def call_tx(addr, method, params):
    call = CallBuilder()\
        .from_('hx91bf040426f226b3bfcd2f0b5967bbb0320525ce')\
        .to(addr)\
        .method(method)\
        .params(params)\
        .build()
    response = icon_service.call(call)
    return response

def send_tx(_to, _method, _params, _value, _wallet) -> int:
    transaction = CallTransactionBuilder() \
        .from_(_wallet.get_address()) \
        .to(_to) \
        .value(_value) \
        .step_limit(10000000) \
        .nid(NID) \
        .nonce(100) \
        .method(_method) \
        .params(_params) \
        .build()
    signed_transaction = SignedTransaction(transaction, _wallet)
    tx_hash = icon_service.send_transaction(signed_transaction)
    print(f"{_to} ::> {_method} ::> {tx_hash}")
    response = get_tx_result(tx_hash)
    pprint(response)


deploy_contract("crypto_mandala", {})
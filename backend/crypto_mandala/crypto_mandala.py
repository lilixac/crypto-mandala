from iconservice import *

TAG = 'Crypto Mandala'
EOA_ZERO = Address.from_string('hx' + '0' * 40)

class TokenStandard(ABC):
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def symbol(self) -> str:
        pass

    @abstractmethod
    def balanceOf(self, _owner: Address) -> int:
        pass

    @abstractmethod
    def ownerOf(self, _tokenId: int) -> Address:
        pass

    @abstractmethod
    def getApproved(self, _tokenId: int) -> Address:
        pass

    @abstractmethod
    def approve(self, _to: Address, _tokenId: int):
        pass

    @abstractmethod
    def transfer(self, _to: Address, _tokenId: int):
        pass

    @abstractmethod
    def transferFrom(self, _from: Address, _to: Address, _tokenId: int):
        pass


class CryptoMandala(IconScoreBase):
    _BALANCES = "balances"
    _OWNERS = "owners"
    _TOKEN_URIS = "token_URIs"
    _TOKEN_APPROVALS = "token_approvals"
    _SUPPLY_CAP = "supply_cap"
    _TOTAL_SUPPLY = "total_supply"
    _ON_SALE = "on_sale"
    _SALE_INFO = "sale_info"
    _USER_TOKENS = "user_tokens"

    @eventlog(indexed=3)
    def Approval(self, _owner: Address, _approved: Address, _tokenId: int):
        pass

    @eventlog(indexed=3)
    def Transfer(self, _from: Address, _to: Address, _tokenId: int):
        pass

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)
        self._balances = DictDB(self._BALANCES, db, value_type=int)
        self._supply_cap = VarDB(self._SUPPLY_CAP, db, value_type=int)
        self._total_supply = VarDB(self._TOTAL_SUPPLY, db, value_type=int)
        self._owners = DictDB(self._OWNERS, db, value_type=Address)
        self._token_URIs = DictDB(self._TOKEN_URIS, db, value_type=str)
        self._token_approvals = DictDB(self._TOKEN_APPROVALS, db, value_type=Address)
        self._on_sale = ArrayDB(self._ON_SALE, db, value_type=int)
        self._user_tokens = DictDB(self._USER_TOKENS, db, value_type=str)
        self._sale_info = DictDB(self._SALE_INFO, db, value_type=int, depth=2)

    def on_install(self) -> None:
        super().on_install()
        self._total_supply.set(0)
        self._supply_cap.set(100)

    def on_update(self) -> None:
        super().on_update()

    @external(readonly=True)
    def name(self) -> str:
        return TAG

    @external(readonly=True)
    def totalSupply(self) -> int:
        return self._total_supply.get()

    @external(readonly=True)
    def supplyCap(self) -> int:
        return self._supply_cap.get()

    @external(readonly=True)
    def balanceOf(self, _owner: Address) -> int:
        # zero address check
        if _owner == EOA_ZERO:
            revert("Balance query for zero address")
        return self._balances[_owner]

    @external(readonly=True)
    def ownerOf(self, _tokenId: int) -> Address:
        owner = self._owners[_tokenId]
        if owner is None:
            revert("Token query for non existent token")
        # checks needed here
        if owner is EOA_ZERO:
            revert("Token query for non existent token")
        return owner

    @external(readonly=True)
    def getApproved(self, _tokenId: int) -> Address:
        # check if token exists
        if not self._token_exists(_tokenId):
            revert("Approved query for non existent token")
        approved_to = self._token_approvals[_tokenId]
        if approved_to is None:
            return EOA_ZERO
        return approved_to

    @external(readonly=True)
    def getTokenURI(self, _tokenId: int) -> str:
        if not self._token_exists(_tokenId):
            revert("URI query for non existent token")
        uri = self._token_URIs[_tokenId]
        return uri

    @external(readonly=True)
    def getTokensOnSale(self) -> list:
        return [i for i in self._on_sale]
    
    @external(readonly=True)
    def isOnSale(self, _tokenId: int) -> bool:
        if self._sale_info[_tokenId]["ON_SALE"] == 1:
            return True
        return False
    
    @external(readonly=True)
    def getPrice(self, _tokenId: int) -> int:
        if self._sale_info[_tokenId]["ON_SALE"] == 1:
            return self._sale_info[_tokenId]["PRICE"]
        return 0
    
    @external(readonly=True)
    def temp(self, _owner: Address) -> str:
        return self._user_tokens[_owner]
    
    @external(readonly=True)
    def getTokensByAddress(self, _owner: Address) -> list:
        tokensIds = self._user_tokens[_owner].split(",")
        tokensIds.pop()
        return [i for i in tokensIds]
    
    @external
    def approve(self, _to: Address, _tokenId: int):
        owner = self._owners[_tokenId]
        if _to == owner:
            revert("Cannot approve to token owner")
        if owner != self.msg.sender:
            revert("You do not own this token")

        self._approve(_to, _tokenId)

    @external
    def transfer(self, _to: Address, _tokenId: int):
        self._transfer(self.msg.sender, _to, _tokenId)

    @external
    def transferFrom(self, _from: Address, _to: Address, _tokenId: int):
        if not self._isApprovedOrOwner(self.msg.sender, _tokenId):
            revert("Not owner or approved")
        self._transfer(_from, _to, _tokenId)
    
    @external
    def setTokenURI(self, _tokenId: int, _tokenURI: str = None) -> None:
        if not self._token_exists(_tokenId):
            revert("Trying to set URI for non existent token")

        if self.msg.sender != self.ownerOf(_tokenId):
            revert("Changing URI of token that is not own")

        if _tokenURI is None:
            _tokenURI = ""
        self._token_URIs[_tokenId] = _tokenURI

    @external
    def listOnSale(self, _tokenId: int, _price: int) -> None:
        if self.ownerOf(_tokenId) != self.msg.sender:
            revert("Only owner can list on sale")
        
        if _tokenId in self._on_sale:
            revert("Already listed on sale")
        
        if _price <= 0:
            revert("Price cannot be zero or less")

        self._sale_info[_tokenId]["PRICE"] = _price
        self._sale_info[_tokenId]["ON_SALE"] = 1
        self._on_sale.put(_tokenId)
    
    @external
    def removeFromSale(self, _tokenId: int) -> None:
        if _tokenId not in self._on_sale:
            revert("Not listed for sale.")
        
        if self.ownerOf(_tokenId) != self.msg.sender:
            revert("Only owner can remove token from sale list")
        
        self._removeFromSale(_tokenId)
    
    @payable
    @external
    def buy(self, _tokenId: int) -> None:
        if _tokenId not in self._on_sale:
            revert("Not listed for sale.")
        
        prevOwner = self.ownerOf(_tokenId)
        newOwner = self.msg.sender
        price = self._sale_info[_tokenId]["PRICE"]
        amountSent = self.msg.value

        if amountSent < price:
            revert("Insufficient funds sent.")
        
        if amountSent > price:
            self.icx.transfer(newOwner, amountSent - price)
        
        self.icx.transfer(prevOwner, price)
        self._transfer(prevOwner, newOwner, _tokenId)       
        

    @external
    def mint(self, _to: Address, _tokenURI: str = None) -> None:
        if _to == EOA_ZERO:
            revert("Cannot transfer to zero address")
        _tokenId = self.totalSupply() + 1
        if _tokenId < 0:
            revert("TokenId should be positive")
        if _tokenId > self.supplyCap():
            revert("Cap reached. Maximum allowable tokens already minted")
        # check for token should not exist
        if self._token_exists(_tokenId):
            revert("Token is already minted")

        self._balances[_to] += 1
        self._owners[_tokenId] = _to
        self._total_supply.set(self.totalSupply()+1)

        self._sale_info[_tokenId]["ON_SALE"] = 0
        self._sale_info[_tokenId]["PRICE"] = 0

        self._user_tokens[_to] = self._user_tokens[_to]+ str(f"{_tokenId},")
        # ideally use IPFS hash for tokenURI
        if _tokenURI is None:
            _tokenURI = ""
        self._token_URIs[_tokenId] = _tokenURI
        self.Transfer(EOA_ZERO, _to, _tokenId)

    def _transfer(self, _from: Address, _to: Address, _tokenId: int) -> None:
        # check if token exists
        if not self._token_exists(_tokenId):
            revert("Trying to transfer non existent token")
        owner = self.ownerOf(_tokenId)

        if _from != owner:
            revert("Transfer of token that is not own")
        if _to == owner:
            revert("Cannot transfer to token owner")
        if _to == EOA_ZERO:
            revert("Cannot transfer to zero address")

        self._approve(EOA_ZERO, _tokenId)

        self._balances[_from] -= 1
        self._balances[_to] += 1
        self._owners[_tokenId] = _to

        self._user_tokens[_to] = self._user_tokens[_to]+ str(f"{_tokenId},")
        from_tokens = self._user_tokens[_from].split(",")
        from_tokens.remove(str(_tokenId))
        from_tokens.remove('')
        temp = ""
        for i in from_tokens:
            temp = temp + i + "," 
        self._user_tokens[_from] = temp
        
        self._removeFromSale(_tokenId)

        self.Transfer(_from, _to, _tokenId)

    def _approve(self, _to: Address, _tokenId: int):
        # check if token exists
        if not self._token_exists(_tokenId):
            revert("Trying to approve non existent token")
        self._token_approvals[_tokenId] = _to
        self.Approval(self.msg.sender, _to, _tokenId)

    def _isApprovedOrOwner(self, _spender: Address, _tokenId: int) -> bool:
        # check if token exists
        if not self._token_exists(_tokenId):
            revert("Query for a non existent token")
        owner = self.ownerOf(_tokenId)
        approved_to = self.getApproved(_tokenId)
        return _spender == owner or _spender == approved_to

    def _token_exists(self, _tokenId: int) -> bool:
        owner = self._owners[_tokenId]
        if owner is None or owner is EOA_ZERO:
            return False
        return True
    
    def _removeFromSale(self, _tokenId: int) -> None:
        
        self._sale_info[_tokenId]["PRICE"] = 0
        self._sale_info[_tokenId]["ON_SALE"] = 0

        if _tokenId in self._on_sale: 
            top = self._on_sale.pop()
            if top != _tokenId:
                for i in range(len(self._on_sale)):
                    if self._on_sale[i] == _tokenId:
                        self._on_sale[i] = top
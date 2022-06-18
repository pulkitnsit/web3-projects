//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PtDemoDinosaur is ERC721Enumerable, PaymentSplitter, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
    using ECDSA for bytes32;

    Counters.Counter private _tokenIdCounter;

    uint256 public constant MAXSUPPLY = 30;
    uint256 public constant RESERVE_NFT_LIMIT = 6;
    uint256 public constant MAX_SELF_MINT = 10;

    address private signerAddress = 0x36e613368f927F7f003BeA06BD0f86405bd98BfA;

    uint256 public reserveCount;

    string public baseURI;
    string public notRevealedUri;

    bool public revealed = false;

    enum WorkflowStatus {
        Before,
        Presale,
        Sale,
        SoldOut,
        Reveal
    }

    struct SaleConfig {
        uint256 startTime;
        uint256 duration;
    }

    WorkflowStatus public workflow;
    SaleConfig public saleConfig;

    address private _owner;

    mapping(address => uint256) public tokensPerWallet;

    event ChangePresaleConfig(uint256 _startTime, uint256 _duration, uint256 _maxCount);
    event ChangeSaleConfig(uint256 _startTime, uint256 _maxCount);
    event ChangeIsBurnEnabled(bool _isBurnEnabled);
    event ChangeBaseURI(string _baseURI);
    event ReserveMint(address indexed _recipient, uint256 _amount);
    event PresaleMint(address indexed _minter, uint256 _amount, uint256 _price);
    event SaleMint(address indexed _minter, uint256 _amount, uint256 _price);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

    address[] private team_ = [0x36e613368f927F7f003BeA06BD0f86405bd98BfA,
                                0xeb8975c9FFD46B2381c33b5A51d6a6F4c1819b6B,
                                0x67Ac2e737e6005223ad6d2B048F37EACEAE1caf4];
    uint256[] private teamShares_ = [50, 30, 20];

    constructor(
        string memory _initBaseURI,
        string memory _initNotRevealedUri
    ) ERC721("PtDemoDinosaur", "PTDD") PaymentSplitter(team_, teamShares_) {
        transferOwnership(msg.sender);
        workflow = WorkflowStatus.Before;
        setBaseURI(_initBaseURI);
        setNotRevealedURI(_initNotRevealedUri);
    }

    //GETTERS

    function publicSaleLimit() public pure returns (uint256) {
        return MAXSUPPLY;
    }

    function privateSalePrice() public pure returns (uint256) {
        return 0.003 ether;
    }

    function allowedReserveLimit() public pure returns (uint256) {
        return RESERVE_NFT_LIMIT;
    }

    function getSaleStatus() public view returns (WorkflowStatus) {
        return workflow;
    }

    function getPrice() public view returns (uint256) {
        uint256 _price;
        SaleConfig memory _saleConfig = saleConfig;
        if (block.timestamp <= _saleConfig.startTime + 2 minutes) {
            _price = 0.01 ether;
        } else if (
            (block.timestamp >= _saleConfig.startTime + 2 minutes) &&
            (block.timestamp <= _saleConfig.startTime + 4 minutes)
        ) {
            _price = 0.008 ether;
        } else if (
            (block.timestamp > _saleConfig.startTime + 4 minutes) &&
            (block.timestamp <= _saleConfig.startTime + 6 minutes)
        ) {
            _price = 0.006 ether;
        } else {
            _price = 0.004 ether;
        }
        return _price;
    }


    function verifyAddressSigner(bytes32 messageHash, bytes memory signature)
        private
        view
        returns (bool)
    {
        return
            signerAddress ==
            messageHash.toEthSignedMessageHash().recover(signature);
    }

    function hashMessage(address sender) private pure returns (bytes32) {
        return keccak256(abi.encode(sender));
    }

    function presaleMint(bytes32 messageHash, bytes calldata signature)
    external
    payable
    nonReentrant
    {
        uint256 price = 0.003 ether;
        require(workflow == WorkflowStatus.Presale, "PtDemoDinosaur: Presale is not started yet!");
        require(tokensPerWallet[msg.sender] < 1, "PtDemoDinosaur: Presale mint is one token only.");
        require(hashMessage(msg.sender) == messageHash, "MESSAGE_INVALID");
        require(
            verifyAddressSigner(messageHash, signature),
            "SIGNATURE_VALIDATION_FAILED"
        );
        require(msg.value >= price, "INVALID_PRICE");

        tokensPerWallet[msg.sender] += 1;

        _safeMint(msg.sender, _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }

    function publicSaleMint(uint256 amount) public payable nonReentrant {
        uint256 supply = totalSupply();
        uint256 price = getPrice();
        require(workflow != WorkflowStatus.SoldOut, "PtDemoDinosaur: SOLD OUT!");
        require(workflow == WorkflowStatus.Sale, "ptDemoDinosaur: public sale is not started yet");
        require(msg.value >= price * amount, "PtDemoDinosaur: Insuficient funds");
        require(amount <= 5, "PtDemoDinosaur: You can only mint up to five token at once!");
        require(tokensPerWallet[msg.sender] + amount <= MAX_SELF_MINT, "PtDemoDinosaur: You can't mint more than 10 tokens!");
        require(supply + amount <= MAXSUPPLY, "PtDemoDinosaur: Mint too large!");
        uint256 initial = 1;
        uint256 condition = amount;
        tokensPerWallet[msg.sender] += amount;
         if (supply + amount == MAXSUPPLY) {
            workflow = WorkflowStatus.SoldOut;
        }
        for (uint256 i = initial; i <= condition; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    function reserve(uint256 _mintAmount) public onlyOwner {
        uint256 supply = totalSupply();
        require(supply + _mintAmount <= MAXSUPPLY, "The presale is not endend yet!");
        require(_mintAmount > 0, "need to mint at least 1 NFT");
        require(reserveCount + _mintAmount <= RESERVE_NFT_LIMIT, "max NFT limit exceeded");
        uint256 initial = 1;
        uint256 condition = _mintAmount;
        reserveCount += _mintAmount;
        for (uint256 i = initial; i <= condition; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    // Before All.

    function setUpPresale() external onlyOwner {
        workflow = WorkflowStatus.Presale;
    }

    function setUpSale() external onlyOwner {
//        require(workflow == WorkflowStatus.Presale, "ptDemoDinosaur: Unauthorized Transaction");
        uint256 _startTime = block.timestamp;
        uint256 _duration = 20 days;
        saleConfig = SaleConfig(_startTime, _duration);
        emit ChangeSaleConfig(_startTime, _duration);
        workflow = WorkflowStatus.Sale;
        emit WorkflowStatusChange(WorkflowStatus.Presale, WorkflowStatus.Sale);
    }

    function reveal() public onlyOwner {
        revealed = true;
    }
    
    function resetReveal() public onlyOwner {
        revealed = false;
    }

    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        notRevealedUri = _notRevealedURI;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }


    function setSignerAddress(address _newAddress) public onlyOwner {
        require(_newAddress != address(0), "CAN'T PUT 0 ADDRESS");
        signerAddress = _newAddress;
    }



    // FACTORY

    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        if (revealed == false) {
            return notRevealedUri;
        }

        string memory currentBaseURI = baseURI;
        return
            bytes(currentBaseURI).length > 0
                ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), ".json"))
                : "";
    }

}
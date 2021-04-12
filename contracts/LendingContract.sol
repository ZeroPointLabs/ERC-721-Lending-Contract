//SPDX-Licence-Identifier: MIT

import "./standards/ERC721.sol";

pragma solidity ^0.8.0;

contract DBNFT is ERC721 {
    using SafeMath for uint256;
    //Each DB-NFT will have the following data
    struct DB {
        uint256 id;
        uint256 value;
        string description;
        LoanStatus loanStatus;
        SaleStatus saleStatus;
        address payable owner;
        address borrower;
        uint256 onLoanFrom;
        uint256 loanPeriod;
    }

    DB[] public getNFTInfobyID;

    uint256 public NFTForLoanCount;
    uint256 public NFTForSaleCount;

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {}

    enum LoanStatus {FOR_LOAN, ON_LOAN, NOT_FOR_LOAN, LIQUIDATED}
    enum SaleStatus {FOR_SALE, NOT_FOR_SALE}

    //Function to CreateNFT
    function mintNFT(
        uint256 _value,
        string memory _description,
        address payable _owner
    ) public {
        DB memory _db =
            DB({
                id: 0,
                value: _value,
                description: _description,
                owner: _owner,
                loanStatus: LoanStatus.NOT_FOR_LOAN,
                onLoanFrom: 0,
                borrower: address(0),
                saleStatus: SaleStatus.NOT_FOR_SALE,
                loanPeriod: 0
            });
        getNFTInfobyID.push(_db);
        uint256 _tokenId = getNFTInfobyID.length - 1;
        _safeMint(msg.sender, _tokenId);
        uint256 _index = getTokenIndexByID(_tokenId);
        getNFTInfobyID[_index].id = _index;
    }

    //Function to List NFT for Loan
    function listNFTForLoan(uint256 _tokenId) public {
        require(msg.sender != address(0));
        address _owner = ownerOf(_tokenId);
        require(msg.sender == _owner);
        uint256 _index = getTokenIndexByID(_tokenId);
        _transfer(_owner, address(this), _tokenId);
        getNFTInfobyID[_index].loanStatus = LoanStatus.FOR_LOAN;
        NFTForLoanCount++;
    }

    //Function to List NFT for Loan
    function listNFTForSale(uint256 _tokenId, uint256 _value) public {
        require(msg.sender != address(0));
        uint256 _index = getTokenIndexByID(_tokenId);
        require(msg.sender == getNFTInfobyID[_index].owner);
        address _owner = ownerOf(_tokenId);
        getNFTInfobyID[_index].saleStatus = SaleStatus.FOR_SALE;
        getNFTInfobyID[_index].value = _value;
        NFTForSaleCount++;
        _transfer(_owner, address(this), _tokenId);
    }

    // Computes `k * (1+1/q) ^ N`, with precision `p`. The higher
    // the precision, the higher the gas cost. It should be
    // something around the log of `n`. When `p == n`, the
    // precision is absolute (sans possible integer overflows). <edit: NOT true, see comments>
    // Much smaller values are sufficient to get a great approximation.
    function fracExp(
        uint256 k,
        uint256 q,
        uint256 n,
        uint256 p
    ) internal pure returns (uint256) {
        uint256 s = 0;
        uint256 N = 1;
        uint256 B = 1;
        for (uint256 i = 0; i < p; ++i) {
            s += (k * N) / B / (q**i);
            N = N * (n - i);
            B = B * (i + 1);
        }
        return s;
    }

    //Computes the Loan Amount which is 2*tokenValue + 5% compound interest for every second
    function calcLoan(uint256 _tokenId, uint256 _periodInSeconds)
        public
        returns (uint256)
    {
        uint256 _index = getTokenIndexByID(_tokenId);
        uint256 tokenValue = getNFTInfobyID[_index].value;
        //interest = 5; //5% interest rate per second
        uint256 a = (100 * _periodInSeconds) / 5;
        uint256 compound = fracExp(tokenValue, a, _periodInSeconds, 8);
        //deposit - refundable - 2*value of token
        uint256 deposit = 2 * tokenValue;
        return (deposit + compound);
    }

    function borrowNFT(uint256 _tokenId, uint256 _periodInSeconds)
        public
        payable
    {
        require(msg.sender != address(0));
        require(_exists(_tokenId), "nonexistant token");
        uint256 _index = getTokenIndexByID(_tokenId);
        require(
            getNFTInfobyID[_index].loanStatus == LoanStatus.FOR_LOAN,
            "NFT is not available for loan"
        );
        uint256 loanAmount = calcLoan(_tokenId, _periodInSeconds);
        require(msg.value >= loanAmount, "Please send the minimum loan amount");
        getNFTInfobyID[_index].owner.transfer(msg.value);
        getNFTInfobyID[_index].borrower = msg.sender;

        getNFTInfobyID[_index].loanStatus = LoanStatus.ON_LOAN;
        getNFTInfobyID[_index].onLoanFrom = block.timestamp;
        getNFTInfobyID[_index].loanPeriod = _periodInSeconds;
        NFTForLoanCount--;
        _transfer(address(this), msg.sender, _tokenId);
    }

    function buyNFT(uint256 _tokenId, address payable _newOwner)
        public
        payable
    {
        require(msg.sender != address(0));
        require(_exists(_tokenId), "nonexistant token");
        uint256 _index = getTokenIndexByID(_tokenId);
        DB memory _db = getNFTInfobyID[_index];
        //Check the status of NFT and transferred value
        require(
            _db.saleStatus == SaleStatus.FOR_SALE,
            "NFT is not available for sale"
        );
        require(
            msg.value >= _db.value,
            "Please send atleast the sale amount to buy"
        );
        uint256 transferToOwner = msg.value - (2 * _db.value);
        //owner gets only the interest on successful loan
        getNFTInfobyID[_index].owner.transfer(transferToOwner);
        getNFTInfobyID[_index].owner = _newOwner;
        getNFTInfobyID[_index].saleStatus = SaleStatus.NOT_FOR_SALE;
        NFTForSaleCount--;
        _transfer(address(this), msg.sender, _tokenId);
    }

    //Function for Owner to liquidate the NFT if it passes the loan period
    function liquidateNFT(uint256 _tokenId, address payable _receiveAddress)
        public
    {
        require(msg.sender != address(0));
        require(_exists(_tokenId), "nonexistant token");
        uint256 _index = getTokenIndexByID(_tokenId);
        DB memory _db = getNFTInfobyID[_index];
        require(msg.sender == _db.owner, "Caller is not the owner of the NFT");
        require(_db.loanStatus == LoanStatus.ON_LOAN, "NFT is not on Loan");
        require(
            (block.timestamp - _db.onLoanFrom) > _db.loanPeriod,
            "NFT still within Loan period, cannot liquidate"
        );
        //Owner will get the borrower's deposit on liquidating
        uint256 liquidateAmount = 2 * _db.value;
        _receiveAddress.transfer(liquidateAmount);
        getNFTInfobyID[_index].loanStatus = LoanStatus.LIQUIDATED;
    }

    //Function for Borrower to return the NFT before the Loan Period
    function returnNFT(uint256 _tokenId, address payable _receiveAddress)
        public
        payable
    {
        require(msg.sender != address(0));
        require(_exists(_tokenId), "nonexistant token");
        uint256 _index = getTokenIndexByID(_tokenId);
        DB memory _db = getNFTInfobyID[_index];
        //Loan Period is still valid - not liquidated by the owner
        require(
            _db.loanStatus == LoanStatus.ON_LOAN,
            "Loan period voilated, so NFT is liquidated"
        );
        require(
            (block.timestamp - _db.onLoanFrom) <= _db.loanPeriod,
            "Loan period voilated, cannot return NFT"
        );
        getNFTInfobyID[_index].loanStatus = LoanStatus.NOT_FOR_LOAN;
        getNFTInfobyID[_index].onLoanFrom = 0;
        getNFTInfobyID[_index].loanPeriod = 0;
        transferFrom(msg.sender, getNFTInfobyID[_index].owner, _tokenId);
        uint256 deposit = 2 * getNFTInfobyID[_index].value;
        _receiveAddress.transfer(deposit);
    }
}

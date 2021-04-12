const BN = require("bn.js");
const DBNFT = artifacts.require("DBNFT");

const truffleAssert = require('truffle-assertions');

contract("DBNFT", (accounts) => {
    const tokenNameExpected = "DBNFT";
    const tokenSymbolExpected = "DB";
    const owner1 = accounts[0];
    const owner2 = accounts[1];
    const description1 = 'Description 1';
    const value1 = new BN('100');
    const description2 = 'description2';
    const value2 = new BN('100');
    let logs = null;
    let DBNFTInstance

    before(async ()=>{
        DBNFTInstance = await DBNFT.deployed();
        const name = await DBNFTInstance.name();
        const symbol = await DBNFTInstance.symbol();
        assert.equal(name, tokenNameExpected, "Token Name not as Expected");
        assert.equal(symbol, tokenSymbolExpected, "Symbol not as Expected");
        await DBNFTInstance.mintNFT(value1,description1,owner1);
        await DBNFTInstance.mintNFT(value2,description2,owner1);
    });

    it("test balanceOf()", async () => {
        const bal = await DBNFTInstance.balanceOf(owner1);
        assert.equal(bal.toNumber(),2, "The initial balance of token is not as expected");
    });

    it("test ownerOf()", async () => {
        const tokenId = new BN('0');
        assert(await DBNFTInstance.ownerOf(tokenId),owner1,"OwnerOf not working");
    });

    it("test safeTransferFrom()", async()=>{
        await DBNFTInstance.safeTransferFrom(owner1,owner2, 0);
        balOwner = await DBNFTInstance.balanceOf(owner1);
        balRecepient = await DBNFTInstance.balanceOf(owner2);
        assert.equal(balOwner.toNumber(),1, "The balance of token from owner is not reduced");
        assert.equal(balRecepient.toNumber(),1, "The balance of token in recepient is not increased");
    })

    it("test safeTransferFrom(data)", async()=>{
        const data = '0x42';
        await DBNFTInstance.safeTransferFrom(owner1,owner2, 1, data);
        balOwner = await DBNFTInstance.balanceOf(owner1);
        balRecepient = await DBNFTInstance.balanceOf(owner2);
        assert.equal(balOwner.toNumber(),0, "The balance of token from owner is not reduced");
        assert.equal(balRecepient.toNumber(),2, "The balance of token in recepient is not increased");
        
    })
    
    it("test transferFrom()", async()=>{
        await DBNFTInstance.transferFrom(owner2, owner1, 0, {from: accounts[1]});
        balOwner = await DBNFTInstance.balanceOf(owner1);
        balRecepient = await DBNFTInstance.balanceOf(owner2);
        assert.equal(balOwner.toNumber(),1, "The balance of token from owner is not reduced");
        assert.equal(balRecepient.toNumber(),1, "The balance of token in recepient is not increased");
    })

    it("test approve()", async()=>{
        await DBNFTInstance.approve(owner2, 0);
        let approved = await DBNFTInstance.getApproved(0);
        assert.equal(approved,owner2, "Approve not working");
    })

    it("test setApprovalForAll()", async()=>{
        await DBNFTInstance.setApprovalForAll(owner2,true);
        let isApproved = await DBNFTInstance.isApprovedForAll(owner1,owner2);
        assert.equal(isApproved,true, "setApprovalForAll not working");
    })

    it("test getApproved()", async()=>{
        await DBNFTInstance.approve(owner2, 0);
        let approved = await DBNFTInstance.getApproved(0);
        assert.equal(approved,owner2, "Approve not working");
    })

    it("test isApprovedForAll()", async()=>{
        await DBNFTInstance.setApprovalForAll(owner2,true);
        let isApproved = await DBNFTInstance.isApprovedForAll(owner1,owner2);
        assert.equal(isApproved,true, "setApprovalForAll not working");
    })

    it("test ERC165supportsInterface()", async()=>{
         let supportERC721 = await DBNFTInstance.supportsInterface('0x80ac58cd');
         assert.equal(supportERC721,true,"Support Interface not working");
    })

    it("test Transfer event", async()=>{
        let result = await DBNFTInstance.transferFrom(owner2, owner1, 1, {from: accounts[1]});
        truffleAssert.eventEmitted(result, 'Transfer');
    })

    it("test Approval event", async()=>{
        let result = await DBNFTInstance.approve(owner2, 0);
        truffleAssert.eventEmitted(result, 'Approval');
    })

    it("test ApprovalForAll event", async()=>{
        let result = await DBNFTInstance.setApprovalForAll(owner2,true);
        truffleAssert.eventEmitted(result, 'ApprovalForAll');
    })

    it("test listNFTforSale",async()=>{
        balOwner = await DBNFTInstance.balanceOf(owner1);
        assert.equal(balOwner.toNumber(),2, "The balance of owner1 is not correct");
        let result = await DBNFTInstance.listNFTForSale(0,100);
        balOwnerNew = await DBNFTInstance.balanceOf(owner1);
        assert.equal(balOwnerNew.toNumber(),1, "List NFTForSale not working");
    })

    it("test buyNFT",async()=>{
        let result = await DBNFTInstance.buyNFT(0, owner2, {from: accounts[1], value: 305});
        balOwnerNew = await DBNFTInstance.balanceOf(owner2);
        assert.equal(balOwnerNew.toNumber(),1, "List NFTForSale not working");
        truffleAssert.eventEmitted(result, 'Transfer');
    })

    it("test listNFTforLoan",async()=>{
        let result = await DBNFTInstance.listNFTForLoan(0,{from: accounts[1]});
        balOwnerNew = await DBNFTInstance.balanceOf(owner2);
        assert.equal(balOwnerNew.toNumber(),0, "List NFTForSale not working");
        truffleAssert.eventEmitted(result, 'Transfer');
    })

    it("test borrowNFT",async()=>{
        let result = await DBNFTInstance.borrowNFT(0,1000,{value: 305})
        balOwnerNew = await DBNFTInstance.balanceOf(owner1);
        assert.equal(balOwnerNew.toNumber(),2, "Borrow NFT not working");
        truffleAssert.eventEmitted(result, 'Transfer');
    })

    it("test returnNFT", async()=>{
        let result = await DBNFTInstance.returnNFT(0, owner1);
        balOwnerNew = await DBNFTInstance.balanceOf(owner1);
        assert.equal(balOwnerNew.toNumber(),1, "Return NFT not working");
        truffleAssert.eventEmitted(result, 'Transfer');
    })

    
});
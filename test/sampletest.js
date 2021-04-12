const BN = require("bn.js");
const DBNFT = artifacts.require("DBNFT");

const truffleAssert = require('truffle-assertions');

contract("DBNFT", (accounts) => {
    const tokenNameExpected = "DBNFT";
    const tokenSymbolExpected = "DB";
    const owner = accounts[0];
    const recepient = accounts[1];
    const date1 = '30.01.2021';
    const ownerName1 = 'owner1';
    const value1 = new BN('100');
    const date2 = '30.01.2021';
    const ownerName2 = 'owner2';
    const value2 = new BN('200');
    let logs = null;
    let CCNFTInstance

    before(async ()=>{
        CCNFTInstance = await CCNFT.deployed();
        const name = await CCNFTInstance.name();
        const symbol = await CCNFTInstance.symbol();
        assert.equal(name, tokenNameExpected, "Token Name not as Expected");
        assert.equal(symbol, tokenSymbolExpected, "Symbol not as Expected");
        await CCNFTInstance.CreateCoins(date1,ownerName1,value1);
        await CCNFTInstance.CreateCoins(date2,ownerName2,value2);
    });

    it("test balanceOf()", async () => {
        const bal = await CCNFTInstance.balanceOf(owner);
        assert.equal(bal.toNumber(),2, "The initial balance of token is not as expected");
    });

    it("test ownerOf()", async () => {
        const tokenId = new BN('0');
        assert(await CCNFTInstance.ownerOf(tokenId),owner,"OwnerOf not working");
    });

    it("test safeTransferFrom()", async()=>{
        await CCNFTInstance.safeTransferFrom(owner,recepient, 0);
        balOwner = await CCNFTInstance.balanceOf(owner);
        balRecepient = await CCNFTInstance.balanceOf(recepient);
        assert.equal(balOwner.toNumber(),1, "The balance of token from owner is not reduced");
        assert.equal(balRecepient.toNumber(),1, "The balance of token in recepient is not increased");
    })

    it("test safeTransferFrom(data)", async()=>{
        const data = '0x42';
        await CCNFTInstance.safeTransferFrom(owner,recepient, 1, data);
        balOwner = await CCNFTInstance.balanceOf(owner);
        balRecepient = await CCNFTInstance.balanceOf(recepient);
        assert.equal(balOwner.toNumber(),0, "The balance of token from owner is not reduced");
        assert.equal(balRecepient.toNumber(),2, "The balance of token in recepient is not increased");
        
    })
    
    it("test transferFrom()", async()=>{
        await CCNFTInstance.transferFrom(recepient, owner, 0, {from: accounts[1]});
        balOwner = await CCNFTInstance.balanceOf(owner);
        balRecepient = await CCNFTInstance.balanceOf(recepient);
        assert.equal(balOwner.toNumber(),1, "The balance of token from owner is not reduced");
        assert.equal(balRecepient.toNumber(),1, "The balance of token in recepient is not increased");
    })

    it("test approve()", async()=>{
        await CCNFTInstance.approve(recepient, 0);
        let approved = await CCNFTInstance.getApproved(0);
        assert.equal(approved,recepient, "Approve not working");
    })

    it("test setApprovalForAll()", async()=>{
        await CCNFTInstance.setApprovalForAll(recepient,true);
        let isApproved = await CCNFTInstance.isApprovedForAll(owner,recepient);
        assert.equal(isApproved,true, "setApprovalForAll not working");
    })

    it("test getApproved()", async()=>{
        await CCNFTInstance.approve(recepient, 0);
        let approved = await CCNFTInstance.getApproved(0);
        assert.equal(approved,recepient, "Approve not working");
    })

    it("test isApprovedForAll()", async()=>{
        await CCNFTInstance.setApprovalForAll(recepient,true);
        let isApproved = await CCNFTInstance.isApprovedForAll(owner,recepient);
        assert.equal(isApproved,true, "setApprovalForAll not working");
    })

    it("test ERC165supportsInterface()", async()=>{
         let supportERC721 = await CCNFTInstance.supportsInterface('0x80ac58cd');
         assert.equal(supportERC721,true,"Support Interface not working");
    })

    it("test Transfer event", async()=>{
        let result = await CCNFTInstance.transferFrom(recepient, owner, 1, {from: accounts[1]});
        truffleAssert.eventEmitted(result, 'Transfer');
    })

    it("test Approval event", async()=>{
        let result = await CCNFTInstance.approve(recepient, 0);
        truffleAssert.eventEmitted(result, 'Approval');
    })

    it("test ApprovalForAll event", async()=>{
        let result = await CCNFTInstance.setApprovalForAll(recepient,true);
        truffleAssert.eventEmitted(result, 'ApprovalForAll');

    })

    
});
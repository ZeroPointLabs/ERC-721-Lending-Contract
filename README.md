# DBNFT - An ERC-721 Lending Contract

DBNFT is an ERC-721 Contract for digital collectibles. The contract is designed to be integrated with either a web application or a mobile App. It allows the user to create and interact with ERC-721 tokens. This contract is aimed for artists who wish to convert their digital creations into NFTs and monetize them by either selling or lending the NFT. The NFT stores the ownership and lending data within the token itself.

## DeFi Components

The token is designed with following characteristics to benefit from the DeFi industry (staking or yield farming) and also to avoid misuse of the tokens when interacting with the contract.

## Loan options

- Only the owner of the token can list the token for loan.

* When the token is loaned, the token is transferred to the borrower with complete access to transfer the token to any other DeFi protocol. But the data stored in the token cannot be modified. The token also holds the borrower address, time of borrowing and the duration.

- The loan amount is calculated based on the compound interest formula calculated every second. The borrower has to pay this loan amount in addition to the refundable deposit of twice the value of token upfront, before having access to the token. When the borrower returns the token, the deposit is returned back to them.

- The owner of the token cannot claim access to the token during the loan period. They can however liquidate the token and get the security deposit from the borrower, if the borrower fails to return the token before the committed time.

- If the borrower fails to return the token by the committed time, they will forfeit their security deposit.

## Sell options

- When the token is sold, the ownership is completely transferred by modifying the ownership details in the token. The buyer is free to use the token as they wish.

## Smart Contract Functions

### Mint NFT

Creates a new NFT with:

- ID

* Description

* Address of Owner

* Adress of Borrower

* Status for Buy/Sell - FOR_SALE and NOT_FOR_SALE

* Status for Loan - FOR_LOAN, ON_LOAN, LIQUIDATED

### List NFT for Sale

The owner of token can list his NFT for Sale with an option to update the value of token. This option will transfer his token to Contract until someone buys from it.

### BuyNFT

Anyone can buy a NFT listed for sale by calling this function and transferring the token value.

### List NFT for Loan

The owner of token can list his NFT for loan. This option will transfer his token to the Contract until someone borrows from it.

### Borrow NFT

Once

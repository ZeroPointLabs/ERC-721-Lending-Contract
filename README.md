# ERC-721-Lending-Contract

ERC-721 Contract with the following options<br/>

## Mint NFT

Creates a new NFT with:

- Description

- Address of Owner

- Adress of Borrower

- Status for Buy/Sell - FOR_SALE and NOT_FOR_SALE

- Status for Loan - FOR_LOAN, ON_LOAN, LIQUIDATED

## List NFT for Sale

The owner of token can list his NFT for Sale with an option to update the value of token. This option will transfer his token to Contract until someone buys from it.

## BuyNFT

Anyone can buy a NFT listed for sale by calling this function and transferring the token value.

## List NFT for Loan

The owner of token can list his NFT for loan.

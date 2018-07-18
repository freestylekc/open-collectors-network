const Utils = require('../lib/utils.js')

var BigNumber = require('bignumber.js')
var Moment = require('moment')

var EctoToken = artifacts.require("./EctoToken.sol")
var Trustee     = artifacts.require("./Trustee.sol")
var TokenSale   = artifacts.require("./TokenSale.sol")

//
// Check the following basic members / properties
//
// symbol
// name
// decimals
// END_TIME
// CONTRIBUTION_MIN
// CONTRIBUTION_MAX
// PHASE1_ACCOUNT_TOKENS_MAX
// TOKENS_MAX
// TOKENS_SALE
// TOKENS_FOUNDERS
// TOKENS_ADVISORS
// TOKENS_COMPANY
// TOKENS_FUTURE
// TOKENS_PER_KETHER_WEEK1
// TOKENS_PER_KETHER_WEEK2
// TOKENS_PER_KETHER_WEEK3
// TOKENS_PER_KETHER_WEEK4
// finalized
// endTime
// pausedTime
// tokensPerKEther
// wallet
// tokenContract
// trusteeContract
// totalTokensSold
// whitelist
// sale contract token balance
// trustee contract token balance
// owner token balance
// admin address
// logistics address

// changeWallet function
//    - change wallet to address 0
//    - change wallet to address from admin
//    - change wallet to address from owner
//    - change wallet to address from logistics
//
// finalize
//    - check properties before finalize
//    - finalize the sale contract
//    - check properties after finalize
//    - try to finalize a 2nd time
//
// reclaimTokens
//    - reclaimTokens before finalize
//    - reclaimTokens after finalize
//    - reclaimTokens when 0 balance
//
// burnUnsoldTokens
//    - burnUnsoldTokens before finalize
//    - burnUnsoldTokens after finalize
//
// buy tokens
//
//    buy tokens as normal account
//    buy tokens with 0 amount
//    buy tokens as owner
//    buy tokens as whitelisted account
//    buy tokens with < CONTRIBUTION_MIN
//    buy all tokens left for sale
//    buy after all tokens were sold out
//    buy after token sale ended by time
//    buy after token sale ended by finalize


contract('TokenSale', function(accounts) {
    
   const DECIMALSFACTOR = new BigNumber('10').pow('18')

   const TOKEN_SYMBOL = "ECTO"
   const TOKEN_NAME = "Open Collectibles Network"
   const TOKEN_DECIMALS = 18

   const CONTRIBUTION_MIN = web3.toWei(0.1, "ether")
   const CONTRIBUTION_1ETH = web3.toWei(1, "ether")
   const CONTRIBUTION_MAX = web3.toWei("10000", "ether")
   const CONTRIBUTION_OVER = web3.toWei("10001", "ether")

   const TOKENS_MAX = new BigNumber('150000000').mul(DECIMALSFACTOR)
   const TOKENS_SALE = new BigNumber('105000000').mul(DECIMALSFACTOR)
   const TOKENS_FOUNDERS = new BigNumber('15000000').mul(DECIMALSFACTOR)
   const TOKENS_ADVISORS = new BigNumber('15000000').mul(DECIMALSFACTOR)
   const TOKENS_COMPANY = new BigNumber('15000000').mul(DECIMALSFACTOR)

   const TOKENS_PER_KETHER_WEEK1 = new BigNumber('8500000')
   const TOKENS_PER_KETHER_WEEK2 = new BigNumber('7750221')
   const TOKENS_PER_KETHER_WEEK3 = new BigNumber('7250129')
   const TOKENS_PER_KETHER_WEEK4 = new BigNumber('7000000')

   
   const owner = accounts[0]
   const admin = accounts[1]
   const logistics = accounts[2]

   describe('Basic properties', async () => {
        var token = null
        var trustee = null
        var sale = null

        before(async () => {
            var contracts = await Utils.deployContracts(artifacts, accounts)

            token = contracts.token
            trustee = contracts.trustee
            sale = contracts.sale

            await sale.setAdminAddress(admin)
            await sale.setLogisticsAddress(logistics)

            await token.setLogisticsAddress(logistics)
            await trustee.setLogisticsAddress(logistics)
         
            const TOKENS_MAX = await sale.TOKENS_MAX.call()
            const TOKENS_SALE = await sale.TOKENS_SALE.call()
            const TOKENS_COMPANY = await sale.TOKENS_COMPANY.call()
        
            const trusteeTokens = TOKENS_MAX.sub(TOKENS_SALE).sub(TOKENS_COMPANY)
        
            await token.transfer(sale.address, TOKENS_SALE, { from: owner })
            await token.transfer(trustee.address, trusteeTokens, { from: owner })
        
            await sale.initialize({ from: owner })
        
            //await sale.changeTime(1516522180, { from: owner })
         
        })

        it("symbol", async () => {
            assert.equal(await sale.TOKEN_SYMBOL.call(), TOKEN_SYMBOL)
         })
   
         it("name", async () => {
            assert.equal(await sale.TOKEN_NAME.call(), TOKEN_NAME)
         })
   
         it("decimals", async () => {
            assert.equal(await sale.TOKEN_DECIMALS.call(), TOKEN_DECIMALS)
         })
   
         it("CONTRIBUTION_MIN", async () => {
            assert.equal(await sale.CONTRIBUTION_MIN.call(), CONTRIBUTION_MIN)
         })
   
         it("CONTRIBUTION_MAX", async () => {
            assert.equal((await sale.CONTRIBUTION_MAX.call()).toNumber(), CONTRIBUTION_MAX)
         })
   
         it("TOKENS_MAX", async () => {
            assert.equal((await sale.TOKENS_MAX.call()).toNumber(), TOKENS_MAX.toNumber())
         })
   
         it("TOKENS_SALE", async () => {
            assert.equal((await sale.TOKENS_SALE.call()).toNumber(), TOKENS_SALE.toNumber())
         })
   
         it("TOKENS_FOUNDERS", async () => {
            assert.equal((await sale.TOKENS_FOUNDERS.call()).toNumber(), TOKENS_FOUNDERS.toNumber())
         })
   
         it("TOKENS_ADVISORS", async () => {
            assert.equal((await sale.TOKENS_ADVISORS.call()).toNumber(), TOKENS_ADVISORS.toNumber())
         })
   
         it("TOKENS_COMPANY", async () => {
            assert.equal((await sale.TOKENS_COMPANY.call()).toNumber(), TOKENS_COMPANY.toNumber())
         })
   
         it("TOKENS_PER_KETHER_WEEK1", async () => {
            assert.equal((await sale.TOKENS_PER_KETHER_WEEK1.call()).toNumber(), TOKENS_PER_KETHER_WEEK1.toNumber())
         })
         it("TOKENS_PER_KETHER_WEEK2", async () => {
            assert.equal((await sale.TOKENS_PER_KETHER_WEEK2.call()).toNumber(), TOKENS_PER_KETHER_WEEK2.toNumber())
         })
         it("TOKENS_PER_KETHER_WEEK3", async () => {
            assert.equal((await sale.TOKENS_PER_KETHER_WEEK3.call()).toNumber(), TOKENS_PER_KETHER_WEEK3.toNumber())
         })
         it("TOKENS_PER_KETHER_WEEK4", async () => {
            assert.equal((await sale.TOKENS_PER_KETHER_WEEK4.call()).toNumber(), TOKENS_PER_KETHER_WEEK4.toNumber())
         })
   
         it("finalized", async () => {
            assert.equal(await sale.finalized.call(), false)
         })
   
         it("pausedTime", async () => {
            assert.equal(await sale.pausedTime.call(), 0)
         })
   
         it("tokensPerKEther", async () => {
            assert.equal((await sale.tokensPerKEther.call()).toNumber(), TOKENS_PER_KETHER_WEEK1.toNumber())
         })
   
         it("wallet", async () => {
            assert.equal(await sale.wallet.call(), accounts[0])
         })
   
         it("tokenContract", async () => {
            assert.equal(await sale.tokenContract.call(), token.address)
         })
   
         it("trusteeContract", async () => {
            assert.equal(await sale.trusteeContract.call(), trustee.address)
         })
   
         it("totalTokensSold", async () => {
            assert.equal(await sale.totalTokensSold.call(), 0)
         })
   
         it("whitelist", async () => {
            assert.equal(await sale.whitelist.call(accounts[0]), false)
         })
   
         it("sale contract token balance", async () => {
            assert.equal((await token.balanceOf.call(sale.address)).toNumber(), TOKENS_SALE.toNumber())
         })
   
         it("trustee contract token balance", async () => {
            const expectedBalance = TOKENS_MAX.sub(TOKENS_SALE).sub(TOKENS_COMPANY)
            assert.equal((await token.balanceOf.call(trustee.address)).toNumber(), expectedBalance.toNumber())
         })
   
         it("owner token balance", async () => {
            const owner = await sale.owner.call()
            assert.equal(owner, accounts[0])
            assert.equal((await token.balanceOf.call(owner)).toNumber(), TOKENS_COMPANY.toNumber())
         })
   
         it("adminAddress", async () => {
            const adminAddress = await sale.adminAddress.call()
            assert.equal(adminAddress, admin)
         })
   
         it("logisticsAddress", async () => {
            const logisticsAddress = await sale.logisticsAddress.call()
            assert.equal(logisticsAddress, logistics)
         })
   })

   describe('whitelist', async () => {
        var token = null
        var trustee = null
        var sale = null

        before(async () => {
            var contracts = await Utils.deployContracts(artifacts, accounts)

            token = contracts.token
            trustee = contracts.trustee
            sale = contracts.sale

            await sale.setAdminAddress(admin)
            await sale.setLogisticsAddress(logistics)

            await token.setLogisticsAddress(logistics)
            await trustee.setLogisticsAddress(logistics)
         
            const TOKENS_MAX = await sale.TOKENS_MAX.call()
            const TOKENS_SALE = await sale.TOKENS_SALE.call()
            const TOKENS_COMPANY = await sale.TOKENS_COMPANY.call()
        
            const trusteeTokens = TOKENS_MAX.sub(TOKENS_SALE).sub(TOKENS_COMPANY)
        
            await token.transfer(sale.address, TOKENS_SALE, { from: owner })
            await token.transfer(trustee.address, trusteeTokens, { from: owner })
        
            await sale.initialize({ from: owner })
        
            //await sale.changeTime(1514327560, { from: owner })
        })
   })

   describe('changeWallet function', async () => {
        var token = null
        var trustee = null
        var sale = null

        before(async ()=> {
            var contracts = await Utils.deployContracts(artifacts, accounts)

            token = contracts.token
            trustee = contracts.trustee
            sale = contracts.sale

            await sale.setAdminAddress(admin)
            await sale.setLogisticsAddress(logistics)

            await token.setLogisticsAddress(logistics)
            await trustee.setLogisticsAddress(logistics)
         
            const TOKENS_MAX = await sale.TOKENS_MAX.call()
            const TOKENS_SALE = await sale.TOKENS_SALE.call()
            const TOKENS_COMPANY = await sale.TOKENS_COMPANY.call()
        
            const trusteeTokens = TOKENS_MAX.sub(TOKENS_SALE).sub(TOKENS_COMPANY)
        
            await token.transfer(sale.address, TOKENS_SALE, { from: owner })
            await token.transfer(trustee.address, trusteeTokens, { from: owner })
        
            await sale.initialize({ from: owner })
        
            //await sale.changeTime(1516722180, { from: owner })
        })

        it('change wallet to address 0', async () => {
            Utils.expectRevert(sale.changeWallet.call(0, { from: admin }));
        })

        it('change wallet to address from admin', async () => {
            assert.equal(await sale.changeWallet.call(accounts[3], { from: admin }), true);
        })

        it('change wallet to address from owner', async () => {
            Utils.expectRevert(sale.changeWallet.call(accounts[3], { from: owner }));
        })

        it('change wallet to address from logistics', async () => {
            Utils.expectRevert(sale.changeWallet.call(accounts[3], { from: logistics }));
        })
   })

    describe('finalize', async () => {
        var token = null
        var trustee = null
        var sale = null
  
        before(async () => {
           var contracts = await Utils.deployContracts(artifacts, accounts)
  
           token = contracts.token
           trustee = contracts.trustee
           sale = contracts.sale
  
           await sale.setAdminAddress(admin)
           await sale.setLogisticsAddress(logistics)

           await token.setLogisticsAddress(logistics)
           await trustee.setLogisticsAddress(logistics)
        
           const TOKENS_MAX = await sale.TOKENS_MAX.call()
           const TOKENS_SALE = await sale.TOKENS_SALE.call()
           const TOKENS_COMPANY = await sale.TOKENS_COMPANY.call()
       
           const trusteeTokens = TOKENS_MAX.sub(TOKENS_SALE).sub(TOKENS_COMPANY)
       
           await token.transfer(sale.address, TOKENS_SALE, { from: owner })
           await token.transfer(trustee.address, trusteeTokens, { from: owner })
       
           await sale.initialize({ from: owner })
       
           //await sale.changeTime(1528527780, { from: owner })
        })
        
        it("check properties before finalize", async () => {
            assert.equal(await sale.finalized.call(), false)
            assert.equal(await token.finalized.call(), false)
         })
         
         it("finalize the sale contract", async () => {
            assert.equal(await sale.finalize.call({ from: admin }), true)
            Utils.checkFinalizedEventGroup(await sale.finalize({ from: admin }))
         })

         it("check properties after finalize", async () => {
            assert.equal(await sale.finalized.call(), true)
            assert.equal(await token.finalized.call(), false)
         })
   
         it("try to finalize a 2nd time", async () => {
            await Utils.expectRevert(sale.finalize.call({ from: admin }))
         })

         it("try to finalize from logistics", async () => {
            await Utils.expectRevert(sale.finalize.call({ from: logistics }))
         })

         it("try to finalize from owner", async () => {
            await Utils.expectRevert(sale.finalize.call({ from: owner }))
         })
    })

    describe('burnUnsoldTokens', async () => {
        var token = null
        var trustee = null
        var sale = null
  
        before(async () => {
           var contracts = await Utils.deployContracts(artifacts, accounts)
  
           token = contracts.token
           trustee = contracts.trustee
           sale = contracts.sale
  
           await sale.setAdminAddress(admin)
           await sale.setLogisticsAddress(logistics)

           await token.setLogisticsAddress(logistics)
           await trustee.setLogisticsAddress(logistics)
           await token.setAdminAddress(admin)
        
           const TOKENS_MAX = await sale.TOKENS_MAX.call()
           const TOKENS_SALE = await sale.TOKENS_SALE.call()
           const TOKENS_COMPANY = await sale.TOKENS_COMPANY.call()
       
           const trusteeTokens = TOKENS_MAX.sub(TOKENS_SALE).sub(TOKENS_COMPANY)
       
           await token.transfer(sale.address, TOKENS_SALE, { from: owner })
           await token.transfer(trustee.address, trusteeTokens, { from: owner })
       
           await sale.initialize({ from: owner })
       
           //await sale.changeTime(1528527780, { from: owner })
        })
        
        it("burnUnsoldTokens before finalize", async () => {
            const balanceSaleBefore = await token.balanceOf(sale.address) //420MM

            await Utils.expectRevert(sale.burnUnsoldTokens({ from: admin }))

            const balanceSaleAfter = await token.balanceOf(sale.address) //420MM

            assert.equal(balanceSaleAfter.sub(balanceSaleBefore).toNumber(), 0)
         })

         it("burnUnsoldTokens after finalize", async () => {
            await sale.finalize({ from: admin })

            const balanceSaleBefore = await token.balanceOf(sale.address) //420MM
            console.log('balanceSaleBefore after finalize: ', balanceSaleBefore.toNumber())

            assert.equal(await sale.burnUnsoldTokens.call({ from: admin }), true)
            Utils.checkUnsoldTokensBurntEventGroup(await sale.burnUnsoldTokens({ from: admin }), balanceSaleBefore)

            const balanceSaleAfter = await token.balanceOf(sale.address)
            console.log('balanceSaleAfter after finalize: ', balanceSaleAfter.toNumber())

            assert.equal(balanceSaleAfter.sub(balanceSaleBefore).toNumber(), balanceSaleBefore.mul(-1))
         })
    })

    describe('buy tokens', async () => {
        var token = null
        var trustee = null
        var sale = null
        var contract = null
        var wallet = null
  
        before(async () => {
           var contracts = await Utils.deployContracts(artifacts, accounts)
  
           token = contracts.token
           trustee = contracts.trustee
           sale = contracts.sale
  
           await sale.setAdminAddress(admin)
           await sale.setLogisticsAddress(logistics)

           await token.setLogisticsAddress(logistics)
           await trustee.setLogisticsAddress(logistics)
           await token.setAdminAddress(admin)
        
           const TOKENS_MAX = await sale.TOKENS_MAX.call()
           const TOKENS_SALE = await sale.TOKENS_SALE.call()
           const TOKENS_COMPANY = await sale.TOKENS_COMPANY.call()
       
           const trusteeTokens = TOKENS_MAX.sub(TOKENS_SALE).sub(TOKENS_COMPANY)
       
           await token.transfer(sale.address, TOKENS_SALE, { from: owner })
           await token.transfer(trustee.address, trusteeTokens, { from: owner })
       
           await sale.initialize({ from: owner })
       
           //await sale.changeTime(1516122180, { from: owner })
        })

        context('sale ended by finalize', async () => {
            before(async () => {
                wallet = await sale.wallet.call()

                //await Utils.changeTime(sale, WEEEK1_START_TIME - 1)
                await sale.setTokensPerKEther(1, { from: admin })
                //await Utils.changeTime(sale, WEEEK1_START_TIME + 1)
                await sale.finalize({ from: admin })
            })

            it("buy tokens", async () => {
                await Utils.expectRevert(sale.buyTokens.call({ from: accounts[1], value: CONTRIBUTION_MIN }))
            })
        })

    })
})
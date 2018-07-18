 //FLOW------------------------------------------
 //initial setup
 //send to founder 1 
 //send to founder 2
 //sent to trustee account tokens for advisors
 //grant locked ( cannot be reclaimed ) allocation from trustee account to advisor 1 
 //grant locked ( cannot be reclaimed ) allocation from trustee account to advisor 2
 //process allocation for advisor 1 with a call from owner
 //process allocation for advisor 1 with a call from owner
 //send to lock box account tokens for TOKEN_COMPANY

 // at this point no one should be able to transfer tokens ( because it's not finalized )
 // start sale
 // whitelist acc 1
 // whitelist acc 2
 // buy from acc 1 & transfer tokens to acc 1 => check acc 1 balance
 // buy from acc 2 & transfer tokens to acc 2 => check acc 2 balance
 // call sale finalized 
 // burn unsold tokens after sale 
 // check total supply after burn
 // call token finalized => at this point tokens should be transferable
 // transfer token from acc 1 to acc 2
 // check balances for acc 1 & acc 2
 // lambo 
 //FLOW------------------------------------------

 const Utils = require('../lib/utils.js')

 var BigNumber = require('bignumber.js')
 var Moment = require('moment')

 var EctoToken = artifacts.require("./EctoToken.sol")
 var Trustee = artifacts.require("./Trustee.sol")
 var TokenSale = artifacts.require("./TokenSale.sol")
 var TokenSaleMock = artifacts.require("./TokenSaleMock.sol")
 var TokenLocks = artifacts.require("./TokenSaleLocks.sol")
 var fs = require('fs');

 contract('End-to-End lifetime test', function(accounts) {
    const DECIMALSFACTOR = new BigNumber('10').pow('18')

    const TOKEN_SYMBOL   = "Ecto"
    const TOKEN_NAME     = "Open Collectibles Network"
    const TOKEN_DECIMALS = 18

    const END_TIME = 1516572000; 
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

    const WEEEK1_START_TIME = 1516022180;
    const WEEEK3_START_TIME = 1516626980;

    const ownerAddress = accounts[0]
    const admin = accounts[1]
    const logistics = accounts[2]
    const wallet = accounts[3]
    const company = accounts[10]

    const founder1 = accounts[4]
    const founder2 = accounts[5]
   
    const whitelisted1 = accounts[6]
    const whitelisted2 = accounts[7]

    const advisor1 = accounts[8]
    const advisor2 = accounts[9]



    var token = null
    var trustee = null
    var sale = null
    var lockBox = null

    //START debug prop
    var receipts = []

    function logReceipt(receipt, description) {
         receipts.push({
              receipt     : receipt,
             description : description
         })
    }
    async function logTransaction(hash, description) {
         const receipt = await web3.eth.getTransactionReceipt(hash)
         await logReceipt(receipt, description)
    }
    //END debug prop

    describe('initial setup', async () => {
        it("Deploy Ecto Contract", async () => {

         console.log("Total number of accounts on network", accounts.length);

         token = await EctoToken.new({ from: ownerAddress, gas: 3500000 })
         await logTransaction(token.transactionHash, "Ecto.new")
         var o = await token.owner.call();
         const tokenMax = (await token.balanceOf(ownerAddress)).toNumber();
         console.log('************Deployed Ecto contract - total tokens available: ', tokenMax)
         // At this point TOKENS_MAX should be assigned to the deployKey
         assert.equal(tokenMax, TOKENS_MAX.toNumber())

         fs.writeFileSync("end-to-end-results.txt", "Ecto token contract=" + token.address + "\r\n");
         fs.appendFileSync("end-to-end-results.txt", "Ecto max tokens=" + tokenMax.toLocaleString() + "\r\n");
      })

      it('Deploy Trustee Contract', async () => {
         trustee = await Trustee.new(token.address, { from: ownerAddress, gas: 3500000 })
         await logTransaction(trustee.transactionHash, "Trustee.new")
         assert.equal(await trustee.tokenContract.call(), token.address)

         console.log('************Deployed Trustee contract - balance: ', (await token.balanceOf(trustee.address)).toNumber() )
         fs.appendFileSync("end-to-end-results.txt", "Trusteee contract=" + trustee.address + "\r\n");
      })

      it('Deploy TokenSale Contract', async () => {
          const newTime = new BigNumber(WEEEK1_START_TIME).sub(1)
          sale = await TokenSale.new(token.address, trustee.address, wallet, { from: ownerAddress, gas: 4500000})
          await logTransaction(sale.transactionHash, "TokenSale.new")

          console.log('************Deployed TokenSale contract - balance: ', (await token.balanceOf(sale.address)).toNumber() )
          fs.appendFileSync("end-to-end-results.txt", "Token sale contract=" + sale.address + "\r\n");
      })

      it('Deploy LockBox Contract', async () => {
          lockBox = await TokenLocks.new(token.address, sale.address, { from: ownerAddress })
          await logTransaction(lockBox.transactionHash, "TokenLocks.new")

          console.log('************Deployed LockBox contract - balance: ', (await token.balanceOf(lockBox.address)).toNumber() )
          fs.appendFileSync("end-to-end-results.txt", "Lockbox contract=" + lockBox.address + "\r\n");
      })

      it('Set admin keys', async () => {
          const o = await token.setAdminAddress(admin, { from: ownerAddress })
          console.log('************Set admin key - token admin address: ', await token.adminAddress.call()  )
          await trustee.setAdminAddress(admin, { from: ownerAddress })
          console.log('************Set admin key - trustee admin address: ', await trustee.adminAddress.call() )
          await sale.setAdminAddress(admin, { from: ownerAddress })
          console.log('************Set admin key - sale admin address: ', await sale.adminAddress.call() )
        
          logReceipt(o.receipt, "Roles.setAdminAddress")
      })

      it('Set logistics key', async () => {
         const o = await token.setLogisticsAddress(sale.address, { from: ownerAddress })
         console.log('************Set logistics key - token logistics address: ', await token.logisticsAddress.call()  )
         await trustee.setLogisticsAddress(logistics, { from: ownerAddress })
         console.log('************Set logistics key - trustee logistics address: ', await trustee.logisticsAddress.call() )
         await sale.setLogisticsAddress(logistics, { from: ownerAddress })
         console.log('************Set logistics key - sale logistics address: ', await sale.logisticsAddress.call() )
       
         logReceipt(o.receipt, "Roles.setLogisticsAddress")
      })

      it('Transfer tokens to sale contract', async () => {
         const o = await token.transfer(sale.address, TOKENS_SALE, { from: ownerAddress })
         logReceipt(o.receipt, "Token.transfer")

         console.log('************Token transferred to sale - sale balance: ', (await token.balanceOf(sale.address)).toNumber() )

         fs.appendFileSync("end-to-end-results.txt", "Sale contract tokens=" + (await token.balanceOf(sale.address)).toNumber().toLocaleString() + "\r\n");
      })

      it('Transfer tokens to trustee contract', async () => {
         var tokensToTransfer = TOKENS_MAX.sub(TOKENS_SALE).sub(TOKENS_FOUNDERS).sub(TOKENS_COMPANY);
        
         assert.equal(await token.transfer.call(trustee.address, tokensToTransfer, { from: ownerAddress }), true)
         await token.transfer(trustee.address, tokensToTransfer, { from: ownerAddress })

         console.log('************Token transferred to trustee - trustee balance: ', (await token.balanceOf(trustee.address)).toNumber() )
         fs.appendFileSync("end-to-end-results.txt", "Trustee contract tokens=" + (await token.balanceOf(trustee.address)).toNumber().toLocaleString() + "\r\n");

      })

      it('Transfer tokens to founders', async () => {
         var founder1TokensToTransfer = TOKENS_FOUNDERS/2;
         var founder2TokensToTransfer = TOKENS_FOUNDERS/2;

         assert.equal(await token.transfer.call(founder1, founder1TokensToTransfer, { from: ownerAddress }), true)
         await token.transfer(founder1, founder1TokensToTransfer, { from: ownerAddress })
         console.log('************Token transferred to founder 1 - founder 1 balance: ', (await token.balanceOf(founder1)).toNumber() )
         fs.appendFileSync("end-to-end-results.txt", "Founder 1 tokens=" + (await token.balanceOf(founder1)).toNumber().toLocaleString() + "\r\n");


         assert.equal(await token.transfer.call(founder2, founder2TokensToTransfer, { from: ownerAddress }), true)
         await token.transfer(founder2, founder2TokensToTransfer, { from: ownerAddress })
         console.log('************Token transferred to founder 2 - founder 2 balance: ', (await token.balanceOf(founder2)).toNumber() )
         fs.appendFileSync("end-to-end-results.txt", "Founder 2 tokens=" + (await token.balanceOf(founder2)).toNumber().toLocaleString() + "\r\n");
      })

      it('Transfer tokens to company', async () => {
          console.log('companyyyyyyyyyyyyyy:', company)
         await token.transfer(company, TOKENS_COMPANY, { from: ownerAddress })
         console.log('************Token transferred to company - company wallet balance: ', (await token.balanceOf(company)).toNumber() )
         fs.appendFileSync("end-to-end-results.txt", "Company tokens=" + (await token.balanceOf(company)).toNumber().toLocaleString() + "\r\n");
      })

      it('Grant allocation for advisors from trustee account', async () => {
         var advisor1Allocation = TOKENS_ADVISORS/2;
         var advisor2Allocation = TOKENS_ADVISORS/2;

         await trustee.grantAllocation(advisor1, advisor1Allocation, true, { from: admin })
         console.log('************Allocation granted for advisor 1 - advisor 1 granted: ', (await trustee.getGrantedAmount.call(advisor1, { from: ownerAddress })).toNumber()) 
         console.log('************Allocation tranferred for advisor 1 - advisor 1 transferred: ', (await trustee.getTransferredAmount.call(advisor1, { from: ownerAddress })).toNumber()) 

         await trustee.grantAllocation(advisor2, advisor2Allocation, true, { from: admin })
         console.log('************Allocation granted for advisor 2 - advisor 2 granted: ', (await trustee.getGrantedAmount.call(advisor2, { from: ownerAddress })).toNumber()) 
         console.log('************Allocation tranferred for advisor 2 - advisor 2 transferred: ', (await trustee.getTransferredAmount.call(advisor2, { from: ownerAddress })).toNumber()) 
      })

      it('Initialize token sale', async () => {
         const o = await sale.initialize({ from: ownerAddress })
         logReceipt(o.receipt, "TokenSale.initialize")

         console.log('************Token sale initialized************')

         fs.appendFileSync("end-to-end-results.txt", "Tokend sale initialized!" + "\r\n");
      })
	})
	
	describe('Buying tokens during sale', async () => {
        it('Whitelisted1 buys tokens', async () => {
             console.log('************Total token sold before everything: ', (await sale.getTotalTokenSold.call({ from: ownerAddress })).toNumber()) 
             //await sale.changeTime(WEEEK1_START_TIME+1, { from: ownerAddress })

             console.log('******* buying tokens');
             await web3.eth.sendTransaction({ from: whitelisted1, to: sale.address, value: web3.toWei(1, 'ether') })


             console.log('************Whitelisted1 bought tokens - whitelisted1 balance: ', (await token.balanceOf(whitelisted1)).toNumber() )
             console.log('************Total token sold after whitelist1: ', (await sale.getTotalTokenSold.call({ from: ownerAddress })).toNumber()) 
        })

        it('Whitelisted2 buys tokens', async () => {
         console.log('************Total token sold before whitelisted2: ', (await sale.getTotalTokenSold.call({ from: ownerAddress })).toNumber()) 
         //await sale.changeTime(WEEEK3_START_TIME+1, { from: ownerAddress })
         await sale.setTokensPerKEther(3, { from: admin })

         await web3.eth.sendTransaction({ from: whitelisted2, to: sale.address, value: web3.toWei(1, 'ether') })
        

         console.log('************Whitelisted2 bought tokens - whitelisted2 balance: ', (await token.balanceOf(whitelisted2)).toNumber() )
         console.log('************Total token sold after whitelist2: ', (await sale.getTotalTokenSold.call({ from: ownerAddress })).toNumber()) 
        })
    })

    describe('Sale finalize', async () => {
         it('Try to end sale', async () => {
             console.log('************Sale finalized status: ', (await sale.finalized.call()))
             //await sale.changeTime(END_TIME, { from: ownerAddress })
             const o = await sale.finalize({ from: admin })
             logReceipt(o.receipt, "Sale.finalize")
             console.log('************Sale finalized status: ', (await sale.finalized.call()))
         })

         it('Try to end token', async () => {
             console.log('************Token finalized status: ', (await token.finalized.call()))
             const o = await token.finalize({ from: admin })
             logReceipt(o.receipt, "Token.finalize")
             console.log('************Token finalized status: ', (await token.finalized.call()))
         })
    })


    describe('Burn unsold tokens', async () => {
         it("Burn and check balances after", async () => {
             const balanceSaleBefore = await token.balanceOf(sale.address) //420MM
             console.log('************Sale balance after finalize: ', balanceSaleBefore.toNumber())

             await sale.burnUnsoldTokens({ from: admin })

             const balanceSaleAfter = await token.balanceOf(sale.address)
             console.log('************Sale balance after burn: ', balanceSaleAfter.toNumber())

         })
    })

    describe('Process advisors allocations', async () => {
        it('Send for advisor1', async () =>{
             var advisor1Allocation = TOKENS_ADVISORS/2;

             console.log('************Allocation tranferred for advisor 1 before processing - advisor 1 transferred: ', (await trustee.getTransferredAmount.call(advisor1, { from: ownerAddress })).toNumber()) 
             await trustee.processAllocation(advisor1,advisor1Allocation, { from: logistics });
             console.log('************Allocation tranferred for advisor 1  after processing - advisor 1 transferred: ', (await trustee.getTransferredAmount.call(advisor1, { from: ownerAddress })).toNumber()) 
         })

         it('Send for advisor2', async () =>{
             var advisor2Allocation = TOKENS_ADVISORS/2;

             console.log('************Allocation tranferred for advisor 2 before processing - advisor 2 transferred: ', (await trustee.getTransferredAmount.call(advisor2, { from: ownerAddress })).toNumber()) 
             await trustee.processAllocation(advisor2,advisor2Allocation, { from: logistics });
             console.log('************Allocation tranferred for advisor 2  after processing - advisor 2 transferred: ', (await trustee.getTransferredAmount.call(advisor2, { from: ownerAddress })).toNumber()) 
         })
    })

    describe('Token exchange', async () => {
         it('Whitelisted1 transfers to whitelisted2 ', async () => {
             console.log('************Whitelisted1 balance before transfer: ', (await token.balanceOf.call(whitelisted1)).toNumber() )
             console.log('************Whitelisted2 balance before transfer: ', (await token.balanceOf.call(whitelisted2)).toNumber() )
             await token.transfer(whitelisted2, new BigNumber('625').mul(DECIMALSFACTOR), { from: whitelisted1 })
             console.log('************Whitelisted1 balance after transfer: ', (await token.balanceOf.call(whitelisted1)).toNumber() )
             console.log('************Whitelisted2 balance after transfer: ', (await token.balanceOf.call(whitelisted2)).toNumber() )
         })
    })



    describe('Statistics', async () => {
         it('Balances of all parties', async () => {
             //Founders
             const founder1Balance = await token.balanceOf(founder1);
             const founder2Balance = await token.balanceOf(founder2);
             console.log('******Founders: ')
             console.log('************Founder 1 balance: ', founder1Balance.toNumber())
             console.log('************Founder 2 balance: ', founder2Balance.toNumber())

             //Advisors
             const advisor1Balance = await token.balanceOf(advisor1);
             const advisor2Balance = await token.balanceOf(advisor2);
             console.log('******Advisors: ')
             console.log('************Advisor 1 balance: ', advisor1Balance.toNumber())
             console.log('************Advisor 2 balance: ', advisor2Balance.toNumber())
            
             //Whitelists
             const whitelisted1Balance = await token.balanceOf(whitelisted1);
             const whitelisted2Balance = await token.balanceOf(whitelisted2);
             console.log('******Whitelist: ')
             console.log('************Whitelist 1 balance: ', whitelisted1Balance.toNumber())
             console.log('************Whitelist 2 balance: ', whitelisted2Balance.toNumber())

             //Open Collectibles Network Token
             const companyBalance = await token.balanceOf(company);
             var total = companyBalance.add(whitelisted1Balance).add(whitelisted2Balance).add(advisor1Balance).add(advisor2Balance).add(founder1Balance).add(founder2Balance);
             console.log('******Open Collectibles Network Token: ')
             console.log('************Open Collectibles Network Token total supply: ', (await token.getTotalSupply.call()).toNumber() )
             console.log('************Total calculated supply: ', total.toNumber())
            
         })
         it("Gas Used log", async () => {
             var totalGasUsed = 0

             for (i = 0; i < receipts.length; i++) {
                 const entry = receipts[i]

                 totalGasUsed += entry.receipt.gasUsed

                 console.log("      " + entry.description.padEnd(32) + entry.receipt.gasUsed)
             }

             console.log("      ------------------------------------------")
             console.log("      " + "Total gas logged: ".padEnd(32) + totalGasUsed)
         })
     })
 })
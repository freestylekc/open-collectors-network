const Utils = require('../lib/utils.js')

const Moment = require('moment')
const BigNumber = require('bignumber.js')

const EctoToken = artifacts.require("./EctoToken.sol")


//
// Basic properties
//    name
//    symbol
//    decimals
//    totalSupply
//    balances is private
//    owner is as expected
//
// transfer before finalize
//    transfer from owner to other
//    transfer 0 tokens
//    transfer > balance
//    transfer = balance
//    transfer 1 token
//    transfer 10000 tokens
//
// transfer after finalize
//    transfer 0 tokens
//    transfer > balance
//    transfer = balance
//    transfer 1 token
//    transfer 10000 tokens
//
// transferFrom
//    transfer    0  from account 0 -> 1 with 0 allowance
//    transfer 1000  from account 0 -> 1 without allowance
//    transfer 1000  from account 0 -> 1 with 10 allowance
//    transfer 1000  from account 0 -> 1 with 1000 allowance
//    transfer 50+50 from account 0 -> 1 with 100 allowance
//    transfer 1000  from account 0 -> 1 with 999 allowance
//    transfer    1  from account 0 -> 1 with 0 allowance
//
// transferFrom after finalize
//    transfer    0  from account 0 -> 1 with 0 allowance
//    transfer 1000  from account 0 -> 1 without allowance
//    transfer 1000  from account 0 -> 1 with 10 allowance
//    transfer 1000  from account 0 -> 1 with 1000 allowance
//    transfer 50+50 from account 0 -> 1 with 100 allowance
//    transfer 1000  from account 0 -> 1 with 999 allowance
//    transfer    1  from account 0 -> 1 with 0 allowance
//
// approve
// balanceOf
// allowance
//    * covered indirectly by testing the other functions
//
// burn
//    burn greater than balance
//    burn less than or equal to balance
//
// balances
//    check if balances is exposed publicly
//
// owner and logistics
//    - owner is set
//    - admin is 0
//    - logistics is 0
//    - set admin key
//    - set logistics key
//    - finalize (owner + logistics)
//
// finalize
//    - check properties before and after finalize
//    - try to finalize a 2nd time
//    * other cases covered indirectly by testing other functions
//

contract('EctoToken', (accounts)=>{
    const DECIMALSFACTOR = new BigNumber('10').pow('18')

    const SYMBOL         = "ECTO"
    const NAME           = "Open Collectibles Network"
    const DECIMALS       = 18
    const TOTAL_SUPPLY   = new BigNumber('150000000').mul(DECIMALSFACTOR)

    const owner  = accounts[0]
    const admin  = accounts[1]
    const logistics    = accounts[2]

    async function createToken() {
        return await EctoToken.new()
     }
  
    
     
   describe('Basic properties', async () => {

        var token = null

        before(async () => {
            token = await createToken()
        })


        it("name", async () => {
            assert.equal(await token.name.call(), NAME)
        })

        it("symbol", async () => {
            assert.equal(await token.symbol.call(), SYMBOL)
        })

        it("decimals", async () => {
            assert.equal(await token.decimals.call(), DECIMALS)
        })

        it("totalSupply", async () => {
            assert.equal((await token.totalSupply.call()).toNumber(), TOTAL_SUPPLY.toNumber())
        })

        it("balances is private", async () => {
            assert.isTrue(typeof(token.balances) == 'undefined')
        })
    })

    
   describe('transfer function before finalize', async () => {

        var token = null

        before(async () => {
            token = await createToken()
            await token.setLogisticsAddress(logistics)
            await token.setAdminAddress(admin)
        })

        it("transfer tokens from owner to other", async () => {
            const balance0Before = await token.balanceOf(accounts[0])
            const balance1Before = await token.balanceOf(accounts[1])

            Utils.checkTransferEventGroup(await token.transfer(accounts[1], 1000), accounts[0], accounts[1], 1000)

            const balance0After = await token.balanceOf(accounts[0])
            const balance1After = await token.balanceOf(accounts[1])

            assert.equal(balance0After.sub(balance0Before).toNumber(), -1000)
            assert.equal(balance1After.sub(balance1Before).toNumber(), 1000)
        })

        it("transfer 0 tokens", async () => {
            await Utils.expectRevert(token.transfer.call(accounts[2], 0, { from: accounts[1] }))
        })

        it("transfer > balance", async () => {
            const balance = await token.balanceOf.call(accounts[1])
            await Utils.expectRevert(token.transfer.call(accounts[2], balance.add(1), { from: accounts[1] }))
        })

        it("transfer = balance", async () => {
            const balance = await token.balanceOf.call(accounts[1])

            await Utils.expectRevert(token.transfer.call(accounts[2], balance, { from: accounts[1] }))

            assert.equal((await token.balanceOf(accounts[1])).toNumber(), balance.toNumber())
            assert.equal((await token.balanceOf(accounts[2])).toNumber(), 0)
        })

        it("transfer 1 token", async () => {
            const balance = await token.balanceOf.call(accounts[1])
            await Utils.expectRevert(token.transfer.call(accounts[2], 1, { from: accounts[1] }))
            assert.equal((await token.balanceOf(accounts[2])).toNumber(), 0)
            assert.equal((await token.balanceOf(accounts[1])).toNumber(), balance.toNumber())
        })
    })

    
   describe('transfer function after finalize', async () => {

        var token = null

        before(async () => {
            token = await createToken()

            await token.setLogisticsAddress(logistics)
            await token.setAdminAddress(admin)

            await token.finalize({ from: admin })
        })

        it("transfer tokens from owner to other", async () => {
            Utils.checkTransferEventGroup(await token.transfer(accounts[1], 1000), accounts[0], accounts[1], 1000)
        })

        it("transfer 0 tokens", async () => {
            assert.equal(await token.transfer.call(accounts[2], 0, { from: accounts[1] }), true)
            Utils.checkTransferEventGroup(await token.transfer(accounts[2], 0, { from: accounts[1] }), accounts[1], accounts[2], 0)
        })

        it("transfer > balance", async () => {
            const balance = await token.balanceOf.call(accounts[1])
            await Utils.expectRevert(token.transfer.call(accounts[2], balance.add(1), { from: accounts[1] }))
        })

        it("transfer = balance", async () => {
            const balance1Before = await token.balanceOf.call(accounts[1])
            const balance2Before = await token.balanceOf.call(accounts[2])

            assert.equal(await token.transfer.call(accounts[2], balance1Before, { from: accounts[1] }), true)
            await token.transfer(accounts[2], balance1Before, { from: accounts[1] })

            const balance1After = await token.balanceOf.call(accounts[1])
            const balance2After = await token.balanceOf.call(accounts[2])

            assert.equal(balance1After.toNumber(), 0)
            assert.equal(balance2After.sub(balance2Before).toNumber(), balance1Before.sub(balance1After).toNumber(), balance1Before.toNumber())
        })

        it("transfer 1 token", async () => {
            const balance1Before = await token.balanceOf.call(accounts[1])
            const balance2Before = await token.balanceOf.call(accounts[2])

            assert.equal(await token.transfer.call(accounts[1], 1, { from: accounts[2] }), true)
            await token.transfer(accounts[1], 1, { from: accounts[2] })

            const balance1After = await token.balanceOf.call(accounts[1])
            const balance2After = await token.balanceOf.call(accounts[2])

            assert.equal(balance1After.toNumber(), 1)
            assert.equal(balance2After.toNumber(), balance2Before.sub(1).toNumber())
        })
    })     


    describe('transferFrom function before finalize', async () => {

        var token = null
  
        before(async () => {
           token = await createToken()
  
           await token.setLogisticsAddress(logistics)
           await token.setAdminAddress(admin)
  
           await token.transfer(accounts[4], 10000)
        })
  
  
        it("transfer 0 from account 2 -> 4 with 0 allowance", async () => {
           assert.equal(await token.approve.call(accounts[2], 0, { from: accounts[4] }), true)
           assert.equal(await token.allowance.call(accounts[4], accounts[2]), 0)
           await Utils.expectRevert(token.transferFrom.call(accounts[4], accounts[2], 10, { from: accounts[2] }))
        })
  
        it("transfer 1000 from account 2 -> 4 without allowance", async () => {
           await Utils.expectRevert(token.transferFrom.call(accounts[4], accounts[2], 1000, { from: accounts[4] }))
           await Utils.expectRevert(token.transferFrom.call(accounts[4], accounts[2], 1000, { from: accounts[2] }))
        })
  
        it("transfer 1000 from account 2 -> 4 with 10 allowance", async () => {
           assert.equal(await token.approve.call(accounts[2], 10, { from: accounts[4] }), true)
           Utils.checkApprovalEventGroup(await token.approve(accounts[2], 10, { from: accounts[4] }), accounts[4], accounts[2], 10)
  
           assert.equal((await token.allowance.call(accounts[4], accounts[2], { from: accounts[4] })).toNumber(), 10)
  
           await Utils.expectRevert(token.transferFrom.call(accounts[4], accounts[2], 1000, { from: accounts[4] }))
           await Utils.expectRevert(token.transferFrom.call(accounts[4], accounts[2], 1000, { from: accounts[2] }))
        })
  
        it("transfer 1000 from account 2 -> 4 with 1000 allowance (as logistics)", async () => {
           // We first need to bring approval to 0
           assert.equal(await token.approve.call(logistics, 0, { from: accounts[4] }), true)
           Utils.checkApprovalEventGroup(await token.approve(logistics, 0, { from: accounts[4] }), accounts[4], logistics, 0)
  
           assert.equal(await token.allowance.call(accounts[4], logistics, { from: accounts[4] }), 0)
  
           assert.equal(await token.approve.call(logistics, 1000, { from: accounts[4] }), true)
           Utils.checkApprovalEventGroup(await token.approve(logistics, 1000, { from: accounts[4] }), accounts[4], logistics, 1000)
  
           assert.equal(await token.allowance.call(accounts[4], logistics), 1000, { from: accounts[4] })
  
           await Utils.expectRevert(token.transferFrom.call(accounts[4], logistics, 1000, { from: accounts[4] }))
           assert.equal(await token.transferFrom.call(accounts[4], logistics, 1000, { from: logistics }), true)
           await token.transferFrom(accounts[4], logistics, 1000, { from: logistics })
  
           assert.equal((await token.balanceOf.call(accounts[4])).toNumber(), 9000)
           assert.equal((await token.balanceOf.call(logistics)).toNumber(), 1000)
        })
  
        it("transfer 1000 from account 2 -> 4 with 1000 allowance (as admin)", async () => {
           // We first need to bring approval to 0
           assert.equal(await token.approve.call(admin, 0, { from: accounts[4] }), true)
           Utils.checkApprovalEventGroup(await token.approve(admin, 0, { from: accounts[4] }), accounts[4], admin, 0)
  
           assert.equal(await token.allowance.call(accounts[4], admin, { from: accounts[4] }), 0)
  
           assert.equal(await token.approve.call(admin, 1000, { from: accounts[4] }), true)
           Utils.checkApprovalEventGroup(await token.approve(admin, 1000, { from: accounts[4] }), accounts[4], admin, 1000)
  
           assert.equal(await token.allowance.call(accounts[4], admin), 1000, { from: accounts[4] })
  
           await Utils.expectRevert(token.transferFrom.call(accounts[4], admin, 1000, { from: accounts[4] }))
           await Utils.expectRevert(token.transferFrom.call(accounts[4], admin, 1000, { from: admin }))
        })
     })
})
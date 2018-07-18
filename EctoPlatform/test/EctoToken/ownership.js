const Utils = require('../lib/utils.js')

const Moment = require('moment')
const BigNumber = require('bignumber.js')

const Ownership = artifacts.require("./Ownership.sol")

//
// Basic properties
//    owner
//
// initializeOwnershipTransfer
//    to 0
//    to this
//    to current owner
//    to accounts[1] as non-owner  ( from accounts[2] )
//    to accounts[1]
//
// endOwnershipTransfer
//    from accounts[2]
//    from current owner
//    from accounts[1]
//

contract('Ownership', (accounts)=>{
    async function createOwnership() {
        return await Ownership.new()
     }
  

     describe('Basic properties', async () => {

        var instance = null
  
        before(async () => {
           instance = await createOwnership()
        })
  
  
        it("owner", async () => {
           assert.equal(await instance.owner.call(), accounts[0])
        })
  
        it("intermediary", async () => {
           assert.equal(await instance.intermediary.call(), 0)
        })
     })

     describe('initializedOwnershipTransfer', async () => {

        var instance = null
  
        before(async () => {
           instance = await createOwnership()
        })
  
        it("to 0", async () => {
           assert.equal(await instance.initializeOwnershipTransfer.call(0), true)
           Utils.checkOwnershipTransferInitiatedEventGroup(await instance.initializeOwnershipTransfer(0), 0)
        })
  
        it("to this", async () => {
           assert.equal(await instance.initializeOwnershipTransfer.call(instance.address), true)
           Utils.checkOwnershipTransferInitiatedEventGroup(await instance.initializeOwnershipTransfer(instance.address), instance.address)
        })
  
        it("to current owner", async () => {
           const owner = await instance.owner.call()
           assert.equal(await instance.initializeOwnershipTransfer.call(owner), true)
           Utils.checkOwnershipTransferInitiatedEventGroup(await instance.initializeOwnershipTransfer(owner), owner)
        })
  
        it("to accounts[1]", async () => {
           assert.equal(await instance.initializeOwnershipTransfer.call(accounts[1]), true)
           Utils.checkOwnershipTransferInitiatedEventGroup(await instance.initializeOwnershipTransfer(accounts[1]), accounts[1])
        })
     })


     describe('endOwnershipTransfer', async () => {

        var instance = null
  
        before(async () => {
           instance = await createOwnership()
        })
  
  
        it("from accounts[2]", async () => {
           await Utils.expectRevert(instance.endOwnershipTransfer.call({ from: accounts[2] }))
        })
  
        it("from current owner", async () => {
            const owner = await instance.owner.call()
            await Utils.expectRevert(instance.endOwnershipTransfer.call({ from: owner }))
        })
  
        it("from account[1]", async () => {
           assert.equal(await instance.owner.call(), accounts[0])
           assert.equal(await instance.intermediary.call(), 0)
           await instance.initializeOwnershipTransfer(accounts[1])
           assert.equal(await instance.intermediary.call(), accounts[1])
  
           assert.equal(await instance.endOwnershipTransfer.call({ from: accounts[1] }), true)
           Utils.checkOwnershipTransferCompletedEventGroup(await instance.endOwnershipTransfer({ from: accounts[1] }), accounts[1])
  
           assert.equal(await instance.owner.call(), accounts[1])
           assert.equal(await instance.intermediary.call(), 0)
        })
     })
  
});
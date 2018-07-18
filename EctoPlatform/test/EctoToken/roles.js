const Utils = require('../lib/utils.js')

const Moment = require('moment')
const BigNumber = require('bignumber.js')

const Roles = artifacts.require("./Roles.sol")


//
// Basic properties
//    owner
//    adminAddress
//    logisticsAddress
//
// setAdminAddress
//    setAdminAddress to owner
//    setAdminAddress to this
//    setAdminAddress to logistics address
//    setAdminAddress to account[1]
//    setAdminAddress to 0
//
// setLogisticsAddress
//    setLogisticsAddress to owner
//    setLogisticsAddress to this
//    setLogisticsAddress to logistics address
//    setLogisticsAddress to account[1]
//    setLogisticsAddress to 0
//

contract('Roles', (accounts)=>{
    async function createRoles() {
        return await Roles.new()
     }
  
     describe('Basic properties', async () => {

        var instance = null
  
        before(async () => {
           instance = await createRoles()
        })
  
  
        it("owner", async () => {
           assert.equal(await instance.owner.call(), accounts[0])
        })
  
        it("adminAddress", async () => {
           assert.equal(await instance.adminAddress.call(), 0)
        })
  
        it("logisticsAddress", async () => {
           assert.equal(await instance.logisticsAddress.call(), 0)
        })
     })

     
   describe('setAdminAddress', async () => {

        var instance = null

        before(async () => {
        instance = await createRoles()
        })


        it("to the owner", async () => {
            const owner = await instance.owner.call()
            await Utils.expectRevert(instance.setAdminAddress.call(owner))
        })

        it("to 'this'", async () => {
            await Utils.expectRevert(instance.setAdminAddress.call(instance.address))
        })

        it("to logistics address", async () => {
            assert.equal(await instance.setLogisticsAddress.call(accounts[2]), true)
            await instance.setLogisticsAddress(accounts[2])
            await Utils.expectRevert(instance.setAdminAddress.call(accounts[2]))
        })

        it("to accounts[1]", async () => {
            assert.equal(await instance.adminAddress.call(), 0)
            assert.equal(await instance.setAdminAddress.call(accounts[1]), true)
            Utils.checkAdminAddressChangedEventGroup(await instance.setAdminAddress(accounts[1]), accounts[1])
            assert.equal(await instance.adminAddress.call(), accounts[1])
        })

        it("to 0", async () => {
            assert.equal(await instance.adminAddress.call(), accounts[1])
            assert.equal(await instance.setAdminAddress.call(0), true)
            Utils.checkAdminAddressChangedEventGroup(await instance.setAdminAddress(0), 0)
            assert.equal(await instance.adminAddress.call(), 0)
        })
    })

    describe('setLogisticsAddress', async () => {

        var instance = null
  
        before(async () => {
           instance = await createRoles()
        })
  
  
        it("to the owner", async () => {
            const owner = await instance.owner.call()
            await Utils.expectRevert(instance.setLogisticsAddress.call(owner))
        })
  
        it("to 'this'", async () => {
            await Utils.expectRevert(instance.setLogisticsAddress.call(instance.address))
        })
  
        it("to admin address", async () => {
            assert.equal(await instance.setAdminAddress.call(accounts[3]), true)
            await instance.setAdminAddress(accounts[3])
            await Utils.expectRevert(instance.setLogisticsAddress.call(accounts[3]));
        })
  
        it("to accounts[1]", async () => {
            assert.equal(await instance.logisticsAddress.call(), 0)
            assert.equal(await instance.setLogisticsAddress.call(accounts[1]), true)
            Utils.checkLogisticsAddressChangedEventGroup(await instance.setLogisticsAddress(accounts[1]), accounts[1])
            assert.equal(await instance.logisticsAddress.call(), accounts[1])
        })
  
        it("to 0", async () => {
            assert.equal(await instance.logisticsAddress.call(), accounts[1])
            assert.equal(await instance.setAdminAddress.call(0), true)
            Utils.checkLogisticsAddressChangedEventGroup(await instance.setLogisticsAddress(0), 0)
            assert.equal(await instance.logisticsAddress.call(), 0)
        })
     })
 

})
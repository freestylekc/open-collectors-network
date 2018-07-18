const Utils = require('../lib/utils.js')

const Moment = require('moment')
const BigNumber = require('bignumber.js')

const EctoToken = artifacts.require("./EctoToken.sol")
const Trustee = artifacts.require("./Trustee.sol")


//
// Trustee
//    - basic properties (totalLocked, allocations)
//    - grantAllocation
//       - grant 0 value (fails)
//       - grant 100 value to 0 address (fails)
//       - grant 10000 value when trustee only has 1000 (fails)
//       - grant 100 value when trustee has 10000, non-owner (fails)
//       - grant 100 value when trustee has 10000 (ok)
//       - grant 900 value to same address (fails)
//       - grant 900 value to another address (ok)
//       - grant 100 value after existing 100 allocation revoked (ok)
//       - grant 100 value that went to 0 through processing (fails)
//       - grant 100 value to address from logistics after finalized ( fails )
//    - revokeAllocation
//       - revoke before token finalized
//       - revoke non-existent allocation (fails)
//       - revoke allocation that can be revoked (ok)
//       - revoke allocation that cannot be revoked (fails)
//       - revoke allocation non-owner (fails)
//       - replace non-locked with locked allocation (ok)
//       - revoke the newly replaced locked allocation (fails)
//    - processAllocation
//       - process before token finalized
//       - process non-existing allocation (fails)
//       - process allocation for 0 value (fails)
//       - process allocation that has 0 value left (fails)
//       - process allocation > value left (fails)
//       - process allocation as non-logistics (fails)
//       - process allocation for half its value (ok)
//       - process allocation for all its value (ok)
//    - reclaimTokens
//       - with all tokens already locked
//       - with half tokens locked
//    - Ownership and permissions
//       - grantAllocation
//          - as owner
//          - as admin
//          - as logistics, not finalized
//          - as logistics, finalized
//          - as normal
//       - revokeAllocation
//          - as owner
//          - as admin
//          - as logistics
//          - as normal
//       - processAllocation
//          - as owner
//          - as admin
//          - as logistics, not finalized
//          - as logistics, finalized
//          - as normal
//       - reclaimTokens
//          - as owner
//          - as admin
//          - as logistics, finalized
//          - as normal
//


contract('Trustee', (accounts)=>{
    
   const DECIMALSFACTOR = new BigNumber('10').pow('18')

   const TOKENS_MAX     = new BigNumber('600000000').mul(DECIMALSFACTOR)

   const owner  = accounts[0]
   const admin  = accounts[1]
   const logistics    = accounts[2]


   describe('Basic properties', async () => {

        var token = null
        var trustee = null

        before(async () => {
            var contracts = await Utils.deployTrustee(artifacts, accounts)

            token = contracts.token
            trustee = contracts.trustee

            await token.transfer(trustee.address, new BigNumber("1000"))
        })


        it("totalLocked", async () => {
            assert.equal(await trustee.totalLocked.call(), 0)
        })

        it("allocations are public", async () => {
            var result = await trustee.allocations.call(accounts[0])
            assert.equal(result[0].toNumber(), 0) // amount
            assert.equal(result[1].toNumber(), 0) // transferred
            assert.equal(result[2], false)        // revokable
        })
    })

    describe('grantAllocation function', async () => {
        var token = null
        var trustee = null

        before(async () => {
            var contracts = await Utils.deployTrustee(artifacts, accounts)
   
            token = contracts.token
            trustee = contracts.trustee
   
            await token.transfer(trustee.address, new BigNumber("1000"))
   
            await token.setAdminAddress(admin)
            await trustee.setAdminAddress(admin)
            await trustee.setLogisticsAddress(logistics)
   
            await token.finalize({ from: accounts[1] })
        })

        it("grant 0 value", async () => {
            await Utils.expectRevert(trustee.grantAllocation(accounts[1], 0, true, { from: admin }))
         })
   
        it("grant 100 value to 0 address", async () => {
            await Utils.expectRevert(trustee.grantAllocation(0, 100, true, { from: admin }))
        })
   
        it("grant 10000 value when trustee only has 1000", async () => {
            await Utils.expectRevert(trustee.grantAllocation(accounts[1], 100000, true, { from: admin }))
        })
   
        it("grant 100 value when non-owner", async () => {
            await Utils.expectRevert(trustee.grantAllocation(accounts[1], 100, true, { from: accounts[4] }))
        })
   
        it("grant 100 value when admin", async () => {
            await trustee.grantAllocation(accounts[1], 100, true, { from: admin })
            const allocation = await trustee.allocations.call(accounts[1], { from: admin })
   
            assert.equal(allocation[0].toNumber(), 100)
            assert.equal(allocation[1].toNumber(), 0)
            assert.equal(allocation[2], true)
        })
   
        it("grant 900 value to same address", async () => {
            await Utils.expectRevert(trustee.grantAllocation(accounts[1], 900, true, { from: admin }))
        })
   
        it("grant 900 value to another address", async () => {
            await trustee.grantAllocation(accounts[2], 900, true, { from: admin })
        })
   
        it("grant 100 value after existing allocation revoked", async () => {
            assert.equal(await trustee.revokeAllocation.call(accounts[1], { from: owner }), true)
            await trustee.revokeAllocation(accounts[1], { from: owner })
   
            // because there is no allocations for accounts[1], it should work
            await trustee.grantAllocation(accounts[1], 100, true, { from: admin })
        })
   
   
        it("grant 100 value to address where grant went to 0", async () => {
            await trustee.processAllocation(accounts[1], 100, { from: logistics })

            await token.transfer(trustee.address, 100)

            // This should fail since when an allocation goes to 0 it doesnt get deleted
            await Utils.expectRevert(trustee.grantAllocation(accounts[1], 100, true, { from: admin }))
        })

        it("grant 100 value to address from logistics after finalized", async () => {
            await Utils.expectRevert(trustee.grantAllocation(accounts[4], 100, true, { from: logistics }))
        })
    })

    describe('revokeAllocation function', async () => {

        var token = null
        var trustee = null
  
        before(async () => {
           var contracts = await Utils.deployTrustee(artifacts, accounts)
  
           token = contracts.token
           trustee = contracts.trustee
  
           await token.setAdminAddress(admin)
           await trustee.setAdminAddress(admin)
           await trustee.setLogisticsAddress(logistics)
  
           await token.transfer(trustee.address, new BigNumber("1000"))
        })
  
  
        it("revoke before token finalized", async () => {
           await trustee.grantAllocation(accounts[1], 10, true, { from: admin })
           await trustee.revokeAllocation(accounts[1], { from: owner })
           await token.finalize({ from: admin })
        })
  
        it("revoke non-existent allocation", async () => {
           await Utils.expectRevert(trustee.revokeAllocation(accounts[2]), { from: owner })
        })
  
        it("revoke allocation that can be revoked", async () => {
           await trustee.grantAllocation(accounts[1], 10, true, { from: admin })
           await trustee.revokeAllocation(accounts[1], { from: owner })
        })
  
        it("revoke allocation that cannot be revoked", async () => {
           await trustee.grantAllocation(accounts[2], 10, false, { from: admin })
           await Utils.expectRevert(trustee.revokeAllocation(accounts[2], { from: owner }))
        })
  
        it("revoke allocation non-owner", async () => {
           await trustee.grantAllocation(accounts[5], 100, true, { from: admin })
           await Utils.expectRevert(trustee.revokeAllocation(accounts[5], 10, true, { from: accounts[4] }))
        })
  
        it("replace non-locked with locked allocation", async () => {
           await trustee.grantAllocation(accounts[1], 10, true, { from: admin })
           await trustee.revokeAllocation(accounts[1], { from: owner })
           await trustee.grantAllocation(accounts[1], 10, false, { from: admin })
        })
  
        it("revoke newly locked allocation", async () => {
           await Utils.expectRevert(trustee.revokeAllocation(accounts[1], { from: owner }))
        })
  
     })


     describe('processAllocation function', async () => {

        var token = null
        var trustee = null
  
        before(async () => {
           var contracts = await Utils.deployTrustee(artifacts, accounts)
  
           token = contracts.token
           trustee = contracts.trustee
  
           await token.setAdminAddress(admin)
           await trustee.setAdminAddress(admin)
           await trustee.setLogisticsAddress(logistics)
  
           await token.transfer(trustee.address, new BigNumber("1000"))
        })
  
  
        it("process before token finalized", async () => {
           await trustee.grantAllocation(accounts[1], 10, true, { from: admin })
           await Utils.expectRevert(trustee.processAllocation(accounts[1], 10, { from: logistics }))
           await token.finalize({ from: admin })
           await trustee.processAllocation(accounts[1], 10, { from: logistics })
        })
  
        it("process non-existent allocation", async () => {
           await Utils.expectRevert(trustee.processAllocation(accounts[2], 10, { from: logistics }))
        })
  
        it("process allocation that has 0 value left", async () => {
           await trustee.grantAllocation(accounts[5], 10, true, { from: admin });
           await trustee.processAllocation(accounts[5], 10, { from: logistics });
           await Utils.expectRevert(trustee.processAllocation(accounts[5], 1, true, { from: logistics }))
        })
  
        it("process allocation for 0 value", async () => {
           await trustee.grantAllocation(accounts[2], 10, true, { from: admin })
           await Utils.expectRevert(trustee.processAllocation(accounts[2], 0, { from: logistics }))
        })
  
        it("process allocation for > value left", async () => {
           await Utils.expectRevert(trustee.processAllocation(accounts[2], 20, { from: logistics }))
        })
  
        it("process allocation as non-logistics", async () => {
           await Utils.expectRevert(trustee.processAllocation(accounts[2], 10, { from: accounts[4] }))
        })
  
        it("process allocation for half its value", async () => {
           await trustee.processAllocation(accounts[2], 5, { from: logistics })
        })
  
        it("process allocation for all its value", async () => {
           await trustee.processAllocation(accounts[2], 5, { from: logistics })
        })
     })
  
     describe('reclaimTokens function', async () => {

        var token = null
        var trustee = null
  
        before(async () => {
           var contracts = await Utils.deployTrustee(artifacts, accounts)
  
           token = contracts.token
           trustee = contracts.trustee
  
           await token.setAdminAddress(admin)
           await trustee.setAdminAddress(admin)
           await trustee.setLogisticsAddress(logistics)
  
           await token.transfer(trustee.address, new BigNumber("1000"))
        })
  
  
        it("with all tokens already locked", async () => {
           await trustee.grantAllocation(accounts[1], 1000, true, { from: logistics })
  
           await Utils.expectRevert(trustee.reclaimTokens.call({ from: admin }))
  
           await trustee.revokeAllocation(accounts[1], { from: owner })
        })
  
        it("with half tokens locked", async () => {
           await trustee.grantAllocation(accounts[1], 500, true, { from: logistics }) // total : 1500, total locked: 500
        
           const balance0Before = await token.balanceOf(accounts[0]) // 600M -500
           const balanceTrusteeBefore = await token.balanceOf(trustee.address) //1500
  
           assert.equal(await trustee.reclaimTokens.call({ from: admin }), true)
           Utils.checkTokensReclaimedEventGroup(await trustee.reclaimTokens({ from: admin }), 500)
  
           const balance0After = await token.balanceOf(accounts[0]) // 600M
           const balanceTrusteeAfter = await token.balanceOf(trustee.address) //500
  
           assert.equal(balance0After.sub(balance0Before).toNumber(), 500)
           assert.equal(balanceTrusteeAfter.toNumber(), 500)
  
           await trustee.revokeAllocation(accounts[1], { from: owner })
        })
  
  
        it("after finalize", async () => {
           await token.finalize({ from: admin })

           await trustee.grantAllocation(accounts[3], 250, false, { from: admin })
           await trustee.reclaimTokens({ from: admin })

           const balanceTrusteeAfter = await token.balanceOf(trustee.address) //500
           assert.equal(balanceTrusteeAfter.toNumber(), 250)
        })
     })

     describe('Ownership and permissions', async () => {

        var token = null
        var trustee = null
  
  
        before(async () => {
           var contracts = await Utils.deployTrustee(artifacts, accounts)
  
           token = contracts.token
           trustee = contracts.trustee
  
           await token.setAdminAddress(admin)
           await trustee.setAdminAddress(admin)
           await trustee.setLogisticsAddress(logistics)
  
           await token.transfer(trustee.address, new BigNumber("1000"))
        })
  
  
        context('grantAllocation', async() => {
  
           it("as owner", async () => {
              await Utils.expectRevert(trustee.grantAllocation.call(accounts[3], 1, true, { from: owner }))
           })
  
           it("as admin", async () => {
              assert.equal(await trustee.grantAllocation.call(accounts[3], 1, true, { from: admin }), true)
              await trustee.grantAllocation(accounts[3], 1, true, { from: admin })
  
              await trustee.revokeAllocation(accounts[3], { from: owner })
           })
  
           it("as logistics, not finalized", async () => {
              assert.equal(await trustee.grantAllocation.call(accounts[3], 1, true, { from: logistics }), true)
              await trustee.grantAllocation(accounts[3], 1, true, { from: logistics })
  
              await trustee.revokeAllocation(accounts[3], { from: owner })
           })
  
           it("as logistics, finalized", async () => {
              await token.finalize({ from: admin })
  
              await Utils.expectRevert(trustee.grantAllocation.call(accounts[3], 1, true, { from: logistics }))
           })
  
           it("as normal", async () => {
              await Utils.expectRevert(trustee.grantAllocation.call(accounts[3], 1, true, { from: accounts[4] }))
           })
        })

        context('revokeAllocation', async() => {

            before(async () => {
               var contracts = await Utils.deployTrustee(artifacts, accounts)
   
               token = contracts.token
               trustee = contracts.trustee
   
               await token.setAdminAddress(admin)
               await trustee.setAdminAddress(admin)
               await trustee.setLogisticsAddress(logistics)
   
               await token.transfer(trustee.address, new BigNumber("1000"))
            })
   
   
            it("as owner", async () => {
               await trustee.grantAllocation(accounts[3], 1, true, { from: admin })
               await trustee.revokeAllocation(accounts[3], { from: owner })
            })
   
            it("as admin", async () => {
               await trustee.grantAllocation(accounts[3], 1, true, { from: admin })
   
               await Utils.expectRevert(trustee.revokeAllocation.call(accounts[3], { from: admin }))

               await trustee.revokeAllocation(accounts[3], { from: owner })
            })
   
            it("as logistics, not finalized", async () => {
               assert.equal(await token.finalized.call(), false)
   
               await trustee.grantAllocation(accounts[3], 1, true, { from: admin })
   
               await Utils.expectRevert(trustee.revokeAllocation.call(accounts[3], { from: logistics }))

               await trustee.revokeAllocation(accounts[3], { from: owner })
               
            })
   
            it("as logistics, finalized", async () => {
               await token.finalize({ from: admin })
   
               assert.equal(await token.finalized.call(), true)
   
               await trustee.grantAllocation(accounts[3], 1, true, { from: admin })
   
               await Utils.expectRevert(trustee.revokeAllocation.call(accounts[3], { from: logistics }))

               await trustee.revokeAllocation(accounts[3], { from: owner })
            })
   
            it("as normal", async () => {
               assert.equal(await token.finalized.call(), true)
   
               await trustee.grantAllocation(accounts[3], 1, true, { from: admin })
   
               await Utils.expectRevert(trustee.revokeAllocation.call(accounts[3], { from: accounts[4] }))
               
               await trustee.revokeAllocation(accounts[3], { from: owner })
            })
         })
    })

    context('processAllocation, before finalize', async() => {

        before(async () => {
           var contracts = await Utils.deployTrustee(artifacts, accounts)

           token = contracts.token
           trustee = contracts.trustee

           await token.setAdminAddress(admin)
           await trustee.setAdminAddress(admin)
           await trustee.setLogisticsAddress(logistics)

           await token.transfer(trustee.address, new BigNumber("1000"))
        })

        it("as owner", async () => {
           assert.equal(await trustee.grantAllocation.call(accounts[3], 1, true, { from: admin }), true)
           await trustee.grantAllocation(accounts[3], 1, true, { from: admin })

           await Utils.expectRevert(trustee.processAllocation.call(accounts[3], 1, { from: owner }))

           await trustee.revokeAllocation(accounts[3], { from: owner })
        })

        it("as admin", async () => {
           assert.equal(await trustee.grantAllocation.call(accounts[3], 1, true, { from: admin }), true)
           await trustee.grantAllocation(accounts[3], 1, true, { from: admin })

           await Utils.expectRevert(trustee.processAllocation.call(accounts[3], 1, { from: admin }))

           await trustee.revokeAllocation(accounts[3], { from: owner })
        })

        it("as logistics", async () => {
           assert.equal(await token.finalized.call(), false)

           assert.equal(await trustee.grantAllocation.call(accounts[3], 1, true, { from: admin }), true)
           await trustee.grantAllocation(accounts[3], 1, true, { from: admin })

           await Utils.expectRevert(trustee.processAllocation.call(accounts[3], 1, { from: logistics }))

           await trustee.revokeAllocation(accounts[3], { from: owner })
        })

        it("as normal (beneficiary)", async () => {
           assert.equal(await trustee.grantAllocation.call(accounts[3], 1, true, { from: admin }), true)
           await trustee.grantAllocation(accounts[3], 1, true, { from: admin })

           await Utils.expectRevert(trustee.processAllocation.call(accounts[3], 1, { from: accounts[3] }))

           await trustee.revokeAllocation(accounts[3], { from: owner })
        })
     })

     context('processAllocation, after finalize', async() => {

        before(async () => {
           var contracts = await Utils.deployTrustee(artifacts, accounts)

           token = contracts.token
           trustee = contracts.trustee

           await token.setAdminAddress(admin)
           await trustee.setAdminAddress(admin)
           await trustee.setLogisticsAddress(logistics)

           await token.transfer(trustee.address, new BigNumber("1000"))

           await token.finalize({ from: admin })
        })

        it("as owner", async () => {
           assert.equal(await trustee.grantAllocation.call(accounts[3], 1, true, { from: admin }), true)
           await trustee.grantAllocation(accounts[3], 1, true, { from: admin })

           await Utils.expectRevert(trustee.processAllocation.call(accounts[3], 1, { from: owner }))

           await trustee.revokeAllocation(accounts[3], { from: owner })
        })

        it("as admin", async () => {
           assert.equal(await trustee.grantAllocation.call(accounts[3], 1, true, { from: admin }), true)
           await trustee.grantAllocation(accounts[3], 1, true, { from: admin })

           await Utils.expectRevert(trustee.processAllocation.call(accounts[3], 1, { from: admin }))

           await trustee.revokeAllocation(accounts[3], { from: owner })
        })

        it("as logistics", async () => {
           assert.equal(await trustee.grantAllocation.call(accounts[3], 1, true, { from: admin }), true)
           await trustee.grantAllocation(accounts[3], 1, true, { from: admin })

           assert.equal(await trustee.processAllocation.call(accounts[3], 1, { from: logistics }), true)
           await trustee.processAllocation(accounts[3], 1, { from: logistics })

           await trustee.revokeAllocation(accounts[3], { from: owner })
        })
        it("as normal (beneficiary)", async () => {
           assert.equal(await trustee.grantAllocation.call(accounts[3], 1, true, { from: admin }), true)
           await trustee.grantAllocation(accounts[3], 1, true, { from: admin })

           await Utils.expectRevert(trustee.processAllocation.call(accounts[3], 1, { from: accounts[3] }))

           await trustee.revokeAllocation(accounts[3], { from: owner })
        })
     })

     context('reclaimTokens', async() => {

        before(async () => {
           var contracts = await Utils.deployTrustee(artifacts, accounts)

           token = contracts.token
           trustee = contracts.trustee

           await token.setAdminAddress(admin)
           await trustee.setAdminAddress(admin)
           await trustee.setLogisticsAddress(logistics)

           await token.transfer(trustee.address, new BigNumber("1000"))
        })


        it("as owner", async () => {
           await trustee.grantAllocation(accounts[3], 500, true, { from: admin })

           const ownerTokensBefore = await token.balanceOf.call(owner)

           const totalLocked = await trustee.totalLocked.call()
           assert.equal(totalLocked.toNumber(), 500)

           await Utils.expectRevert(trustee.reclaimTokens.call({ from: owner }))

           await trustee.revokeAllocation(accounts[3], { from: owner })
        })

        it("as admin", async () => {
           await trustee.grantAllocation(accounts[3], 250, true, { from: admin })

           const ownerTokensBefore = await token.balanceOf.call(owner)

           const totalLocked = await trustee.totalLocked.call()
           assert.equal(totalLocked.toNumber(), 250)

           assert.equal(await trustee.reclaimTokens.call({ from: admin }), true)
           Utils.checkTokensReclaimedEventGroup(await trustee.reclaimTokens({ from: admin }), 750)

           const ownerTokensAfter = await token.balanceOf.call(owner)

           assert(ownerTokensAfter.sub(ownerTokensBefore).toNumber(), 750)

           await trustee.revokeAllocation(accounts[3], { from: owner })
        })

        it("as logistics", async () => {
           await token.finalize({ from: admin })

           await trustee.grantAllocation(accounts[3], 125, true, { from: admin })

           const ownerTokensBefore = await token.balanceOf.call(owner)

           const totalLocked = await trustee.totalLocked.call()
           assert.equal(totalLocked.toNumber(), 125)

           await Utils.expectRevert(trustee.reclaimTokens.call({ from: logistics }))

           await trustee.revokeAllocation(accounts[3], { from: owner })
        })

        it("as normal", async () => {
           await trustee.grantAllocation(accounts[3], 125, true, { from: admin })

           const ownerTokensBefore = await token.balanceOf.call(owner)

           const totalLocked = await trustee.totalLocked.call()
           assert.equal(totalLocked.toNumber(), 125)

           await Utils.expectRevert(trustee.reclaimTokens.call({ from: accounts[4] }))

           await trustee.revokeAllocation(accounts[3], { from: owner })
        })
     })
})
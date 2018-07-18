// Based on
// ----------------------------------------------------------------------------
//  https://raw.githubusercontent.com/OpenSTFoundation/SimpleTokenSale/master/test/lib/utils.js
// ----------------------------------------------------------------------------

// @dev : for installing web 3 package
//npm install --global --production windows-build-tools
//npm install --global node-gyp
//install windows 8.1 SDK 
//npm config set msvs_version 2017
//npm install web3

console.log("utils 1");

const Moment = require('moment')
const BigNumber = require('bignumber.js')

var EctoToken = artifacts.require("./EctoToken.sol")
var Trustee = artifacts.require("./Trustee.sol")
var TokenSale = artifacts.require("./TokenSale.sol")
var TokenSaleMock = artifacts.require("./TokenSaleMock.sol")


module.exports.expectThrow = async (promise) => {
    try {
        await promise;
    } catch (error) {
        const invalidOpcode = error.message.search('invalid opcode') > -1;

        const outOfGas = error.message.search('out of gas') > -1;

        assert(invalidOpcode || outOfGas, `Expected throw, but got ${error} instead`);

        return;
    }

    assert(false, "Did not throw as expected");
};

module.exports.expectRevert = async (promise)=>{
    var thrown = false;
    try {
        await promise;
    } catch (error) {
        thrown = true;
    }

    assert.equal(thrown, true);
}



module.exports.decodeLogs = (abi, logs) => {
    return decodeLogs(abi, logs)
}


function decodeLogs(abi, logs) {
   var decodedLogs = null
   try {
      decodedLogs = decodeLogsInternal(abi, logs)
   } catch(error) {
      throw new 'Could not decode receipt log for transaction ' + txID + ', message: ' + error
   }

   return decodedLogs
}

//function decodeLogsInternal(abi, logs) {

//    // Find events in the ABI
//    var abiEvents = abi.filter(json => {
//       return json.type === 'event'
//    })
 
//    if (abiEvents.length === 0) {
//       return
//    }
 
//    // Build SolidityEvent objects
//    var solidityEvents = []
//    for (i = 0; i < abiEvents.length; i++) {
//       solidityEvents.push(new SolidityEvent(null, abiEvents[i], null))
//    }
 
//    // Decode each log entry
//    var decodedLogs = []
//    for (i = 0; i < logs.length; i++) {
 
//       var event = null
//       for (j = 0; j < solidityEvents.length; j++) {
//          if (solidityEvents[j].signature() == logs[i].topics[0].replace("0x", "")) {
//             event = solidityEvents[j]
//             break
//          }
//       }
 
//       var decodedLog = null
 
//       if (event != null) {
//          decodedLog = event.decode(logs[i])
//       } else {
//          // We could not find the right event to decode this log entry, just keep as is.
//          decodedLog = logs[i]
//       }
 
//       // Convert bytes32 parameters to ascii
//       for (j = 0; j < abiEvents.length; j++) {
//          const abiEvent = abiEvents[j]
 
//          if (!abiEvent.inputs) {
//             continue
//          }
 
//          if (abiEvent.name != decodedLog.name) {
//             continue
//          }
 
//          for (k = 0; k < abiEvent.inputs; k++) {
//             if (abiEvent.inputs[k].type == 'bytes32') {
//                decodedLog.args[abiEvent.inputs[k].name] = hexToAscii(decodedLog.args[abiEvent.inputs[k]]);
//             }
//          }
//       }
 
//       decodedLogs.push(decodedLog)
//    }
 
//    return decodedLogs
// }


 //START ERC20Token.sol
 //________________________________________________________________________________
 module.exports.checkTransferEventGroup = (result, _from, _to, _value) => {
    assert.equal(result.logs.length, 1)
 
    const event = result.logs[0]
 
    module.exports.checkTransferEvent(event, _from, _to, _value)
 }
 module.exports.checkTransferEvent = (event, _from, _to, _value) => {
    if (Number.isInteger(_value)) {
       _value = new BigNumber(_value)
    }
 
    assert.equal(event.event, "Transfer")
    assert.equal(event.args._from, _from)
    assert.equal(event.args._to, _to)
    assert.equal(event.args._value.toNumber(), _value.toNumber())
 }

 module.exports.checkApprovalEventGroup = (result, _owner, _spender, _value) => {
    assert.equal(result.logs.length, 1)
 
    const event = result.logs[0]
 
    if (Number.isInteger(_value)) {
       _value = new BigNumber(_value)
    }
 
    assert.equal(event.event, "Approval")
    assert.equal(event.args._owner, _owner)
    assert.equal(event.args._spender, _spender)
    assert.equal(event.args._value.toNumber(), _value.toNumber())
 }
 //END ERC20Token.sol
 //________________________________________________________________________________


 //START Ownership.sol
 //________________________________________________________________________________
 module.exports.checkOwnershipTransferInitiatedEventGroup = (result, _intermediary) => {
    assert.equal(result.logs.length, 1)
 
    const event = result.logs[0]
 
    assert.equal(event.event, "InitializedOwnershipTransfer")
    assert.equal(event.args._intermediary, _intermediary)
 }


 module.exports.checkOwnershipTransferCompletedEventGroup = (result) => {
    assert.equal(result.logs.length, 1)
 
    const event = result.logs[0]
 
    assert.equal(event.event, "FinalizedOwnershipTransfer")
 }

 
//END Ownership.sol
//________________________________________________________________________________


//START Roles.sol
 //________________________________________________________________________________
module.exports.checkAdminAddressChangedEventGroup = (result, _newAddress) => {
    assert.equal(result.logs.length, 1)
 
    const event = result.logs[0]
 
    assert.equal(event.event, "AdminAddressChanged")
    assert.equal(event.args._newAddress, _newAddress)
 }
 
 
 module.exports.checkLogisticsAddressChangedEventGroup = (result, _newAddress) => {
    assert.equal(result.logs.length, 1)
 
    const event = result.logs[0]
 
    assert.equal(event.event, "LogisticsAddressChanged")
    assert.equal(event.args._newAddress, _newAddress)
 }
 //END Roles.sol
 //________________________________________________________________________________


 //START TokenSaleLocks.sol
 //________________________________________________________________________________
 module.exports.checkUnlockDateExtendedEventGroup = (result, _newDate) => {
    assert.equal(result.logs.length, 1)
 
    const event = result.logs[0]
 
    if (Number.isInteger(_newDate)) {
       _newDate = new BigNumber(_newDate)
    }
 
    assert.equal(event.event, "UnlockDateExtended")
    assert.equal(event.args._newDate.toNumber(), _newDate.toNumber())
 }
 //END TokenSaleLocks.sol
 //________________________________________________________________________________



 //START Trustee.sol
 //________________________________________________________________________________
 module.exports.deployTrustee = async (artifacts, accounts) => {

    const token = await EctoToken.new({ from: accounts[0], gas: 3500000 })
    const trustee = await Trustee.new(token.address, { from: accounts[0], gas: 3500000 })
 
    return {
       token : token,
       trustee : trustee
    }
 }

 module.exports.checkTokensReclaimedEventGroup = (result, _amount) => {
    assert.equal(result.logs.length, 1)
 
    const event = result.logs[0]
 
    if (Number.isInteger(_amount)) {
       _amount = new BigNumber(_amount)
    }
 
    assert.equal(event.event, "TokensReclaimed")
    assert.equal(event.args._amount.toNumber(), _amount.toNumber())
 }
 //END Trustee.sol
 //________________________________________________________________________________


 //START TokenSale.sol
 //________________________________________________________________________________

 module.exports.deployContracts = async (artifacts, accounts) => {

    const token = await EctoToken.new({ from: accounts[0], gas: 3500000 })
    const trustee = await Trustee.new(token.address, { from: accounts[0], gas: 3500000 })
    const sale = await TokenSale.new(token.address, trustee.address, accounts[0], { from: accounts[0], gas: 4500000 })
 
   
    return {
       token : token,
       trustee : trustee,
       sale : sale
    }
 }
 module.exports.getSender = (result) => {
    assert.equal(result.logs.length, 1)
 
    const event = result.logs[0]
 
    console.log('SENDER:', event.args._beneficiary)
 }

 module.exports.checkWhitelistUpdatedEventGroup = (result, _account) => {
    assert.equal(result.receipt.logs.length, 1)
 
    const logs = decodeLogs(TokenSale.abi, [ result.receipt.logs[0] ])
 
    assert.equal(logs.length, 1)
 
    assert.equal(logs[0].event, "WhitelistUpdated")
    assert.equal(logs[0].args._account, _account)
 }

 module.exports.checkWhitelistRemovedEventGroup = (result, _account) => {
    assert.equal(result.receipt.logs.length, 1)
 
    const logs = decodeLogs(TokenSale.abi, [ result.receipt.logs[0] ])
 
    assert.equal(logs.length, 1)
 
    assert.equal(logs[0].event, "WhitelistRemoved")
    assert.equal(logs[0].args._account, _account)
 }

 module.exports.checkFinalizedEventGroup = (result) => {
    assert.equal(result.logs.length, 1)
 
    const event = result.logs[0]
 
    assert.equal(event.event, "Finalized")
 }


 module.exports.checkUnsoldTokensBurntEventGroup = (result, _amount) => {
    assert.equal(result.logs.length, 1)
 
    const event = result.logs[0]
 
    if (Number.isInteger(_amount)) {
       _amount = new BigNumber(_amount)
    }
 
    assert.equal(event.event, "UnsoldTokensBurnt")
    assert.equal(event.args._amount.toNumber(), _amount.toNumber())
 }

 module.exports.changeTime = async (sale, newTime) => {
    await sale.changeTime(newTime)
 };

 module.exports.calculateCostFromTokens = function (tokensPerKEther, tokenAmount) {
    return tokenAmount.mul(1000).div(tokensPerKEther)
 }
 //END TokenSale.sol
 //________________________________________________________________________________

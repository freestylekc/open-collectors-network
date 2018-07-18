pragma solidity ^0.4.18;

// Based on
// ----------------------------------------------------------------------------
//  https://github.com/OpenSTFoundation/SimpleTokenSale/blob/master/contracts/Trustee.sol
// ----------------------------------------------------------------------------


import '../Lib/SafeMath.sol';

import './EctoToken.sol';
import './Roles.sol';

//
// Implements a simple trustee which can release tokens based on an explicit call from the owner.
// Permisions
//      grantAllocation      ( Owner - No, Admin - Yes,  Logistics - Yes )
//      revokeAllocation     ( Owner - Yes,Admin - No,   Logistics - No  )
//      processAllocation    ( Owner - No, Admin - No,   Logistics - Yes )
//      reclaimTokens        ( Owner - No, Admin - Yes,  Logistics - No  )
//

contract Trustee is Roles {
    using SafeMath for uint256;

    EctoToken public tokenContract;

    struct Allocation {
        uint256 amountGranted;
        uint256 amountTransferred;
        bool revokable;
    }

    // Total number of tokens that are currently allocated.
    // This does not include tokens that have been processed (sent to an address) already or
    // the ones in the trustee's account that have not been allocated yet.
    uint256 public totalLocked;

    mapping (address => Allocation) public allocations;

    //
    // Events
    //
    event AllocationGranted(address indexed _from, address indexed _account, uint256 _amount, bool _revokable);
    event AllocationRevoked(address indexed _from, address indexed _account, uint256 _amountRevoked);
    event AllocationProcessed(address indexed _from, address indexed _account, uint256 _amount);
    event TokensReclaimed(uint256 _amount);

    function Trustee(EctoToken _tokenContract) public Roles() {
        require(isAddressable(address(_tokenContract)));

        tokenContract = _tokenContract;
    }

    function getGrantedAmount(address _account) public view onlyOwner returns (uint256) {
        return allocations[_account].amountGranted;
    }

    function getTransferredAmount(address _account) public view onlyOwner returns (uint256) {
        return allocations[_account].amountTransferred;
    }

    // Allows admin or logistics to create new allocations for a specific account.
    function grantAllocation(address _account, uint256 _amount, bool _revokable) public onlyAdminOrLogistics returns (bool) {
        require(isAddressable(_account));
        require(_account != address(this));
        require(_amount > 0);

        // Can't create an allocation if there is already one for this account.
        require(allocations[_account].amountGranted == 0);

        if (isLogistics(msg.sender)) {
            // Once the token contract is finalized, the logistics key should not be able to grant allocations any longer.
            // Before finalized, it is used by the TokenSale contract to allocate pre-sales.
            require(!tokenContract.finalized());
        }

        totalLocked = totalLocked.add(_amount);
        require(totalLocked <= tokenContract.balanceOf(address(this)));

        allocations[_account] = Allocation({
            amountGranted : _amount, 
            amountTransferred : 0, 
            revokable : _revokable
        });

        AllocationGranted(msg.sender, _account, _amount, _revokable);

        return true;
    }

    // Allows the revoke address to revoke allocations, if revoke is allowed.
    function revokeAllocation(address _account) external onlyOwner returns (bool) {
        require(isAddressable(_account));

        Allocation memory allocation = allocations[_account];

        require(allocation.revokable);

        uint256 ownerRefund = allocation.amountGranted.sub(allocation.amountTransferred);

        delete allocations[_account];

        totalLocked = totalLocked.sub(ownerRefund);

        AllocationRevoked(msg.sender, _account, ownerRefund);

        return true;
    }

    // Allows logistics to transfer tokens to the beneficiary.
    // The exact amount to transfer is calculated based on agreements with beneficiaries.
    // Here we only restrict that the total amount transfered cannot exceed what has been granted.
    function processAllocation(address _account, uint256 _amount) external onlyLogistics returns (bool) {
        require(isAddressable(_account));
        require(_amount > 0);

        Allocation storage allocation = allocations[_account];

        require(allocation.amountGranted > 0);
		
		

        uint256 transferable = allocation.amountGranted.sub(allocation.amountTransferred);
        require(transferable >= _amount);


        allocation.amountTransferred = allocation.amountTransferred.add(_amount);

		// Note that transfer will fail if the token contract has not been finalized yet.
        require(tokenContract.transfer(_account, _amount));
		
		totalLocked = totalLocked.sub(_amount);

        AllocationProcessed(msg.sender, _account, _amount);

        return true;
    }

    // Allows the admin to claim back all tokens that are not currently allocated.
    // Note that the trustee should be able to move tokens even before the token is finalized because EctoToken allows sending back to owner specifically.
    function reclaimTokens() external onlyAdmin returns (bool) {
        uint256 ownBalance = tokenContract.balanceOf(address(this));

        // If balance <= amount locked, there is nothing to reclaim.
        require(ownBalance > totalLocked);

        uint256 amountReclaimed = ownBalance.sub(totalLocked);

        address tokenOwner = tokenContract.owner();
        require(isAddressable(tokenOwner));

        require(tokenContract.transfer(tokenOwner, amountReclaimed));

        TokensReclaimed(amountReclaimed);

        return true;
    }
}
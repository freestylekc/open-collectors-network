pragma solidity ^0.4.18;

// Based on
// ----------------------------------------------------------------------------
//  https://github.com/OpenSTFoundation/SimpleTokenSale/blob/master/contracts/OpsManaged.sol
// ----------------------------------------------------------------------------

import "./Ownership.sol";

contract Roles is Ownership {

	address public adminAddress;
	address public logisticsAddress;

	event AdminAddressChanged(address indexed _newAddress);
    event LogisticsAddressChanged(address indexed _newAddress);

	function Roles() public Ownership() {
	
	}

	modifier onlyAdmin() {
        require(isAdmin(msg.sender));
        _;
    }
    function isAdmin(address _address) internal view returns (bool) {
        return (isAddressable(adminAddress) && _address == adminAddress);
    }

	
    modifier onlyLogistics() {
        require(isLogistics(msg.sender));
        _;
    }
	function isLogistics(address _address) internal view returns (bool) {
        return (isAddressable(logisticsAddress) && _address == logisticsAddress);
    }

    modifier onlyAdminOrLogistics() {
        require(isAdmin(msg.sender) || isLogistics(msg.sender));
        _;
    }
    
    modifier onlyOwnerOrAdmin() {
        require(isOwner(msg.sender) || isAdmin(msg.sender));
        _;
    }

    function isOwnerOrLogistics(address _address) internal view returns (bool) {
        return (isOwner(_address) || isLogistics(_address));
    }

	// Owner and Admin can change the admin address. Address can also be set to 0 to 'disable' it.
    function setAdminAddress(address _adminAddress) external onlyOwnerOrAdmin returns (bool) {
        require(_adminAddress != owner);
        require(_adminAddress != address(this));
        require(!isLogistics(_adminAddress));

        adminAddress = _adminAddress;

        AdminAddressChanged(_adminAddress);

        return true;
    }


	 // Owner and Admin can change the logistics address. Address can also be set to 0 to 'disable' it.
    function setLogisticsAddress(address _logisticsAddress) external onlyOwnerOrAdmin returns (bool) {
        require(_logisticsAddress != owner);
        require(_logisticsAddress != address(this));
        require(!isAdmin(_logisticsAddress));

        logisticsAddress = _logisticsAddress;

        LogisticsAddressChanged(_logisticsAddress);

        return true;
    }

}
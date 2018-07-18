pragma solidity ^ 0.4.18;

import './IcoPool.sol';
import '../Lib/CollectibleLibrary.sol';

library IcoPoolLibrary
{
    using CollectibleLibrary for *;

    function mintIcoPool(
        CollectibleLibrary.CollectibleData storage self,
        string title,
        string description,
        string icoEmail,
        address _saleAddress,
        uint256 _minIndividualContribution,
        uint256 _maxIndividualContribution,
        uint256 _minTotalContribution,
        uint256 _maxTotalContribution,
        uint256 _minFinalizeTimestamp,
        bool _onlyCreatorCanBuy,
        address _creator) public {
        
        var pool = new IcoPool(_saleAddress, _minIndividualContribution, _maxIndividualContribution, _minTotalContribution, _maxTotalContribution, _minFinalizeTimestamp, _onlyCreatorCanBuy, _creator);

        self.name = title;
        self.category = "icopool";
        self.keys.push("description");
        self.values["description"] = description;
        self.keys.push("icoEmail");
        self.values["icoEmail"] = icoEmail;
        self.keys.push("address");
        self.values["address"] = toAsciiString(pool);
    }

    function toAsciiString(address x) public pure returns (string) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            byte b = byte(uint8(uint(x) / (2 ** (8 * (19 - i)))));
            byte hi = byte(uint8(b) / 16);
            byte lo = byte(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    function char(byte b) public pure returns (byte c) {
        if (b < 10) return byte(uint8(b) + 0x30);
        else return byte(uint8(b) + 0x57);
    }

    function isParticipantLib(string poolAddress, address account) public view returns(bool)
    {
        var pool = IcoPool(parseAddr(poolAddress));
        return pool.getContribution(account) > 0;
    }

    function parseAddr(string _a) internal pure returns (address){
        bytes memory tmp = bytes(_a);
        uint160 iaddr = 0;
        uint160 b1;
        uint160 b2;
        for (uint i= 0; i < 0 + 2 * 20; i += 2){
            iaddr *= 256;
            b1 = uint160(tmp[i]);
            b2 = uint160(tmp[i + 1]);
            if ((b1 >= 97) && (b1 <= 102)) b1 -= 87;
            else if ((b1 >= 48) && (b1 <= 57)) b1 -= 48;
            if ((b2 >= 97) && (b2 <= 102)) b2 -= 87;
            else if ((b2 >= 48) && (b2 <= 57)) b2 -= 48;
            iaddr += (b1 * 16 + b2);
        }
        return address(iaddr);
    }
}
pragma solidity ^ 0.4.18;

import '../IcoPool/IcoPool.sol';
//import '../ERC721Token/strings.sol';

library CollectibleLibrary
{
    //using strings for *;

    event AuctionCreated(uint256 tokenId);

    struct CollectibleData {
        string name;
        string category;
        string tags;

        string[] keys;
        mapping(string => string) values;
    }

    function mintPublicToken(CollectibleData storage self, string name, string data) public returns(uint256){
        self.name = name;
        self.category = "public";
        self.keys.push("data");
        self.values["data"] = data;
    }
}
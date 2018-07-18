pragma solidity ^ 0.4.18;

import "./ERC721Token.sol";
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../IcoPool/IcoPoolLibrary.sol';
import './Auctions/AuctionManagerInterface.sol';

contract Collectible is ERC721Token, Ownable
{
    using IcoPoolLibrary for *;

        CollectibleLibrary.CollectibleData[] public tokens;
    AuctionManagerInterface public auctionManager;

    function Collectible(AuctionManagerInterface _auctionManager) public
    {
        auctionManager = _auctionManager;
    }

    /////////////// MINTING ////////////////////////////////////////////////////////////////////////////////////    

    function mintPublicToken(string name, string data) public returns(uint256) {
        super._mint(msg.sender, tokens.length);

        CollectibleLibrary.CollectibleData memory collectibleData;
        tokens.push(collectibleData);

        CollectibleLibrary.mintPublicToken(tokens[tokens.length - 1], name, data);

        return tokens.length - 1;
    }

    function mintIcoPool(
        string title,
        string description,
        string icoEmail,
        address _saleAddress,
        uint256 _minIndividualContribution,
        uint256 _maxIndividualContribution,
        uint256 _minTotalContribution,
        uint256 _maxTotalContribution,
        uint256 _minFinalizeTimestamp,
        bool _onlyCreatorCanBuy) public returns(uint256)
    {
        super._mint(msg.sender, tokens.length);

        CollectibleLibrary.CollectibleData memory collectibleData;
        tokens.push(collectibleData);

        IcoPoolLibrary.mintIcoPool(tokens[tokens.length - 1], title, description, icoEmail, _saleAddress, _minIndividualContribution, _maxIndividualContribution, _minTotalContribution, _maxTotalContribution, _minFinalizeTimestamp, _onlyCreatorCanBuy, msg.sender);

        return tokens.length - 1;
    }

    /////////////// LISTING ////////////////////////////////////////////////////////////////////////////////////    

    function getCollectibleCount() public view returns(uint256){
        return tokens.length;
    }


    function getCollectibleAttributeCount(uint256 tokenId) public view returns (uint256) {
        return tokens[tokenId].keys.length;
    }

    function getCollectibleAttribute(uint256 tokenId, uint256 attributeId) public view returns (string key, string value) {
        key = tokens[tokenId].keys[attributeId];
        value = tokens[tokenId].values[key];
    }

    /////////////// AUCTIONS ////////////////////////////////////////////////////////////////////////////////////    

    function auctionFixedPrice(uint256 tokenId, uint256 price) onlyOwnerOf(tokenId) public
    {
        var newFixedPriceAuction = auctionManager.auctionFixedPrice(tokenId, price);

        // transfer ownership from owner to the auction contract
        approve(address(newFixedPriceAuction), tokenId);
        transfer(address(newFixedPriceAuction), tokenId);
    }
}
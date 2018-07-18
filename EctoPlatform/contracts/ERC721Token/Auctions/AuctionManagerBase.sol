pragma solidity ^ 0.4.11;

contract AuctionManagerBase
{
    struct Auction 
    {
        address addr;
        uint256 tokenId;
        address owner;
        uint256 index;
    }

    mapping(uint256 => Auction) public auctions; // by token id
    uint256[] public indexes;

    function isAuction(uint256 tokenId) public constant returns(bool isIndeed)
    {
        if (indexes.length == 0) return false;
        return (indexes[auctions[tokenId].index] == tokenId);
    }

    function insertAuction(uint256 tokenId, address addr, address owner) public returns(uint256 index)
    {
        require(!isAuction(tokenId)); 

        auctions[tokenId].tokenId = tokenId;
        auctions[tokenId].addr = addr;
        auctions[tokenId].owner = owner;
        auctions[tokenId].index = indexes.push(tokenId) - 1;

        return indexes.length - 1;
    }

    function deleteAuction(uint256 tokenId) public returns(uint256 index)
    {
        require(isAuction(tokenId)); 

        uint256 rowToDelete = auctions[tokenId].index;
        uint256 keyToMove = indexes[indexes.length - 1];
        indexes[rowToDelete] = keyToMove;
        auctions[keyToMove].index = rowToDelete;
        indexes.length--;
        return rowToDelete;
    }

    function getAuction(uint256 tokenId) public constant returns(address)
    {
        //require(isAuction(tokenId));
        return auctions[tokenId].addr;
    } 

    function getInitialOwner(uint256 tokenId) public view returns(address)
    {
        require(isAuction(tokenId));
        return auctions[tokenId].owner;
    }

    function getAuctionsCount() public constant returns(uint256 count)
    {
        return indexes.length;
    }

    function getAuctionAtIndex(uint256 index) public constant returns(address)
    {
        return auctions[index].addr;
    }

    function getAuctionedTokens() public view returns(uint256[]){
        return indexes;
    }
}
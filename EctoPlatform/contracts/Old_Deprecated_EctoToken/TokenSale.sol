pragma solidity ^0.4.18;

// Based on
// ----------------------------------------------------------------------------
//  https://github.com/OpenSTFoundation/SimpleTokenSale/blob/master/contracts/TokenSale.sol
// ----------------------------------------------------------------------------

import "../Lib/SafeMath.sol";

import "./TokenSaleConfig.sol";

import "./EctoToken.sol";
import "./Trustee.sol";
import "./Roles.sol";
import "./Pausable.sol";

// * Lifecycle *
// Initialization sequence should be as follow:
//    1. Deploy EctoToken contract
//    2. Deploy Trustee contract
//    3. Deploy TokenSale contract
//    4. Set logisticsAddress of EctoToken contract to TokenSale contract
//    5. Set logisticsAddress of Trustee contract to TokenSale contract
//    6. Set logisticsAddress of TokenSale contract to some address
//    7. Transfer tokens from owner to TokenSale contract
//    8. Transfer tokens from owner to Trustee contract
//    9. Initialize TokenSale contract
//
// Pre-sale sequence:
//    - Set tokensPerKEther
//    - Add allocations for founders, advisors, etc.
//    - Update whitelist
//
// After-sale sequence:
//    1. Finalize the TokenSale contract
//    2. Finalize the EctoToken contract
//    3. Set logisticsAddress of TokenSale contract to 0
//    4. Set logisticsAddress of EctoToken contract to 0
//    5. Set logisticsAddress of Trustee contract to some address
//
// Anytime
//    - Add/Remove allocations
//
// Permisions
//      initialize                ( Owner - Yes, Admin - No,  Logistics - No  )
//      changeWallet              ( Owner - No,  Admin - Yes, Logistics - No  )
//      updateWhitelist           ( Owner - No,  Admin - No,  Logistics - Yes  )
//      setTokensPerKEther        ( Owner - No,  Admin - Yes, Logistics - No  )
//      pause / unpause           ( Owner - No,  Admin - Yes, Logistics - No  )
//      reclaimTokens             ( Owner - No,  Admin - Yes, Logistics - No  )
//      burnUnsoldTokens          ( Owner - No,  Admin - Yes, Logistics - No  )
//      finalize                  ( Owner - No,  Admin - Yes, Logistics - No  )
//


contract TokenSale is Roles, Pausable, TokenSaleConfig {  //Pausable is also Roles
    using SafeMath for uint256;

    // We keep track of whether the sale has been finalized, at which point
    // no additional contributions will be permitted.
    bool public finalized;

    // The sale end time is initially defined by the END_TIME constant but it
    // may get extended if the sale is paused.
    uint256 public endTime;
    uint256 public pausedTime;

    // Number of tokens per 1000 ETH. See TokenSaleConfig for details.
    uint256 public tokensPerKEther;
    
    // Address where the funds collected during the sale will be forwarded.
    address public wallet;

    // Token contract that the sale contract will interact with.
    EctoToken public tokenContract;

    // Trustee contract to hold on token balances. The following token pools will be held by trustee:
    //    - Founders
    //    - Advisors
    Trustee public trusteeContract;

    // Total amount of tokens sold during public sale
    uint256 public totalTokensSold;

    // Map of addresses that have been whitelisted in advance (and passed KYC).
    mapping(address => uint8) public whitelist;

    //
    // EVENTS
    //
    event Initialized();
    event WhitelistUpdated(address indexed _account);
    event WhitelistRemoved(address indexed _account);
    event TokensPurchased(address indexed _beneficiary, uint256 _cost, uint256 _tokens, uint256 _totalSold);
    event TokensPerKEtherUpdated(uint256 _amount);
    event WalletChanged(address _newWallet);
    event TokensReclaimed(uint256 _amount);
    event UnsoldTokensBurnt(uint256 _amount);
    event Finalized();

    // debug
    event Log(string val);
    event Log(uint256 val);
    event Log(address val);
    

    function TokenSale(EctoToken _tokenContract, Trustee _trusteeContract, address _wallet) public Roles() TokenSaleConfig() {
        require(isAddressable(address(_tokenContract)));
        require(isAddressable(address(_trusteeContract)));
        require(isAddressable(_wallet));
		
		require(WEEEK1_START_TIME >= currentTime());
		require(WEEEK2_START_TIME > WEEEK1_START_TIME);
        require(WEEEK3_START_TIME > WEEEK2_START_TIME);
        require(WEEEK4_START_TIME > WEEEK3_START_TIME);
        require(END_TIME > WEEEK4_START_TIME);

        require(TOKENS_PER_KETHER_WEEK1 > 0);
        require(TOKENS_PER_KETHER_WEEK2 > 0);
        require(TOKENS_PER_KETHER_WEEK3 > 0);
        require(TOKENS_PER_KETHER_WEEK4 > 0);

        // Basic check that the constants add up to TOKENS_MAX
        uint256 partialAllocations = TOKENS_FOUNDERS.add(TOKENS_ADVISORS);
        require(partialAllocations.add(TOKENS_SALE).add(TOKENS_COMPANY) == TOKENS_MAX);


        wallet = _wallet; // where funds will be send
        tokenContract = _tokenContract;
        trusteeContract = _trusteeContract;

        pausedTime = 0;
        endTime = END_TIME;
        finalized = false;
        tokensPerKEther = TOKENS_PER_KETHER_WEEK1;
    }

    function endsAt() public view returns(uint256) {
        return END_TIME;
    }
    

    // Initialize is called to check some configuration parameters.
    // It expects that a certain amount of tokens have already been assigned to the sale contract address.
    function initialize() external onlyOwner returns(bool) {
        require(totalTokensSold == 0);

        uint256 ownBalance = tokenContract.balanceOf(address(this));
        require(ownBalance == TOKENS_SALE);

        // Simple check to confirm that tokens are present
        uint256 trusteeBalance = tokenContract.balanceOf(address(trusteeContract));
        require(trusteeBalance >= TOKENS_COMPANY);

        Initialized();

        return true;
    }

    // Allows the admin to change the wallet where ETH contributions are sent.
    function changeWallet(address _wallet) external onlyAdmin returns (bool) {
        require(isAddressable(_wallet));
        require(_wallet != address(this));
        require(_wallet != address(trusteeContract));
        require(_wallet != address(tokenContract));

        wallet = _wallet;

        WalletChanged(wallet);

        return true;
    }

    function currentTime() public view returns (uint256 _currentTime) {
        return now;
    }

    modifier onlyBeforeSale() {
        require(hasSaleEnded() == false);
        require(currentTime() < WEEEK4_START_TIME);
       _;
    }
    function hasSaleEnded() private view returns (bool) {
        // if sold out or finalized, sale has ended
        if (totalTokensSold >= TOKENS_SALE || finalized) {
            return true;
        // else if sale is not paused (pausedTime = 0) 
        // and endtime has past, then sale has ended
        } else if (pausedTime == 0 && currentTime() >= endTime) {
            return true;
        // otherwise it is not past and not paused; or paused
        // and as such not ended
        } else {
            return false;
        }
    }

    modifier onlyDuringSale() {
        require(hasSaleEnded() == false && currentTime() >= WEEEK1_START_TIME);
        _;
    }

    modifier onlyAfterSale() {
        require(finalized);
        _;
    }

    //
    // WHITELIST
    //

    // Allows logistics to add accounts to the whitelist.
    // Only those accounts will be allowed to contribute during the sale.
    function updateWhitelist(address _account) external onlyLogistics returns (bool) {
        require(isAddressable(_account));
        require(!hasSaleEnded());

        whitelist[_account] = 1; // only 1 sell

        WhitelistUpdated(_account);

        return true;
    }

    function removeFromWhitelist(address _account) external onlyLogistics returns (bool) {
        require(isAddressable(_account));
        require(!hasSaleEnded());

        delete whitelist[_account];

        WhitelistRemoved(_account);

        return true;
    }

    //
    // PURCHASES / CONTRIBUTIONS
    //

    // Allows the admin to change the price for tokens sold every week
    function setTokensPerKEther(uint256 _value) external onlyAdmin {
        
        tokensPerKEther = _value;
        
        TokensPerKEtherUpdated(tokensPerKEther);
	}
    

    function () external payable whenNotPaused onlyDuringSale {
        buyTokens();
    }

    
	event log(string val);

    // This is the main function to process incoming ETH contributions.
    function buyTokens() public payable whenNotPaused onlyDuringSale returns (bool) {
        
		require(msg.value >= CONTRIBUTION_MIN);
        require(msg.value <= CONTRIBUTION_MAX);
		require(totalTokensSold < TOKENS_SALE);
		
		
		

        uint256 tokensMax = TOKENS_SALE.sub(totalTokensSold);
        require(tokensMax > 0);

        uint256 tokensBought = msg.value.mul(tokensPerKEther).div(PURCHASE_DIVIDER);
        require(tokensBought > 0);

        uint256 cost = msg.value;
        uint256 refund = 0;
		
		if (tokensBought > tokensMax) {
            // Not enough tokens available for full contribution, we will do partial.
            tokensBought = tokensMax;

            // Calculate actual cost for partial amount of tokens.
            cost = tokensBought.mul(PURCHASE_DIVIDER).div(tokensPerKEther);

            // Calculate refund for contributor.
            refund = msg.value.sub(cost);
        }

        totalTokensSold = totalTokensSold.add(tokensBought);

        // Transfer tokens to the account
        require(tokenContract.transfer(msg.sender, tokensBought));
		

        // Issue a ETH refund for any unused portion of the funds.
        if (refund > 0) {
            msg.sender.transfer(refund);
        }

		// Transfer the contribution to the wallet
        wallet.transfer(msg.value.sub(refund));

		TokensPurchased(msg.sender, cost, tokensBought, totalTokensSold);

        // If all tokens available for sale have been sold out, finalize the sale automatically.
        if (totalTokensSold == TOKENS_SALE) {
            finalizeInternal();
        }

        return true;
    }


    //
    // PAUSE / UNPAUSE
    //

    // Allows the owner or admin to pause the sale for any reason.
    function pause() public onlyAdmin whenNotPaused {
        require(hasSaleEnded() == false);

        pausedTime = currentTime();

        return super.pause();
    }

    // Unpause may extend the end time of the public sale.
    function unpause() public onlyAdmin whenPaused {

        // If owner unpauses before sale starts, no impact on end time.
        uint256 current = currentTime();

        // If owner unpauses after sale starts, calculate how to extend end.
        if (current > WEEEK1_START_TIME) {
            uint256 timeDelta;

            timeDelta = current.sub(pausedTime);

            endTime = endTime.add(timeDelta);
        }

        pausedTime = 0;

        return super.unpause();
    }


    // // Allows the admin to move bonus tokens still available in the sale contract
    // // out before burning all remaining unsold tokens in burnUnsoldTokens().
    // // Used to distribute bonuses to token sale participants when the sale has ended
    // // and all bonuses are known.
    // function reclaimTokens(uint256 _amount) external onlyAfterSale onlyAdmin returns (bool) {
    //     uint256 ownBalance = tokenContract.balanceOf(address(this));
    //     require(_amount <= ownBalance);
        
    //     address tokenOwner = tokenContract.owner();
    //     require(tokenOwner != address(0));

    //     require(tokenContract.transfer(tokenOwner, _amount));

    //     TokensReclaimed(_amount);

    //     return true;
    // }

    // Allows the admin to burn all unsold tokens in the sale contract.
    function burnUnsoldTokens() external onlyAfterSale onlyAdmin returns (bool) {
        uint256 ownBalance = tokenContract.balanceOf(address(this));

        require(tokenContract.burn(ownBalance));

        UnsoldTokensBurnt(ownBalance);

        return true;
    }


    // Allows the admin to finalize the sale and complete allocations.
    // The EctoToken.admin also needs to finalize the token contract
    // so that token transfers are enabled.
    function finalize() external onlyAdmin returns (bool) {
        return finalizeInternal();
    }

    // The internal one will be called if tokens are sold out or
    // the end time for the sale is reached, in addition to being called
    // from the public version of finalize().
    function finalizeInternal() private returns (bool) {
        require(!finalized);

        finalized = true;

        Finalized();

        return true;
    }


    // sale info
    function getTotalTokenSold() public view returns (uint256) {
            return totalTokensSold;
    }
}
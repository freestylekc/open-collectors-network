pragma solidity ^0.4.11;

contract EthManager
{
    // debug events
    event Joined(uint256 amount);
    event Left();

    // pool limits
    uint256 public minIndividualContribution;
    uint256 public maxIndividualContribution;
    uint256 public minTotalContribution;
    uint256 public maxTotalContribution;
    uint256 public minFinalizeTimestamp;

    // participants & amounts in ETH
    uint256 public totalContribution;
    address[] public participants;
    mapping(address => uint256) contributions;

    // has the ETH been sent to the sale yet? 
    bool public isClosed; 

    function EthManager(
        uint256 _minIndividualContribution,
        uint256 _maxIndividualContribution,
        uint256 _minTotalContribution,
        uint256 _maxTotalContribution,
        uint256 _minFinalizeTimestamp) public
    {
        minIndividualContribution = _minIndividualContribution;
        maxIndividualContribution = _maxIndividualContribution;
        minTotalContribution = _minTotalContribution;
        maxTotalContribution = _maxTotalContribution;
        minFinalizeTimestamp = _minFinalizeTimestamp;
    }

    /**
     * Joins msg.sender to the pool, remembering his contribution. Can't join multiple times, must unjoin and join again.
     */
    function join() public payable
    {
        require(!isClosed);
        require(msg.value > 0 && msg.value >= minIndividualContribution);
        require(maxIndividualContribution == 0 || msg.value <= maxIndividualContribution);
        require(maxTotalContribution == 0 || totalContribution + msg.value <= maxTotalContribution);
        require(contributions[msg.sender] == 0);

        participants.push(msg.sender);
        contributions[msg.sender] = msg.value;
        totalContribution += msg.value;

        Joined(msg.value);
    }

    /**
     * Leave msg.sender from pool, returns his ETH and marks him with 0 contribution. He remains in the participants array, but with 0 contribution.
     */
    function leave() public 
    {
        require(!isClosed);

        var contribution = contributions[msg.sender];

        require(contribution > 0);

        contributions[msg.sender] = 0;
        totalContribution -= contribution;

        msg.sender.transfer(contribution);

        Left();
    }

    /**
     * Get the contribution, in ETH, for a particular participant. Returns 0 for bad addreses.
     * @param participant Participant's ethereum address.
     */
    function getContribution(address participant) public view returns(uint256)
    {
        return contributions[participant];
    }

    /**
     * Gets the participants array length.
     */
    function getParticipantCount() public view returns(uint256)
    {
        return participants.length;
    }

    /**
     * The fallback function just joins the msg.sender to the pool.
     */
    function() public payable 
    {
        join();
    }
}
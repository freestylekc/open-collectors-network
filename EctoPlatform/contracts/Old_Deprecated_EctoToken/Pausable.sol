pragma solidity ^0.4.18;

// Based on
// ----------------------------------------------------------------------------
//  https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/lifecycle/Pausable.sol
// ----------------------------------------------------------------------------


import "./Roles.sol";


contract Pausable is Roles {

  event Pause();
  event Unpause();

  bool public paused = false;


  modifier whenNotPaused() {
    require(!paused);
    _;
  }


  modifier whenPaused() {
    require(paused);
    _;
  }

  // only Admin can pause 
  function pause() public onlyAdmin whenNotPaused {
    paused = true;

    Pause();
  }


  // only Admin can unpause 
  function unpause() public onlyAdmin whenPaused {
    paused = false;

    Unpause();
  }
}
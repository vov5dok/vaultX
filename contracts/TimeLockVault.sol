// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TimeLockVault {
    struct LockedBalance {
        uint256 amount;
        uint256 unlockTime;
    }

    mapping(address => mapping(address => LockedBalance[])) public timelocks;

    event Deposited(address indexed user, address indexed token, uint256 amount, uint256 unlockTime);
    event Withdrawn(address indexed user, address indexed token, uint256 amount);

    function deposit(address token, uint256 amount, uint256 lockDuration) external {
        require(amount > 0, "Amount must be > 0");
        require(lockDuration > 0, "Lock duration must be > 0");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");

        timelocks[msg.sender][token].push(LockedBalance({
            amount: amount,
            unlockTime: block.timestamp + lockDuration
        }));

        emit Deposited(msg.sender, token, amount, block.timestamp + lockDuration);
    }

    function withdraw(address token) external {
        LockedBalance[] storage locks = timelocks[msg.sender][token];
        uint256 totalUnlocked = 0;

        uint256 i = 0;
        while (i < locks.length) {
            if (locks[i].unlockTime <= block.timestamp) {
                totalUnlocked += locks[i].amount;
                locks[i] = locks[locks.length - 1];
                locks.pop();
            } else {
                i++;
            }
        }

        require(totalUnlocked > 0, "No unlocked tokens available");
        require(IERC20(token).transfer(msg.sender, totalUnlocked), "Transfer failed");

        emit Withdrawn(msg.sender, token, totalUnlocked);
    }

    function getLocks(address user, address token) external view returns (LockedBalance[] memory) {
        return timelocks[user][token];
    }
}

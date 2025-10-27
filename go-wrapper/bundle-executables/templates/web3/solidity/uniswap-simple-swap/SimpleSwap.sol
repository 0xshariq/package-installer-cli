// https://uniswap.org/blog/your-first-uniswap-integration

// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.9;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract SimpleSwap {
    ISwapRouter public immutable swapRouter; // Uniswap V3 Swap Router
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F; // DAI token address
    address public constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; // WETH token address
    uint24 public constant feeTier = 3000; // Pool fee tier of 0.3%

    // The contract constructor sets the Uniswap V3 SwapRouter address.
    constructor(ISwapRouter _swapRouter) {
        swapRouter = _swapRouter;
    }

    /// @notice Swaps a fixed amount of WETH9 for a maximum possible amount of DAI
    /// @param amountIn The exact amount of WETH9 that will be swapped for DAI.
    /// @return amountOut The amount of DAI received after the swap.

    // For this example, the caller must approve this contract to spend at least `amountIn` worth of its WETH9 for this function to succeed.
    function swapWETHForDAI(uint256 amountIn) external returns (uint256 amountOut) {
        // Transfer the specified amount of WETH9 to this contract.
        TransferHelper.safeTransferFrom(WETH9, msg.sender, address(this), amountIn);
        // Approve the router to spend WETH9.
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountIn);
        // Create the params that will be used to execute the swap
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: WETH9,
            tokenOut: DAI,
            fee: feeTier,
            recipient: msg.sender,
            deadline: block.timestamp,
            amountIn: amountIn,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        });
        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
        return amountOut;
    }
}
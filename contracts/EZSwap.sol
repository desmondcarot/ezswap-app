// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./KFCToken.sol";

contract EZSwap{
    string public name = "EZSwap";
    address public owner;
    address public tokenAddress;
    IERC20 public immutable token0;

    mapping(address => uint) balanceOf;
    
    modifier onlyBy(address _owner) {
      require(msg.sender == _owner);
      _;
    }
    
    event TokensPurchased(
        address account,
        address token,
        uint amount
    );
    
    event TokensSold(
        address account,
        address token,
        uint amount
    );
    
    // Initiate this contract with KFCToken address and set msg.sender as this contract owner
    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        owner = msg.sender;
        tokenAddress = _token;
        token0 = IERC20(_token);
    }

    // Only contract owner can add liquidity in this case
    // KFCToken side need to approve this contract to transfer token into here as liquidity
    // Need to transfer ETH into this contract simultaneously
    function addLiquidity(uint256 _tokenAmount) public payable onlyBy(owner){
        require(_tokenAmount > 0, "Token default liquidity amount cannot be 0.");
        token0.transferFrom(msg.sender, address(this), _tokenAmount);
    }

    // Get this contract's Token reserve 
    function getReserve() public view returns (uint256) {
        return token0.balanceOf(address(this));
    }

    /////////////////////////////////XYK Formula///////////////////////////////////////
    // x = ETH, y = KFCToken
    // XYK formula: In order to exchange y with x, it is (x + dx)(y - dy) = k 
     /*
        xy = k
        (x + dx)(y - dy) = k
        y - dy = k / (x + dx)
        y - k / (x + dx) = dy
        y - xy / (x + dx) = dy
        (yx + ydx - xy) / (x + dx) = dy
        dy = (y * dx) / (x + dx) becoming this --> amountOut = (reserveOut * amountIn) / (reserveIn + amountIn);   
    */
    // To maintain constant k, we know how many dy amount need to minus from the pools but dont know how many x need to bank in
    // if want to get dy amount of y, then check how many x amount user need to bank in, vise versa
    function calculateAmount(uint256 input, uint256 reserveIn, uint256 reserveOut) private pure returns (uint256) {
        require(reserveIn > 0 && reserveOut > 0, "Invalid liquidity reserves");
        return (input * reserveOut) / (reserveIn + input);
    }

    /////////////////////////////////ETH -> KFCToken///////////////////////////////////
    function getTokenAmount(uint256 _ethAmountSold) public view returns (uint256) {
        require(_ethAmountSold > 0, "Please make sure ETH input is > 0");
        uint256 tokenReserve = getReserve();
        require(tokenReserve > 0, "Invalid liquidity reserves");
        return calculateAmount(_ethAmountSold, address(this).balance, tokenReserve);
    }

    // Use ETH to buy KFCToken, if 1 ETH input then pass in like: ethToTokenSwap(1)
    function ethToTokenSwap(uint256 _minTokens) public payable {
        uint256 tokenReserve = getReserve();
        require(tokenReserve > 0, "Invalid liquidity reserves");

        uint256 tokensBought =calculateAmount(msg.value, address(this).balance - msg.value, tokenReserve);
        require(tokensBought >= _minTokens, "Insufficient token reserves");

        token0.transfer(msg.sender, tokensBought);

        emit TokensPurchased(msg.sender, address(token0), tokensBought);
    }

    /////////////////////////////////KFCToken -> ETH///////////////////////////////////
    function getEthAmount(uint256 _tokenAmountSold) public view returns (uint256) {
        require(_tokenAmountSold > 0, "Please make sure Token input is > 0");
        uint256 tokenReserve = getReserve();
        require(tokenReserve > 0, "Invalid liquidity reserves");
        return calculateAmount(_tokenAmountSold, tokenReserve, address(this).balance);
    }

    // Sell KFCToken to get ETH
    function tokenToEthSwap(uint256 _tokensWannaSold) public {
        // User can't sell more tokens than they have
        require(token0.balanceOf(msg.sender) >= _tokensWannaSold);
        uint256 tokenReserve = getReserve();
        require(tokenReserve > 0, "Invalid liquidity reserves");

        uint256 ethBought = calculateAmount(_tokensWannaSold, tokenReserve, address(this).balance);

        token0.transferFrom(msg.sender, address(this), _tokensWannaSold);
        payable(msg.sender).transfer(ethBought);

        emit TokensSold(msg.sender, address(token0), ethBought);
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint);

    function balanceOf(address account) external view returns (uint);

    function transfer(address recipient, uint amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint amount);
    event Approval(address indexed owner, address indexed spender, uint amount);
}
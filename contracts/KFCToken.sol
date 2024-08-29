// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract KFCToken{

    string public constant name = "KFCCoin";
    string public constant symbol = "KFC";
    uint8 public constant decimals = 18;

    event Approval(
        address indexed tokenOwner, 
        address indexed spender, 
        uint tokens
    );

    event Transfer(
        address indexed from, 
        address indexed to, 
        uint tokens
    );

    mapping(address => uint256) public balances;

    mapping(address => mapping (address => uint256)) public allowed;

    uint256 totalSupply_;

    using SafeMath for uint256;
    
    constructor() {
        totalSupply_ = 10001 * 10**uint(decimals); //10001 tokens
        //totalSupply_ = 2000; // For testing, we can set 2000 for better understanding
        balances[msg.sender] = totalSupply_;
    }

    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    function balanceOf(address tokenOwner) public view returns (uint256) {
        return balances[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens) public returns (bool) {
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender].sub(numTokens);
        balances[receiver] = balances[receiver].add(numTokens);
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function approve(address spender, uint256 numTokens) public returns (bool) {
        allowed[msg.sender][spender] = numTokens;
        emit Approval(msg.sender, spender, numTokens);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint) {
        return allowed[owner][spender];
    }

    function transferFrom(address owner, address buyer, uint256 numTokens) public returns (bool) {
        require(numTokens <= balances[owner]);
        require(numTokens <= allowed[owner][msg.sender]);

        balances[owner] = balances[owner].sub(numTokens);
        allowed[owner][msg.sender] = allowed[owner][msg.sender].sub(numTokens);
        balances[buyer] = balances[buyer].add(numTokens);
        emit Transfer(owner, buyer, numTokens);
        return true;
    }
}

library SafeMath {
    function add(uint256 x, uint256 y) internal pure returns (uint256 k) {
        require((k = x + y) >= x, 'error:_Math_add_overflow');
    }

    function sub(uint256 x, uint256 y) internal pure returns (uint256 k) {
        require((k = x - y) <= x, 'error:_Math_sub_overflow');
    }

    function mul(uint256 x, uint256 y) internal pure returns (uint256 k) {
        require(y == 0 || (k = x * y) / y == x, 'error:_Math_mul_overflow');
    }
}


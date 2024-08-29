const KFCToken = artifacts.require("KFCToken");
const EZSwap = artifacts.require("EZSwap");

module.exports = async function(deployer) {
  // Deploy KFCToken
  await deployer.deploy(KFCToken);
  const KFCtoken = await KFCToken.deployed()

  // Deploy EZSwap
  await deployer.deploy(EZSwap, KFCtoken.address);
  const EZswap = await EZSwap.deployed()

  // Approve and add liquidity all tokens to EZSwap 
  await KFCtoken.approve(EZswap.address, '1000000000000000000000' );
  await EZswap.addLiquidity('1000000000000000000000', { value: '90000000000000000000' });
};

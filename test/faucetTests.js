const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect,assert } = require('chai');
const { ethers } = require('hardhat');

describe('Faucet', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory('Faucet');
    const faucet = await Faucet.deploy();

    const [owner,other] = await ethers.getSigners();
  
    let withdrawAmount = ethers.parseUnits('1', 'ether');
    console.log("withdraw amt is ",withdrawAmount);
    console.log("faucet add ",faucet.runner.address);
    return { faucet, owner, withdrawAmount,other };
  }

  it('should deploy and set the owner correctly', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it('should not allow withdrawals above .1 ETH at a time', async function () {
    const { faucet, withdrawAmount } = await loadFixture(
      deployContractAndSetVariables
    );
    await expect(faucet.withdraw(withdrawAmount)).to.be.reverted;
  });

  
 it('should check if only owner can call them', async function () {
  const { faucet,owner,other } = await loadFixture(deployContractAndSetVariables);

  await expect(faucet.connect(other).withdrawAll()).to.be.revertedWith("Not Owner");
});

it("Should succeed WithdrawAll ", async function () {
  const { faucet, owner } = await loadFixture(deployContractAndSetVariables);
  const prevBalance = await ethers.provider.getBalance(owner.address);
  console.log("prev bal ",prevBalance);
  
  await faucet.withdrawAll();
  
  const currentBalance = await ethers.provider.getBalance(owner.address)
  const faucetBalance = await ethers.provider.getBalance(faucet.runner.address)

  console.log("curr and faucet ",currentBalance,faucetBalance);

  expect(faucetBalance).to.equal(0);
  
  // describe("WithdrawAll", function(){
  //   it("should transfer the balance from the contract to the owner", async function () {
  //     expect(prevBalance).to.be.lt(currentBalance);
  // })
  // })
  

});










it("Should destroy Faucet ", async function () {
  const {faucet} = await loadFixture(deployContractAndSetVariables);

  
  //console.log("faucet add ",faucet.runner.address);
  
  await faucet.destroyFaucet();

expect (await ethers.provider.getCode(faucet.runner.address)).to.be.equal("0x");


});

  



});
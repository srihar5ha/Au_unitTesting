const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect, assert } = require('chai');
const { ethers } = require("hardhat");

describe('Faucet', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory('Faucet');
    const faucet = await Faucet.deploy();

    const [owner, signer2, signer3] = await ethers.getSigners();

    //To Add Ethers To The Faucet, since having 0 Balance would make the test for withdrawals fail everytime
    await signer2.sendTransaction({to: faucet.address, value: ethers.utils.parseEther("1")});
    
    console.log('owner address: ', owner.address);
    return { faucet, owner, signer2, signer3 };
  }

  it('should deploy and set the owner correctly', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it("Should fail when Withdraw amount is greater than 0.1 ETH", async function () {
      const { faucet } = await loadFixture(deployContractAndSetVariables);
      await expect(faucet.withdraw(ethers.utils.parseEther("0.2"))).to.be.revertedWith("Withdraw Amount Limit Exceeded")
  });

  it("Should succeed when Withdraw amount is less than or equal to 0.1 ETH", async function () {
    const { faucet, signer3 } = await loadFixture(deployContractAndSetVariables);
    const prevBalance = await signer3.getBalance()
    
    await faucet.connect(signer3).withdraw(ethers.utils.parseEther("0.01"));

    const currentBalance = await signer3.getBalance()
    expect(currentBalance).to.be.greaterThan(prevBalance)  
  });

  it("Should fail WithdrawAll since withdrawer is not the owner", async function () {
    const { faucet, signer3 } = await loadFixture(deployContractAndSetVariables);
    
    await expect(faucet.connect(signer3).withdrawAll()).to.be.revertedWith("Not Authorized");
 
  });

  it("Should succeed WithdrawAll since msg.sender is the owner", async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);
    const prevBalance = await ethers.provider.getBalance(owner.address)

    await faucet.withdrawAll()
    
    const currentBalance = await ethers.provider.getBalance(owner.address)
    const faucetBalance = await ethers.provider.getBalance(faucet.address)

    expect(faucetBalance).to.equal(0);
    
    describe("WithdrawAll", function(){
      it("should transfer the balance from the contract to the owner", async function () {
        expect(prevBalance).to.be.lt(currentBalance);
    })
    })
    
 
  });

  it("Should destroy Faucet since msg.sender is the owner", async function () {
    const { faucet } = await loadFixture(deployContractAndSetVariables);

    await faucet.destroyFaucet()
    
    expect(await ethers.provider.getCode(faucet.address)).to.be.equal("0x");
 
  });

  it("Should not destroy Faucet since msg.sender is not the owner", async function () {
    const { faucet, signer3 } = await loadFixture(deployContractAndSetVariables);

    
    
    await expect(faucet.connect(signer3).destroyFaucet()).to.be.revertedWith("Not Authorized");
 
  });

});
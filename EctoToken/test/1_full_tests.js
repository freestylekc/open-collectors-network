import ether from './helpers/ether';
import
{
    advanceBlock
}
from './helpers/advanceToBlock';
import
{
    increaseTimeTo,
    duration
}
from './helpers/increaseTime';
import
{
    latestTime,
    timeConverter
}
from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';

const BigNumber = web3.BigNumber;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

const EctoCrowdsale = artifacts.require('EctoCrowdsale');
const EctoToken = artifacts.require('EctoToken');

contract('EctoCrowdsale', function([owner, wallet, investor, otherInvestor, unknownInvestor, unused6, unused7, unused8, unused9,
    founder1, founder2
])
{
    before(async function()
    {
        this.token = await EctoToken.deployed();
        this.crowdsale = await EctoCrowdsale.deployed();
    });

    it('should create crowdsale with correct parameters', async function()
    {
        this.crowdsale.should.exist;
        this.token.should.exist;

        const rate = await this.crowdsale.rate();
        const walletAddress = await this.crowdsale.wallet();
        const cap = await this.crowdsale.cap();
        const tokenAddress = await this.crowdsale.token();

        rate.should.be.bignumber.equal(global.BASE_RATE);
        walletAddress.should.be.equal(global.WALLET);
        cap.should.be.bignumber.equal(global.CAP);
        tokenAddress.should.be.equal(this.token.address);
    });

    it('should not allow anyone to unpause token or sale, except onwer', async function()
    {
        await this.crowdsale.unpause(
        {
            from: unknownInvestor
        }).should.be.rejectedWith(EVMRevert);
        await this.token.unpause(
        {
            from: unknownInvestor
        }).should.be.rejectedWith(EVMRevert);
    });

    it('should whitelist the first two investors', async function()
    {
        await this.crowdsale.addAddressToWhitelist(investor,
        {
            from: owner
        });
        await this.crowdsale.addAddressToWhitelist(otherInvestor,
        {
            from: owner
        });
    });

    it('should not accept payments before start', async function()
    {
        await this.crowdsale.send(ether(1)).should.be.rejectedWith(EVMRevert);
        await this.crowdsale.buyTokens(investor,
        {
            from: investor,
            value: ether(1)
        }).should.be.rejectedWith(EVMRevert);
    });

    it('should accept payments during the sale', async function()
    {
        const investmentAmount = ether(0.99);
        const expectedTokenAmount = global.getRate(investmentAmount).mul(investmentAmount);
        console.log("Rate", global.getRate(investmentAmount).toNumber().toLocaleString());

        await this.crowdsale.unpause(
        {
            from: owner
        });
        console.log("Sale resumed.");

        await this.crowdsale.buyTokens(investor,
        {
            value: investmentAmount,
            from: investor
        }).should.be.fulfilled;
        (await this.token.balanceOf(investor)).should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should not allow token transfers until sale ends', async function()
    {
        await this.token.transfer(unknownInvestor, 1,
        {
            from: investor
        }).should.be.rejectedWith(EVMRevert);
    });

    it('should give bonus tokens for amounts over bonus thresholds', async function()
    {
        const investmentAmount = ether(3);
        const expectedTokenAmount = global.getRate(investmentAmount).mul(investmentAmount);
        console.log("RATE", global.getRate(investmentAmount).toNumber().toLocaleString());

        await this.crowdsale.buyTokens(otherInvestor,
        {
            value: investmentAmount,
            from: otherInvestor
        }).should.be.fulfilled;
        (await this.token.balanceOf(otherInvestor)).should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should reject payments over cap', async function()
    {
        console.log("Wallet balance", web3.fromWei(web3.eth.getBalance(global.WALLET)).toNumber().toLocaleString());
        await this.crowdsale.send(global.CAP).should.be.rejectedWith(EVMRevert);;
    });

    it('should only allow whitelisted users to participate', async function()
    {
        const investmentAmount = ether(1);
        const expectedTokenAmount = global.getRate(investmentAmount).mul(investmentAmount);

        await this.crowdsale.buyTokens(unknownInvestor,
        {
            value: ether(1),
            from: unknownInvestor
        }).should.be.rejectedWith(EVMRevert);
    });

    it('should only allow owner to set bonuses', async function()
    {
        var bonuses = global.bonuses.map(function(val)
        {
            return val.threshold;
        });
        var thresholds = global.bonuses.map(function(val)
        {
            return val.bonus;
        });

        await this.crowdsale.setBonusThresholds(bonuses, thresholds,
        {
            from: owner
        }).should.be.fulfilled;
        await this.crowdsale.setBonusThresholds(bonuses, thresholds,
        {
            from: unknownInvestor
        }).should.be.rejectedWith(EVMRevert);
    });

    it('should double bonuses and check rates again', async function()
    {
        // print current bonuses
        console.log("Bonuses:");
        var bonusCount = await this.crowdsale.getBonusCount();
        for (var i = 0; i < bonusCount; i++)
        {
            console.log("   " + (await this.crowdsale.bonuses.call(i)) + " % for " + web3.fromWei(await this.crowdsale.thresholds.call(i)).toNumber().toLocaleString());
        }

        // double bonuses
        global.bonuses = global.bonuses.map(function(val)
        {
            val.bonus = val.bonus * 2;
            return val;
        });

        var bonuses = global.bonuses.map(function(val)
        {
            return val.threshold;
        });
        var thresholds = global.bonuses.map(function(val)
        {
            return val.bonus;
        });

        console.log("\nDoubling new bonuses...\n");
        await this.crowdsale.setBonusThresholds(bonuses, thresholds,
        {
            from: owner
        }).should.be.fulfilled;

        // print current bonuses
        console.log("Bonuses:");
        var bonusCount = await this.crowdsale.getBonusCount();
        for (var i = 0; i < bonusCount; i++)
        {
            console.log("   " + (await this.crowdsale.bonuses.call(i)) + " % for " + web3.fromWei(await this.crowdsale.thresholds.call(i)).toNumber().toLocaleString());
        }

        const investmentAmount = ether(3);
        const expectedTokenAmount = (await this.token.balanceOf(otherInvestor)).plus(global.getRate(investmentAmount).mul(investmentAmount));
        console.log("RATE", global.getRate(investmentAmount).toNumber().toLocaleString());

        await this.crowdsale.buyTokens(otherInvestor,
        {
            value: investmentAmount,
            from: otherInvestor
        }).should.be.fulfilled;
        (await this.token.balanceOf(otherInvestor)).should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should only allow the owner to whitelist an investor', async function()
    {
        // Check out the Ownable.sol contract to see if there is a modifier that could help here
        await this.crowdsale.addAddressToWhitelist(unknownInvestor,
        {
            from: unknownInvestor
        }).should.be.rejectedWith(EVMRevert);
    })

    it('should allow transfers after unpausing token', async function()
    {
        await this.token.unpause();
        await this.token.transfer(unknownInvestor, 1,
        {
            from: investor
        }).should.be.fulfilled;
    });

    it('should check reserved tokens (founder, company, advisers etc)', async function()
    {
        web3.fromWei((await this.token.balanceOf(owner))).should.be.bignumber.equal(web3.fromWei(await this.token.totalSupply()) * global.extraTokensPercentage / 100);
    });

    it('should check token balances after sale is destroyed', async function()
    {
        // finalizing sale
        await this.crowdsale.destroy([this.token.address]);
        console.log("Sale has been destroyed...");

        const totalSupply = web3.fromWei((await this.token.totalSupply())).toNumber()
        const ownerBalance = web3.fromWei((await this.token.balanceOf(owner))).toNumber()
        const saleBalance = web3.fromWei((await this.token.balanceOf(this.crowdsale.address))).toNumber()
        const investorBalance = web3.fromWei((await this.token.balanceOf(investor))).toNumber()
        const otherInvestorBalance = web3.fromWei((await this.token.balanceOf(otherInvestor))).toNumber()

        console.log("Token total supply", totalSupply.toLocaleString());
        console.log("Owner balance", ownerBalance.toLocaleString());
        console.log("Sale balance", saleBalance.toLocaleString());
        console.log("Investor balance", investorBalance.toLocaleString());
        console.log("Other investor balance", otherInvestorBalance.toLocaleString());

        saleBalance.should.be.bignumber.equal(0);

        assert.equal(totalSupply, ownerBalance + saleBalance + investorBalance + otherInvestorBalance);
    });
});
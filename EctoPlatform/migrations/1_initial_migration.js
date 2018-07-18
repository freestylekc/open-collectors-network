var Migrations = artifacts.require("./Migrations.sol");

module.exports = function (deployer, network, accounts) 
{
    deployer.then(async () =>
    {
        return deployer.deploy(Migrations);
    });
};


const DBNFT = artifacts.require("DBNFT");

module.exports = function (deployer) {
    deployer.deploy(DBNFT, "DBNFT", "DB");
};
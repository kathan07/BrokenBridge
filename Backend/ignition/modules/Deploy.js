const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BridgeModule", (m) => {

  const bridge = m.contract("Bridge");

  return { bridge };
});

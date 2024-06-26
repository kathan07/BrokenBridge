const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("brokenmodule", (m) => {

  const bridge = m.contract("BrokenBridge");

  return { bridge };
});

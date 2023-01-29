// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.5.0 <0.9.0;

interface IWhitelist {
    function whitelistedAddresses(address) external view returns (bool);
}

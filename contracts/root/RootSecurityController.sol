pragma solidity ^0.8.4;

import "./Root.sol";
import "../registry/ENS.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RootSecurityController is Ownable {
    bytes32 private constant ROOT_NODE = bytes32(0);
    bytes4 private constant INTERFACE_META_ID =
        bytes4(keccak256("supportsInterface(bytes4)"));

    Root public root;
    ENS public ens;

    constructor(Root _root) {
        root = _root;
        ens = _root.ens();
    }

    function disableTLD(bytes32 label) external onlyOwner {
        root.setSubnodeOwner(label, address(this));
        ens.setResolver(keccak256(abi.encodePacked(ROOT_NODE, label)), address(0));
    }

    function supportsInterface(
        bytes4 interfaceID
    ) external pure returns (bool) {
        return interfaceID == INTERFACE_META_ID;
    }
}

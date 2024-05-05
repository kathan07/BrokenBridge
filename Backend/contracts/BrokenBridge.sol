// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

//imports
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

contract BrokenBridge is OwnerIsCreator {

    //variable declarations 
    using SafeERC20 for IERC20;
    IRouterClient private s_router;
    IERC20 private s_linkToken;
    uint64 constant _destinationChainSelector = 13264668187771770619;// destinationChainSelector
    address constant _token = 0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05;//tokenid
    address constant _link = 0x779877A7B0D9E8603169DdbD7836e478b4624789;//linktokenid
    address constant _router = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59;//routerid

    //error declarations
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);
    error NothingToWithdraw();
    error FailedToWithdrawEth(address owner, address target, uint256 value);
    error DestinationChainNotAllowlisted(uint64 destinationChainSelector);
    error InvalidReceiverAddress();

    //constrouctor
    constructor() {
        s_router = IRouterClient(_router);
        s_linkToken = IERC20(_link);
    }

    //Token tranfer event
    event TokensTransferred(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        address token,
        uint256 tokenAmount,
        address feeToken,
        uint256 fees
    );

    //modifier to validate the receiver input
    modifier validateReceiver(address _receiver) {
        if (_receiver == address(0)) revert InvalidReceiverAddress();
        _;
    }


    //function to build CCIP message
    function _buildCCIPMessage(
        address _receiver,
        uint256 _amount,
        address _feeTokenAddress
    ) private pure returns (Client.EVM2AnyMessage memory) {
        // Set the token amounts
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: _token,
            amount: _amount
        });

        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver), // ABI-encoded receiver address
                data: "",
                tokenAmounts: tokenAmounts, // The amount and type of token being transferred
                extraArgs: Client._argsToBytes(
                    // Additional arguments, setting gas limit to 0 as we are not sending any data
                    Client.EVMExtraArgsV1({gasLimit: 0})
                ),
                feeToken: _feeTokenAddress
            });
    }

    //function to get the fees required to send tokens accross chain
    function getFees(
        address _receiver,
        uint256 _amount
    ) external view returns (uint256) {
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _amount,
            address(s_linkToken)
        );

        // Get the fee required to send the message
        uint256 fees = s_router.getFee(
            _destinationChainSelector,
            evm2AnyMessage
        );
        return fees;
    }

  
    // function to get CCIP token balance of contract
    function getBalanceToken() public view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    // function to get LINK token balance of contract
    function getBalanceLink() public view returns (uint256) {
        return IERC20(_link).balanceOf(address(this));
    }

    function transfer(
        address _receiver,
        uint256 _amount
    ) external validateReceiver(_receiver) returns (bytes32 messageId) {
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _amount,
            address(s_linkToken)
        );
        uint256 fees = s_router.getFee(
            _destinationChainSelector,
            evm2AnyMessage
        );

        if (fees > s_linkToken.balanceOf(address(this))){
            revert NotEnoughBalance(s_linkToken.balanceOf(address(this)), fees);
        }

        s_linkToken.approve(address(s_router), fees);
        IERC20(_token).approve(address(s_router), _amount);


        messageId = s_router.ccipSend(
            _destinationChainSelector,
            evm2AnyMessage
        );

        emit TokensTransferred(
            messageId,
            _destinationChainSelector,
            _receiver,
            _token,
            _amount,
            address(s_linkToken),
            fees
        );

        return messageId;
    }

    //Fallback function to allow the contract to receive tokens.
    receive() external payable {}
}

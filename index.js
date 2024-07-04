const { recoverAttestation } = require('@graphprotocol/common-ts');
const contractsAddresses = require("@graphprotocol/contracts/addresses.json");
const abi = require('@graphprotocol/contracts/dist/abis/L2Staking.json');
const ethers = require('ethers');
const process = require('process');
const { exec } = require('child_process');

const AddressZero = '0x0000000000000000000000000000000000000000'

const chainId = 42161 // Arbitrum ChainID
const provider = ethers.getDefaultProvider(chainId);

const contracts = contractsAddresses[chainId];
const staking = contracts.L2Staking || contracts.L1Staking;
const stakingContract = new ethers.Contract(staking.address, abi, provider)
const validateAllocation = async (
    contracts,
    allocationID,
) => {
    const allocation = await stakingContract.getAllocation(allocationID)
    if (allocation.indexer === AddressZero) {
        throw new Error(`Allocation ${allocationID} not found in the contracts`)
    }
    return allocation.indexer
}

// Recover signature
async function main(attestation) {
    console.log('## Recovering signer')

    const allocationID = recoverAttestation(
        chainId,
        contracts.DisputeManager.address,
        attestation,
        "0",
    )
    console.log('AllocationID: ' + allocationID)

    // Look for allocation and indexer address
    console.log(`## Looking for on-chain allocation data`)
    const indexerAddress = await validateAllocation(contracts, allocationID)
    let url = `https://thegraph.com/explorer/profile/${indexerAddress}`
    openUrl(url)
    console.log('Indexer Profile: ' + url)

}

const openUrl = (url) => {
    switch (process.platform) {
        case 'darwin':
            exec(`open ${url}`);
            break;
        case 'win32':
            exec(`start ${url}`);
            break;
        case 'linux':
            exec(`xdg-open ${url}`);
            break;
    }
}

// Check if attestation argument is provided
if (process.argv.length > 2) {
    const attestationArg = process.argv[2];
    try {
        const attestation = JSON.parse(attestationArg);
        main(attestation).catch(error => {
            console.error('Error:', error);
        });
    } catch (error) {
        console.error('Invalid attestation JSON format:', error);
    }
} else {
    console.error('Usage: node script.js <attestation>');
}
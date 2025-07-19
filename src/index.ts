import { recoverAttestation } from '@graphprotocol/common-ts';
import contractsAddresses from '@graphprotocol/contracts/addresses.json';
import abi from '@graphprotocol/contracts/dist/abis/L2Staking.json';
import { ethers } from 'ethers';
import { exec } from 'child_process';

const AddressZero = '0x0000000000000000000000000000000000000000';

const chainId = 42161; // Arbitrum ChainID
const provider = new ethers.JsonRpcProvider("https://arbitrum.rpc.subquery.network/public");

const contracts = contractsAddresses[chainId.toString() as keyof typeof contractsAddresses];
const staking = (contracts as any).L2Staking || (contracts as any).L1Staking;
const stakingContract = new ethers.Contract(staking.address, abi, provider);

interface Allocation {
    indexer: string;
    [key: string]: any;
}

const validateAllocation = async (
    contracts: any,
    allocationID: string,
): Promise<string> => {
    const allocation: Allocation = await stakingContract.getAllocation(allocationID);
    if (allocation.indexer === AddressZero) {
        throw new Error(`Allocation ${allocationID} not found in the contracts`);
    }
    return allocation.indexer;
};

// Recover signature
async function main(attestation: any): Promise<void> {
    console.log('## Recovering signer');

    const allocationID = recoverAttestation(
        chainId,
        contracts.DisputeManager.address,
        attestation,
        "0",
    );
    console.log('AllocationID: ' + allocationID);

    // Look for allocation and indexer address
    console.log(`## Looking for on-chain allocation data`);
    const indexerAddress = await validateAllocation(contracts as any, allocationID);
    const url = `https://thegraph.com/explorer/profile/${indexerAddress}`;
    openUrl(url);
    console.log('Indexer Profile: ' + url);
}

const openUrl = (url: string): void => {
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
};

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
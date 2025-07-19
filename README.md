# attestationcheck

## Description
Extract AllocationID from a Graph query attestation, and return the indexer Address

## Installation
```bash
npm install
```

## Build
```bash
npm run build
```

## Usage
```bash
# Run the compiled JavaScript
npm start '{"requestCID":"0x...","responseCID":"0x...","subgraphDeploymentID":"0x...","r":"0x...","s":"0x...","v":27}'

# Or run directly with ts-node (for development)
npm run dev '{"requestCID":"0x...","responseCID":"0x...","subgraphDeploymentID":"0x...","r":"0x...","s":"0x...","v":27}'
```

## Development
This project is written in TypeScript. The source code is in the `src/` directory and gets compiled to the `dist/` directory.

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run TypeScript directly with ts-node
- `npm run clean` - Remove compiled files
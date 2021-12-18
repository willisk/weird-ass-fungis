import { ethers } from 'ethers';

export const signGiveaway = async (signer, contract, address) => {
  contract = ethers.utils.getAddress(contract);
  address = ethers.utils.getAddress(address);

  return await signer.signMessage(
    ethers.utils.arrayify(
      ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address', 'address'], [contract, address]))
    )
  );
};

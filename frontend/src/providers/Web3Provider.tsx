import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, SUPPORTED_NETWORKS } from '../contracts/contractAddresses';
import { MEDIA_NFT_MARKETPLACE_ABI, LICENSE_TYPES } from '../contracts/contractABI';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getContentList: () => Promise<any[]>;
  verifyContent: (file: File) => Promise<any>;
  uploadContent: (file: File, title: string, description: string) => Promise<any>;
  // Marketplace functions
  mintContentNFT: (contentHash: string, ipfsHash: string, metadata: string, tokenURI: string, royalty: number) => Promise<any>;
  listNFTForSale: (tokenId: number, price: string) => Promise<any>;
  buyNFT: (tokenId: number, price: string) => Promise<any>;
  removeFromSale: (tokenId: number) => Promise<any>;
  grantLicense: (tokenId: number, licensee: string, licenseType: number, duration: number, price: string) => Promise<any>;
  getMarketplaceNFTs: () => Promise<any[]>;
  getUserNFTs: (userAddress: string) => Promise<any[]>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      if (typeof window.ethereum !== 'undefined') {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await web3Provider.send('eth_requestAccounts', []);
        const web3Signer = await web3Provider.getSigner();
        const network = await web3Provider.getNetwork();

        setProvider(web3Provider);
        setSigner(web3Signer);
        setAccount(accounts[0]);
        setChainId(Number(network.chainId));
        setIsConnected(true);

        localStorage.setItem('walletConnected', 'true');
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    localStorage.removeItem('walletConnected');
  };

  useEffect(() => {
    const checkConnection = async () => {
      const wasConnected = localStorage.getItem('walletConnected');
      if (wasConnected && typeof window.ethereum !== 'undefined') {
        try {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await web3Provider.listAccounts();
          if (accounts.length > 0) {
            const web3Signer = await web3Provider.getSigner();
            const network = await web3Provider.getNetwork();

            setProvider(web3Provider);
            setSigner(web3Signer);
            setAccount(accounts[0].address);
            setChainId(Number(network.chainId));
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Failed to reconnect wallet:', error);
        }
      }
    };

    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const getContentList = async (): Promise<any[]> => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production' ? '/api/media' : 'http://localhost:3000/api/media';
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch content list');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching content list:', error);
      return [];
    }
  };

  const verifyContent = async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = process.env.NODE_ENV === 'production' ? '/api/media/verify' : 'http://localhost:3000/api/media/verify';
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to verify content');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying content:', error);
      return { verified: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const uploadContent = async (file: File, title: string, description: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);

      const apiUrl = process.env.NODE_ENV === 'production' ? '/api/media/upload' : 'http://localhost:3000/api/media/upload';
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload content');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading content:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Helper function to get marketplace contract
  const getMarketplaceContract = () => {
    if (!provider || !signer || !chainId) {
      throw new Error('Wallet not connected');
    }
    
    const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.MediaNFTMarketplace;
    if (!contractAddress) {
      throw new Error(`Contract not deployed on network ${chainId}`);
    }
    
    return new ethers.Contract(contractAddress, MEDIA_NFT_MARKETPLACE_ABI, signer);
  };

  // Marketplace functions
  const mintContentNFT = async (contentHash: string, ipfsHash: string, metadata: string, tokenURI: string, royalty: number): Promise<any> => {
    try {
      if (!account) throw new Error('Wallet not connected');
      
      const contract = getMarketplaceContract();
      const tx = await contract.mintContentNFT(account, contentHash, ipfsHash, metadata, tokenURI, royalty);
      const receipt = await tx.wait();
      
      return { success: true, transaction: receipt, tokenId: receipt.logs[0]?.topics[1] };
    } catch (error) {
      console.error('Error minting NFT:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const listNFTForSale = async (tokenId: number, price: string): Promise<any> => {
    try {
      const contract = getMarketplaceContract();
      const priceWei = ethers.parseEther(price);
      const tx = await contract.listForSale(tokenId, priceWei);
      const receipt = await tx.wait();
      
      return { success: true, transaction: receipt };
    } catch (error) {
      console.error('Error listing NFT:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const buyNFT = async (tokenId: number, price: string): Promise<any> => {
    try {
      const contract = getMarketplaceContract();
      const priceWei = ethers.parseEther(price);
      const tx = await contract.buyNFT(tokenId, { value: priceWei });
      const receipt = await tx.wait();
      
      return { success: true, transaction: receipt };
    } catch (error) {
      console.error('Error buying NFT:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const removeFromSale = async (tokenId: number): Promise<any> => {
    try {
      const contract = getMarketplaceContract();
      const tx = await contract.removeFromSale(tokenId);
      const receipt = await tx.wait();
      
      return { success: true, transaction: receipt };
    } catch (error) {
      console.error('Error removing from sale:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const grantLicense = async (tokenId: number, licensee: string, licenseType: number, duration: number, price: string): Promise<any> => {
    try {
      const contract = getMarketplaceContract();
      const priceWei = ethers.parseEther(price);
      const tx = await contract.grantLicense(tokenId, licensee, licenseType, duration, priceWei, { value: priceWei });
      const receipt = await tx.wait();
      
      return { success: true, transaction: receipt };
    } catch (error) {
      console.error('Error granting license:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const getMarketplaceNFTs = async (): Promise<any[]> => {
    try {
      if (!provider || !chainId) return [];
      
      const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.MediaNFTMarketplace;
      if (!contractAddress) return [];
      
      const contract = new ethers.Contract(contractAddress, MEDIA_NFT_MARKETPLACE_ABI, provider);
      
      // This is a simplified version - in a real implementation, you'd want to query events
      // or have a view function that returns all marketplace listings
      const nfts: any[] = [];
      
      // For now, return empty array - you can implement event querying later
      return nfts;
    } catch (error) {
      console.error('Error fetching marketplace NFTs:', error);
      return [];
    }
  };

  const getUserNFTs = async (userAddress: string): Promise<any[]> => {
    try {
      if (!provider || !chainId) return [];
      
      const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.MediaNFTMarketplace;
      if (!contractAddress) return [];
      
      const contract = new ethers.Contract(contractAddress, MEDIA_NFT_MARKETPLACE_ABI, provider);
      const tokenIds = await contract.getCreatorAssets(userAddress);
      
      const nfts = [];
      for (const tokenId of tokenIds) {
        try {
          const asset = await contract.getMediaAsset(tokenId);
          const owner = await contract.ownerOf(tokenId);
          nfts.push({
            tokenId: tokenId.toString(),
            ...asset,
            owner,
            price: ethers.formatEther(asset.price || 0)
          });
        } catch (error) {
          console.error(`Error fetching NFT ${tokenId}:`, error);
        }
      }
      
      return nfts;
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      return [];
    }
  };

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    getContentList,
    verifyContent,
    uploadContent,
    mintContentNFT,
    listNFTForSale,
    buyNFT,
    removeFromSale,
    grantLicense,
    getMarketplaceNFTs,
    getUserNFTs,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
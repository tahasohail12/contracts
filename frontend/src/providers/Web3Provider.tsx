import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Contract addresses from backend
const CONTRACTS = {
  MEDIA_REGISTRY: '0xa623Fd4E5Ac8dBA6bE35AcB83d955996f5Af0ac1',
  NFT_MINTING: '0x066DCbe3D1925E77899CA8c00075b2ec26A5B55E',
  LICENSE_MANAGER: '0x2A9296ea885e84AcCD1b3af984C433424Da02FdB',
};

// Sepolia network configuration
const SEPOLIA_NETWORK = {
  chainId: '0xaa36a7', // 11155111 in hex
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/f30bff13a25c46cb8ab16fc33df75aa4'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};

interface Web3ContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  balance: string;
  chainId: number | null;
  
  // Provider and signer
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  
  // Contract instances
  contracts: {
    mediaRegistry: ethers.Contract | null;
    nftMinting: ethers.Contract | null;
    licenseManager: ethers.Contract | null;
  };
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToSepolia: () => Promise<void>;
  uploadContent: (file: File, title: string, description: string) => Promise<any>;
  verifyContent: (file: File) => Promise<any>;
  getContentList: () => Promise<any[]>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Contract ABIs (simplified for frontend)
const MEDIA_REGISTRY_ABI = [
  "function registerMedia(string memory _hash, string memory _metadata) public",
  "function mediaRegistry(uint256) public view returns (string memory hash, string memory metadata)",
  "function mediaCount() public view returns (uint256)",
  "event MediaRegistered(uint256 indexed id, string hash, string metadata)"
];

const NFT_MINTING_ABI = [
  "function mintNFT(address to) public returns (uint256)",
  "function tokenIdCounter() public view returns (uint256)",
  "function name() public view returns (string memory)",
  "function symbol() public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

const LICENSE_MANAGER_ABI = [
  "function buyLicense(uint256 mediaId) public payable",
  "function transferLicense(uint256 mediaId, address to) public",
  "function licenseOwners(uint256, address) public view returns (bool)",
  "event LicensePurchased(uint256 indexed mediaId, address indexed buyer, uint256 price)",
  "event LicenseTransferred(uint256 indexed mediaId, address indexed from, address indexed to)"
];

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contracts, setContracts] = useState({
    mediaRegistry: null as ethers.Contract | null,
    nftMinting: null as ethers.Contract | null,
    licenseManager: null as ethers.Contract | null,
  });

  // Initialize contracts when signer is available
  useEffect(() => {
    if (signer && chainId === 11155111) { // Sepolia chain ID
      try {
        const mediaRegistry = new ethers.Contract(CONTRACTS.MEDIA_REGISTRY, MEDIA_REGISTRY_ABI, signer);
        const nftMinting = new ethers.Contract(CONTRACTS.NFT_MINTING, NFT_MINTING_ABI, signer);
        const licenseManager = new ethers.Contract(CONTRACTS.LICENSE_MANAGER, LICENSE_MANAGER_ABI, signer);
        
        setContracts({
          mediaRegistry,
          nftMinting,
          licenseManager,
        });
      } catch (error) {
        console.error('Error initializing contracts:', error);
        toast.error('Failed to initialize smart contracts');
      }
    } else {
      setContracts({
        mediaRegistry: null,
        nftMinting: null,
        licenseManager: null,
      });
    }
  }, [signer, chainId]);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      // Refresh balance
      if (provider) {
        provider.getBalance(accounts[0]).then(balance => {
          setBalance(ethers.formatEther(balance));
        });
      }
    }
  }, [provider]);

  const handleChainChanged = useCallback((chainId: string) => {
    setChainId(parseInt(chainId, 16));
    // Refresh the page to reset the dapp state
    window.location.reload();
  }, []);

  const checkConnection = useCallback(async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          setProvider(provider);
          
          const signer = await provider.getSigner();
          setSigner(signer);
          
          const balance = await provider.getBalance(accounts[0].address);
          setBalance(ethers.formatEther(balance));
          
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  }, []);

  // Check if wallet is already connected on page load
  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnection, handleAccountsChanged, handleChainChanged]);
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          const balance = await provider.getBalance(accounts[0].address);
          
          setProvider(provider);
          setSigner(signer);
          setAccount(accounts[0].address);
          setChainId(Number(network.chainId));
          setBalance(ethers.formatEther(balance));
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setBalance('0');
    setIsConnected(false);
    setContracts({
      mediaRegistry: null,
      nftMinting: null,
      licenseManager: null,
    });
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await provider.send('eth_requestAccounts', []);
      
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(account);
      
      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setChainId(Number(network.chainId));
      setBalance(ethers.formatEther(balance));
      setIsConnected(true);
      
      toast.success('Wallet connected successfully!');
      
      // Check if user is on Sepolia network
      if (Number(network.chainId) !== 11155111) {
        toast.error('Please switch to Sepolia test network');
      }
      
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setBalance('0');
    setIsConnected(false);
    setContracts({
      mediaRegistry: null,
      nftMinting: null,
      licenseManager: null,
    });
    toast.success('Wallet disconnected');
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_NETWORK],
          });
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
          toast.error('Failed to add Sepolia network');
        }
      } else {
        console.error('Error switching to Sepolia:', switchError);
        toast.error('Failed to switch to Sepolia network');
      }
    }
  };

  // Upload content to backend
  const uploadContent = async (file: File, title: string, description: string) => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('walletAddress', account);

    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    return await response.json();
  };

  // Verify content
  const verifyContent = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:3000/api/verify', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Verification failed');
    }

    return await response.json();
  };

  // Get content list
  const getContentList = async () => {
    const response = await fetch('http://localhost:3000/api/media');
    
    if (!response.ok) {
      throw new Error('Failed to fetch content list');
    }

    return await response.json();
  };

  const value: Web3ContextType = {
    isConnected,
    isConnecting,
    account,
    balance,
    chainId,
    provider,
    signer,
    contracts,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    uploadContent,
    verifyContent,
    getContentList,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Extend window object for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

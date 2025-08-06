import React, { useState } from 'react';
import { useWeb3 } from '../providers/Web3Provider';
import toast from 'react-hot-toast';
import './NFTMinter.css';

interface NFTMinterProps {
  uploadedContent?: {
    hash: string;
    ipfsHash: string;
    title: string;
    description: string;
    size: number;
    createdAt: string;
  };
  onMintComplete?: () => void;
}

const NFTMinter: React.FC<NFTMinterProps> = ({ uploadedContent, onMintComplete }) => {
  const { mintContentNFT, isConnected } = useWeb3();
  const [isMinting, setIsMinting] = useState(false);
  const [royaltyPercentage, setRoyaltyPercentage] = useState(5); // 5% default

  const handleMintNFT = async () => {
    if (!uploadedContent) {
      toast.error('No content to mint');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsMinting(true);
    
    try {
      const metadata = JSON.stringify({
        title: uploadedContent.title,
        description: uploadedContent.description,
        size: uploadedContent.size,
        createdAt: uploadedContent.createdAt,
        contentHash: uploadedContent.hash
      });

      const tokenURI = `https://gateway.pinata.cloud/ipfs/${uploadedContent.ipfsHash}`;
      
      toast.loading('Minting NFT on blockchain...');
      
      const result = await mintContentNFT(
        uploadedContent.hash,
        uploadedContent.ipfsHash,
        metadata,
        tokenURI,
        royaltyPercentage * 100 // Convert to basis points (5% = 500)
      );

      if (result.success) {
        toast.dismiss();
        toast.success('🎉 NFT minted successfully!');
        if (onMintComplete) {
          onMintComplete();
        }
      } else {
        toast.dismiss();
        toast.error(result.error || 'Failed to mint NFT');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Minting failed');
      console.error('Minting error:', error);
    } finally {
      setIsMinting(false);
    }
  };

  if (!uploadedContent) {
    return (
      <div className="nft-minter">
        <div className="mint-prompt">
          <h3>🎨 Ready to create an NFT?</h3>
          <p>Upload content first, then you can mint it as an NFT on the blockchain!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-minter">
      <div className="mint-card">
        <div className="mint-header">
          <h3>🎨 Mint as NFT</h3>
          <p>Transform your uploaded content into a blockchain NFT</p>
        </div>

        <div className="content-preview">
          <div className="content-info">
            <h4>{uploadedContent.title}</h4>
            <p>{uploadedContent.description}</p>
            <div className="content-details">
              <span>📄 Hash: {uploadedContent.hash.slice(0, 20)}...</span>
              <span>📦 Size: {(uploadedContent.size / 1024 / 1024).toFixed(2)} MB</span>
              <span>🔗 IPFS: {uploadedContent.ipfsHash}</span>
            </div>
          </div>
        </div>

        <div className="mint-options">
          <div className="royalty-setting">
            <label>
              <span>Creator Royalty (%)</span>
              <div className="royalty-input">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={royaltyPercentage}
                  onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
                  disabled={isMinting}
                />
                <span className="royalty-value">{royaltyPercentage}%</span>
              </div>
            </label>
            <small>You'll earn this percentage on all future sales</small>
          </div>
        </div>

        <div className="mint-actions">
          <button
            className={`mint-button ${isMinting ? 'minting' : ''}`}
            onClick={handleMintNFT}
            disabled={isMinting || !isConnected}
          >
            {isMinting ? (
              <>
                <div className="mint-spinner"></div>
                Minting NFT...
              </>
            ) : !isConnected ? (
              '🔒 Connect Wallet to Mint'
            ) : (
              '✨ Mint NFT'
            )}
          </button>
        </div>

        <div className="mint-info">
          <div className="info-item">
            <span className="info-icon">⛽</span>
            <span>Gas fees will apply for minting</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🎯</span>
            <span>NFT will be minted on Sepolia testnet</span>
          </div>
          <div className="info-item">
            <span className="info-icon">💎</span>
            <span>You'll be able to list it for sale after minting</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMinter;

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../providers/Web3Provider';
import toast from 'react-hot-toast';
import ListingModal from './ListingModal';
import './Marketplace.css';

interface NFTItem {
  tokenId: string;
  contentHash: string;
  ipfsHash: string;
  metadata: string;
  creator: string;
  owner: string;
  createdAt: number;
  isForSale: boolean;
  price: string;
  royaltyPercentage: number;
}

const Marketplace: React.FC = () => {
  const { account, isConnected, getUserNFTs, buyNFT, getMarketplaceNFTs, removeFromSale } = useWeb3();
  const [userNFTs, setUserNFTs] = useState<NFTItem[]>([]);
  const [marketplaceNFTs, setMarketplaceNFTs] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-nfts'>('marketplace');
  const [listingModal, setListingModal] = useState<{
    isOpen: boolean;
    nft: NFTItem | null;
  }>({ isOpen: false, nft: null });

  useEffect(() => {
    if (isConnected && account) {
      loadUserNFTs();
      loadMarketplaceNFTs();
    }
  }, [isConnected, account]);

  const loadUserNFTs = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const nfts = await getUserNFTs(account);
      setUserNFTs(nfts);
    } catch (error) {
      console.error('Error loading user NFTs:', error);
      toast.error('Failed to load your NFTs');
    } finally {
      setLoading(false);
    }
  };

  const loadMarketplaceNFTs = async () => {
    setLoading(true);
    try {
      const nfts = await getMarketplaceNFTs();
      setMarketplaceNFTs(nfts);
    } catch (error) {
      console.error('Error loading marketplace NFTs:', error);
      toast.error('Failed to load marketplace NFTs');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNFT = async (tokenId: string, price: string) => {
    try {
      toast.loading('Processing purchase...');
      const result = await buyNFT(parseInt(tokenId), price);
      
      if (result.success) {
        toast.dismiss();
        toast.success('NFT purchased successfully!');
        loadMarketplaceNFTs();
        loadUserNFTs();
      } else {
        toast.dismiss();
        toast.error(result.error || 'Purchase failed');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Transaction failed');
      console.error('Purchase error:', error);
    }
  };

  const handleRemoveFromSale = async (tokenId: string) => {
    try {
      toast.loading('Removing from sale...');
      const result = await removeFromSale(parseInt(tokenId));
      
      if (result.success) {
        toast.dismiss();
        toast.success('NFT removed from sale!');
        loadUserNFTs();
        loadMarketplaceNFTs();
      } else {
        toast.dismiss();
        toast.error(result.error || 'Failed to remove from sale');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Transaction failed');
      console.error('Remove from sale error:', error);
    }
  };

  const openListingModal = (nft: NFTItem) => {
    setListingModal({ isOpen: true, nft });
  };

  const closeListingModal = () => {
    setListingModal({ isOpen: false, nft: null });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <section className="marketplace-section">
        <div className="container">
          <h2>NFT Marketplace</h2>
          <div className="connect-prompt">
            <p>Please connect your wallet to view the marketplace</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="marketplace-section">
      <div className="container">
        <div className="marketplace-header">
          <h2>NFT Marketplace</h2>
          <div className="marketplace-tabs">
            <button 
              className={`tab-button ${activeTab === 'marketplace' ? 'active' : ''}`}
              onClick={() => setActiveTab('marketplace')}
            >
              🏪 Marketplace
            </button>
            <button 
              className={`tab-button ${activeTab === 'my-nfts' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-nfts')}
            >
              🎨 My NFTs
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading NFTs...</p>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="marketplace-grid">
            {marketplaceNFTs.length === 0 && !loading ? (
              <div className="empty-state">
                <h3>No NFTs for sale</h3>
                <p>Be the first to list an NFT on the marketplace!</p>
              </div>
            ) : (
              marketplaceNFTs
                .filter(nft => nft.isForSale && nft.owner !== account)
                .map((nft) => (
                  <div key={nft.tokenId} className="nft-card marketplace-card">
                    <div className="nft-image">
                      {nft.ipfsHash ? (
                        <img 
                          src={`https://gateway.pinata.cloud/ipfs/${nft.ipfsHash}`} 
                          alt="NFT Content"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) nextElement.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="placeholder-image" style={{ display: nft.ipfsHash ? 'none' : 'flex' }}>
                        📄 Content NFT
                      </div>
                    </div>
                    <div className="nft-details">
                      <h4>NFT #{nft.tokenId}</h4>
                      <p className="nft-metadata">{nft.metadata || 'No description'}</p>
                      <div className="nft-info">
                        <span>Creator: {formatAddress(nft.creator)}</span>
                        <span>Owner: {formatAddress(nft.owner)}</span>
                        <span>Created: {formatDate(nft.createdAt)}</span>
                      </div>
                      <div className="nft-price">
                        <span className="price">{nft.price} ETH</span>
                        <span className="royalty">Royalty: {(nft.royaltyPercentage / 100)}%</span>
                      </div>
                      <button 
                        className="buy-button"
                        onClick={() => handleBuyNFT(nft.tokenId, nft.price)}
                      >
                        🛒 Buy NFT
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'my-nfts' && (
          <div className="my-nfts-grid">
            {userNFTs.length === 0 && !loading ? (
              <div className="empty-state">
                <h3>You don't own any NFTs yet</h3>
                <p>Upload content and mint NFTs to get started!</p>
              </div>
            ) : (
              userNFTs.map((nft) => (
                <div key={nft.tokenId} className="nft-card my-nft-card">
                  <div className="nft-image">
                    {nft.ipfsHash ? (
                      <img 
                        src={`https://gateway.pinata.cloud/ipfs/${nft.ipfsHash}`} 
                        alt="NFT Content"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) nextElement.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="placeholder-image" style={{ display: nft.ipfsHash ? 'none' : 'flex' }}>
                      📄 Content NFT
                    </div>
                  </div>
                  <div className="nft-details">
                    <h4>NFT #{nft.tokenId}</h4>
                    <p className="nft-metadata">{nft.metadata || 'No description'}</p>
                    <div className="nft-info">
                      <span>Creator: {nft.creator === account ? 'You' : formatAddress(nft.creator)}</span>
                      <span>Owner: {nft.owner === account ? 'You' : formatAddress(nft.owner)}</span>
                      <span>Created: {formatDate(nft.createdAt)}</span>
                    </div>
                    <div className="nft-status">
                      {nft.isForSale ? (
                        <span className="for-sale">🏷️ Listed for {nft.price} ETH</span>
                      ) : (
                        <span className="not-for-sale">Not for sale</span>
                      )}
                    </div>
                    <div className="nft-actions">
                      {nft.owner === account && (
                        <>
                          {!nft.isForSale ? (
                            <button 
                              className="list-button"
                              onClick={() => openListingModal(nft)}
                            >
                              📝 List for Sale
                            </button>
                          ) : (
                            <button 
                              className="remove-button"
                              onClick={() => handleRemoveFromSale(nft.tokenId)}
                            >
                              ❌ Remove from Sale
                            </button>
                          )}
                          <button className="license-button">
                            📜 Grant License
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Listing Modal */}
      {listingModal.nft && (
        <ListingModal
          isOpen={listingModal.isOpen}
          onClose={closeListingModal}
          nft={listingModal.nft}
          onListingComplete={() => {
            loadUserNFTs();
            loadMarketplaceNFTs();
          }}
        />
      )}
    </section>
  );
};

export default Marketplace;

import React, { useState } from 'react';
import { useWeb3 } from '../providers/Web3Provider';
import toast from 'react-hot-toast';
import './ListingModal.css';

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: {
    tokenId: string;
    metadata: string;
    ipfsHash: string;
  };
  onListingComplete: () => void;
}

const ListingModal: React.FC<ListingModalProps> = ({ isOpen, onClose, nft, onListingComplete }) => {
  const { listNFTForSale } = useWeb3();
  const [price, setPrice] = useState('');
  const [isListing, setIsListing] = useState(false);

  const handleListForSale = async () => {
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsListing(true);
    
    try {
      toast.loading('Listing NFT for sale...');
      
      const result = await listNFTForSale(parseInt(nft.tokenId), price);
      
      if (result.success) {
        toast.dismiss();
        toast.success('NFT listed successfully!');
        onListingComplete();
        onClose();
        setPrice('');
      } else {
        toast.dismiss();
        toast.error(result.error || 'Failed to list NFT');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Listing failed');
      console.error('Listing error:', error);
    } finally {
      setIsListing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📝 List NFT for Sale</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="nft-preview">
            {nft.ipfsHash && (
              <img 
                src={`https://gateway.pinata.cloud/ipfs/${nft.ipfsHash}`}
                alt="NFT Preview"
                className="preview-image"
              />
            )}
            <div className="nft-info">
              <h4>NFT #{nft.tokenId}</h4>
              <p>{nft.metadata}</p>
            </div>
          </div>
          
          <div className="price-setting">
            <label>
              <span>Sale Price (ETH)</span>
              <div className="price-input">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.1"
                  disabled={isListing}
                />
                <span className="currency">ETH</span>
              </div>
            </label>
            <small>Set the price you want to sell your NFT for</small>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="cancel-button" 
            onClick={onClose}
            disabled={isListing}
          >
            Cancel
          </button>
          <button 
            className="list-button"
            onClick={handleListForSale}
            disabled={isListing || !price}
          >
            {isListing ? (
              <>
                <div className="spinner"></div>
                Listing...
              </>
            ) : (
              '📝 List for Sale'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingModal;

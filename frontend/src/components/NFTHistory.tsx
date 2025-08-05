import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../providers/Web3Provider';
import './NFTHistory.css';

interface HistoryEntry {
  eventType: string;
  from?: string;
  to?: string;
  timestamp: string;
  transactionHash?: string;
  metadata?: any;
}

interface NFTHistoryData {
  contentInfo: {
    hash: string;
    originalName: string;
    ipfsHash: string;
    mintedAt: string;
    currentOwner: string;
    totalVerifications: number;
    totalDownloads: number;
  };
  transferHistory: any[];
  verificationHistory: any[];
  downloadHistory: any[];
  fullHistory: HistoryEntry[];
}

interface NFTHistoryProps {
  contentHash: string;
  onClose: () => void;
}

const NFTHistory: React.FC<NFTHistoryProps> = ({ contentHash, onClose }) => {
  const [historyData, setHistoryData] = useState<NFTHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transfers' | 'verifications' | 'downloads' | 'timeline'>('overview');

  useEffect(() => {
    fetchNFTHistory();
  }, [contentHash]);

  const fetchNFTHistory = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NODE_ENV === 'production' ? `/api/nft/history/${contentHash}` : `http://localhost:3000/api/nft/history/${contentHash}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch NFT history');
      }
      
      const data = await response.json();
      setHistoryData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAddress = (address: string) => {
    if (!address || address === 'anonymous') return 'Anonymous';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'mint': return '🎨';
      case 'transfer': return '🔄';
      case 'verify': return '✅';
      case 'download': return '📥';
      default: return '📄';
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'mint': return '#4CAF50';
      case 'transfer': return '#2196F3';
      case 'verify': return '#FF9800';
      case 'download': return '#9C27B0';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <div className="nft-history-modal">
        <div className="nft-history-content">
          <div className="loading-spinner">Loading NFT history...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nft-history-modal">
        <div className="nft-history-content">
          <div className="error-message">Error: {error}</div>
          <button onClick={onClose} className="close-button">Close</button>
        </div>
      </div>
    );
  }

  if (!historyData) {
    return (
      <div className="nft-history-modal">
        <div className="nft-history-content">
          <div className="error-message">No history data available</div>
          <button onClick={onClose} className="close-button">Close</button>
        </div>
      </div>
    );
  }

  const { contentInfo, transferHistory, verificationHistory, downloadHistory, fullHistory } = historyData;

  return (
    <div className="nft-history-modal" onClick={onClose}>
      <div className="nft-history-content" onClick={(e) => e.stopPropagation()}>
        <div className="nft-history-header">
          <h2>NFT History & Ownership</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="nft-info-summary">
          <div className="info-card">
            <h3>{contentInfo.originalName}</h3>
            <p><strong>Content Hash:</strong> {contentInfo.hash.substring(0, 20)}...</p>
            <p><strong>IPFS Hash:</strong> 
              <a href={`https://ipfs.io/ipfs/${contentInfo.ipfsHash}`} target="_blank" rel="noopener noreferrer">
                {contentInfo.ipfsHash?.substring(0, 20)}...
              </a>
            </p>
            <p><strong>Minted:</strong> {formatDate(contentInfo.mintedAt)}</p>
            <p><strong>Current Owner:</strong> {formatAddress(contentInfo.currentOwner)}</p>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{contentInfo.totalVerifications}</span>
              <span className="stat-label">Verifications</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{transferHistory.length}</span>
              <span className="stat-label">Transfers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{contentInfo.totalDownloads}</span>
              <span className="stat-label">Downloads</span>
            </div>
          </div>
        </div>

        <div className="history-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline
          </button>
          <button 
            className={`tab-button ${activeTab === 'transfers' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfers')}
          >
            Transfers ({transferHistory.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'verifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('verifications')}
          >
            Verifications ({verificationHistory.length})
          </button>
        </div>

        <div className="history-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="recent-activity">
                <h4>Recent Activity</h4>
                {fullHistory.slice(0, 5).map((entry, index) => (
                  <div key={index} className="activity-item">
                    <span className="activity-icon">{getEventIcon(entry.eventType)}</span>
                    <div className="activity-details">
                      <span className="activity-type" style={{ color: getEventColor(entry.eventType) }}>
                        {entry.eventType.toUpperCase()}
                      </span>
                      <span className="activity-time">{formatDate(entry.timestamp)}</span>
                      {entry.to && <span className="activity-address">by {formatAddress(entry.to)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="timeline-tab">
              <div className="timeline">
                {fullHistory.map((entry, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker" style={{ backgroundColor: getEventColor(entry.eventType) }}>
                      {getEventIcon(entry.eventType)}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-type">{entry.eventType.toUpperCase()}</span>
                        <span className="timeline-time">{formatDate(entry.timestamp)}</span>
                      </div>
                      <div className="timeline-details">
                        {entry.from && <p>From: {formatAddress(entry.from)}</p>}
                        {entry.to && <p>To: {formatAddress(entry.to)}</p>}
                        {entry.transactionHash && (
                          <p>
                            Tx: <a href={`https://sepolia.etherscan.io/tx/${entry.transactionHash}`} target="_blank" rel="noopener noreferrer">
                              {entry.transactionHash.substring(0, 20)}...
                            </a>
                          </p>
                        )}
                        {entry.metadata && (
                          <p>Action: {entry.metadata.action || 'Unknown'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transfers' && (
            <div className="transfers-tab">
              {transferHistory.length === 0 ? (
                <p className="no-data">No transfers recorded yet</p>
              ) : (
                <div className="transfer-list">
                  {transferHistory.map((transfer, index) => (
                    <div key={index} className="transfer-item">
                      <div className="transfer-addresses">
                        <span>From: {formatAddress(transfer.from)}</span>
                        <span>→</span>
                        <span>To: {formatAddress(transfer.to)}</span>
                      </div>
                      <div className="transfer-details">
                        <span>Date: {formatDate(transfer.timestamp)}</span>
                        {transfer.transactionHash && (
                          <a href={`https://sepolia.etherscan.io/tx/${transfer.transactionHash}`} target="_blank" rel="noopener noreferrer">
                            View Transaction
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'verifications' && (
            <div className="verifications-tab">
              {verificationHistory.length === 0 ? (
                <p className="no-data">No verifications recorded yet</p>
              ) : (
                <div className="verification-list">
                  {verificationHistory.map((verification, index) => (
                    <div key={index} className="verification-item">
                      <div className="verification-header">
                        <span className="verification-result">✅ {verification.result}</span>
                        <span className="verification-time">{formatDate(verification.timestamp)}</span>
                      </div>
                      <div className="verification-details">
                        <span>Verified by: {formatAddress(verification.verifiedBy)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTHistory;

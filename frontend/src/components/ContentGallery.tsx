import React, { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '../providers/Web3Provider';
import { toast } from 'react-hot-toast';

interface ContentItem {
  _id: string;
  hash: string;
  originalName: string;
  mimeType: string;
  size: number;
  ipfsHash: string;
  metadata?: any;
  nftTokenId?: number;
  owner: string;
  verified: boolean;
  createdAt: string;
}

const ContentGallery: React.FC = () => {
  const { getContentList, verifyContent } = useWeb3();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<{[key: string]: any}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadContents = async () => {
    try {
      const data = await getContentList();
      setContents(data);
    } catch (error) {
      console.error('Error loading contents:', error);
      toast.error('Failed to load content gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContents();
  }, []);

  const handleVerifyFile = async (contentId: string) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '*/*';
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setVerifying(contentId);
      try {
        const result = await verifyContent(file);
        setVerificationResults(prev => ({
          ...prev,
          [contentId]: result
        }));
        
        if (result.verified) {
          toast.success('✅ Content verified! This file matches the registered content.');
        } else {
          toast.error('❌ Content not verified. This file does not match any registered content.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        toast.error('Failed to verify content');
      } finally {
        setVerifying(null);
      }
    };
    
    fileInput.click();
  };

  const formatDate = (timestamp: string | number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    return '📁';
  };

  if (loading) {
    return (
      <section id="gallery" className="content-gallery">
        <div className="container">
          <h2 className="gallery-title">Content Gallery</h2>
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="content-gallery">
      <div className="container">
        <h2 className="gallery-title">Content Gallery</h2>
        
        {contents.length === 0 ? (
          <div className="text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No content yet</h3>
            <p style={{ color: '#9ca3af' }}>
              Be the first to upload and authenticate content!
            </p>
          </div>
        ) : (
          <div className="gallery-grid">
            {contents.map((content) => (
              <div key={content._id} className="content-card">
                <div className="content-image" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  backgroundColor: '#0f0f23'
                }}>
                  {getFileTypeIcon(content.mimeType)}
                </div>
                
                <div className="content-info">
                  <h3 className="content-title">{content.metadata?.name || content.originalName}</h3>
                  <p className="content-description">{content.metadata?.description || 'No description available'}</p>
                  
                  <div className="content-meta">
                    <div>
                      <div className="content-creator">
                        {content.owner ? `${content.owner.slice(0, 6)}...${content.owner.slice(-4)}` : 'Unknown'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {formatDate(content.createdAt)}
                      </div>
                    </div>
                    
                    <div className="content-actions">
                      {content.verified && (
                        <span style={{ color: '#10b981', fontSize: '0.875rem' }}>
                          ✓ Verified
                        </span>
                      )}
                      
                      <button
                        onClick={() => handleVerifyFile(content._id)}
                        disabled={verifying === content._id}
                        className="verify-btn"
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#6366f1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          marginLeft: '1rem'
                        }}
                      >
                        {verifying === content._id ? 'Verifying...' : 'Verify File'}
                      </button>
                    </div>
                  </div>

                  <div className="content-hashes" style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                    <div><strong>Hash:</strong> {content.hash.slice(0, 10)}...{content.hash.slice(-6)}</div>
                    {content.ipfsHash && (
                      <div><strong>IPFS:</strong> {content.ipfsHash.slice(0, 10)}...{content.ipfsHash.slice(-6)}</div>
                    )}
                    {content.nftTokenId && (
                      <div><strong>NFT Token ID:</strong> {content.nftTokenId}</div>
                    )}
                  </div>

                  {verificationResults[content._id] && (
                    <div className={`verification-result ${verificationResults[content._id].verified ? 'verified' : 'not-verified'}`} style={{
                      marginTop: '1rem',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      backgroundColor: verificationResults[content._id].verified ? '#d1fae5' : '#fee2e2',
                      color: verificationResults[content._id].verified ? '#065f46' : '#991b1b'
                    }}>
                      {verificationResults[content._id].verified ? (
                        <>
                          ✅ File verified! Hash matches: {verificationResults[content._id].hash}
                        </>
                      ) : (
                        <>
                          ❌ File not verified
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ContentGallery;

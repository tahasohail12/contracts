import React, { useState, useRef } from 'react';
import { useWeb3 } from '../providers/Web3Provider';
import { toast } from 'react-hot-toast';

const UploadSection: React.FC = () => {
  const { account, uploadContent } = useWeb3();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('File size must be less than 50MB');
      return;
    }
    
    const allowedTypes = ['image/', 'video/', 'audio/', 'application/pdf', 'text/'];
    if (!allowedTypes.some(type => file.type.startsWith(type))) {
      toast.error('Unsupported file type');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!selectedFile || !title.trim()) {
      toast.error('Please provide a file and title');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadContent(selectedFile, title, description);
      setUploadResult(result);
      
      // Reset form
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('Content uploaded and registered successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload content');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <section id="upload" className="upload-section">
      <div className="upload-container">
        <h2 className="upload-title">Upload Your Content</h2>
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="Enter content title"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input form-textarea"
              placeholder="Describe your content..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">File *</label>
            <div
              className={`file-drop-zone ${dragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx"
              />
              
              {selectedFile ? (
                <div className="file-preview">
                  {selectedFile.type.startsWith('image/') && (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="file-preview img"
                    />
                  )}
                  <div className="file-info">
                    <div className="file-name">{selectedFile.name}</div>
                    <div className="file-size">{formatFileSize(selectedFile.size)}</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                  <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                    Drop your file here or click to browse
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    Supports images, videos, audio, PDFs, and documents (max 50MB)
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!account || isUploading || !selectedFile || !title.trim()}
            className={`btn w-full ${
              !account || isUploading || !selectedFile || !title.trim() 
                ? 'btn-disabled' 
                : 'btn-primary'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload Content'}
          </button>
        </form>

        {uploadResult && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1.5rem', 
            backgroundColor: '#1a1a3a', 
            borderRadius: '0.5rem',
            border: '1px solid #10b981'
          }}>
            <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>✅ Upload Successful!</h3>
            <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
              <p><strong>Content Hash:</strong> {uploadResult.hash}</p>
              <p>
                <strong>IPFS Hash:</strong> 
                {uploadResult.ipfsHash ? (
                  <a 
                    href={`https://ipfs.io/ipfs/${uploadResult.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#10b981', 
                      textDecoration: 'none',
                      marginLeft: '0.5rem'
                    }}
                  >
                    {uploadResult.ipfsHash} 🔗
                  </a>
                ) : (
                  ' Not available'
                )}
              </p>
              <p><strong>File Size:</strong> {uploadResult.size} bytes</p>
              <p><strong>Uploaded:</strong> {new Date(uploadResult.createdAt).toLocaleString()}</p>
              {uploadResult.nftTokenId && (
                <p><strong>NFT Token ID:</strong> {uploadResult.nftTokenId}</p>
              )}
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#0f0f23', borderRadius: '0.25rem' }}>
                <strong>Blockchain Verification:</strong> Content is now registered on Sepolia testnet
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UploadSection;

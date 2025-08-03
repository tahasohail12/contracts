import React from 'react';
import { useWeb3 } from '../providers/Web3Provider';

const Header: React.FC = () => {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            NFT Platform
          </div>
          
          <nav className="nav">
            <a href="#upload">Upload</a>
            <a href="#gallery">Gallery</a>
            <a href="#about">About</a>
          </nav>
          
          <div className="flex items-center gap-4">
            {account ? (
              <div className="flex items-center gap-4">
                <span style={{ fontSize: '0.875rem' }}>
                  {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="btn btn-secondary"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className={`btn ${isConnecting ? 'btn-disabled' : 'btn-primary'}`}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

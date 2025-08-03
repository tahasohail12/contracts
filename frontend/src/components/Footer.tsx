import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="mb-4">
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              NFT Content Authentication Platform
            </h3>
            <p>Securing digital content with blockchain technology</p>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ fontWeight: '500', marginBottom: '0.5rem', color: '#8b5cf6' }}>Platform</h4>
              <ul style={{ listStyle: 'none', fontSize: '0.875rem' }}>
                <li style={{ marginBottom: '0.25rem' }}><a href="#upload" style={{ color: 'inherit', textDecoration: 'none' }}>Upload Content</a></li>
                <li style={{ marginBottom: '0.25rem' }}><a href="#gallery" style={{ color: 'inherit', textDecoration: 'none' }}>Browse Gallery</a></li>
                <li style={{ marginBottom: '0.25rem' }}><a href="#verify" style={{ color: 'inherit', textDecoration: 'none' }}>Verify Content</a></li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ fontWeight: '500', marginBottom: '0.5rem', color: '#8b5cf6' }}>Resources</h4>
              <ul style={{ listStyle: 'none', fontSize: '0.875rem' }}>
                <li style={{ marginBottom: '0.25rem' }}><a href="#docs" style={{ color: 'inherit', textDecoration: 'none' }}>Documentation</a></li>
                <li style={{ marginBottom: '0.25rem' }}><a href="#faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</a></li>
                <li style={{ marginBottom: '0.25rem' }}><a href="#support" style={{ color: 'inherit', textDecoration: 'none' }}>Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ fontWeight: '500', marginBottom: '0.5rem', color: '#8b5cf6' }}>Community</h4>
              <ul style={{ listStyle: 'none', fontSize: '0.875rem' }}>
                <li style={{ marginBottom: '0.25rem' }}><a href="#github" style={{ color: 'inherit', textDecoration: 'none' }}>GitHub</a></li>
                <li style={{ marginBottom: '0.25rem' }}><a href="#discord" style={{ color: 'inherit', textDecoration: 'none' }}>Discord</a></li>
                <li style={{ marginBottom: '0.25rem' }}><a href="#twitter" style={{ color: 'inherit', textDecoration: 'none' }}>Twitter</a></li>
              </ul>
            </div>
          </div>
          
          <div style={{ paddingTop: '1rem', borderTop: '1px solid #374151', fontSize: '0.875rem' }}>
            <p>&copy; 2024 NFT Content Authentication Platform. Built with blockchain technology.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

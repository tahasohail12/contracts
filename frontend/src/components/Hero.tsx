import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="container">
        <h1>Secure Content Authentication</h1>
        <p>
          Protect your digital content with blockchain-powered authentication.
          Upload, mint, and verify content ownership with our decentralized platform.
        </p>
        <div className="flex justify-center gap-4">
          <a href="#upload" className="btn btn-primary">
            Start Uploading
          </a>
          <a href="#gallery" className="btn btn-secondary">
            Explore Gallery
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;

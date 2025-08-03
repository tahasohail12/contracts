import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './providers/Web3Provider';
import Header from './components/Header';
import Hero from './components/Hero';
import UploadSection from './components/UploadSection';
import ContentGallery from './components/ContentGallery';
import Footer from './components/Footer';
import './styles/globals.css';

function App() {
  return (
    <Web3Provider>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <Header />
        
        <main>
          <Hero />
          <UploadSection />
          <ContentGallery />
        </main>
        
        <Footer />
      </div>
    </Web3Provider>
  );
}

export default App;

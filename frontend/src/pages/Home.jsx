import FileUpload from '../components/FileUpload';
import ChatBox from '../components/ChatBox';

export default function Home() {
  return (
    <div className="home-layout">
      {/* Header Section */}
      <header className="home-header">
        <h1 className="brand-title">
          <span className="emoji-icon">📄</span> AskYourFile
        </h1>
        <p className="brand-subtitle">
          Intelligent document analysis powered by AI. 
          Upload a file to begin your session.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="home-content">
        <div className="section-wrapper upload-area">
          <FileUpload />
        </div>

        <div className="section-wrapper chat-area">
          <ChatBox />
        </div>
      </main>

    
    </div>
  );
}
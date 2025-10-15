import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Translator from './components/Translator';
import AdminPanel from './components/AdminPanel';
import Comments from './components/Comments';
import Donations from './components/Donations';
import LoginModal from './components/LoginModal';
import Learn from './components/Learn';
import About from './components/About';
import { View, UserRole } from './types';
import { isApiKeySet } from './services/apiKeyService';
import ApiKeyModal from './components/ApiKeyModal';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.TRANSLATOR);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GUEST);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);

  useEffect(() => {
    if (!isApiKeySet()) {
      setApiKeyMissing(true);
    }

    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };
  
  const handleLoginSuccess = () => {
    setUserRole(UserRole.ADMIN);
    setIsLoginModalOpen(false);
    setCurrentView(View.ADMIN);
  };

  const handleLogout = () => {
    setUserRole(UserRole.GUEST);
    setCurrentView(View.TRANSLATOR);
  };

  const handleAuthClick = () => {
    if (userRole === UserRole.ADMIN) {
      setCurrentView(View.ADMIN);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const renderView = useCallback(() => {
    switch (currentView) {
      case View.ABOUT:
        return <About />;
      case View.ADMIN:
        return userRole === UserRole.ADMIN ? <AdminPanel onLogout={handleLogout} /> : <Translator />;
      case View.COMMENTS:
        return <Comments userRole={userRole} />;
      case View.DONATIONS:
        return <Donations />;
      case View.LEARN:
        return <Learn userRole={userRole} />;
      case View.TRANSLATOR:
      default:
        return <Translator />;
    }
  }, [currentView, userRole]);

  if (apiKeyMissing) {
    return <ApiKeyModal />;
  }

  return (
    <div className="min-h-screen font-sans flex flex-col">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onAdminClick={handleAuthClick}
        userRole={userRole}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {renderView()}
      </main>
      <footer className="text-center py-6 text-medium-light-text dark:text-medium-text text-sm flex flex-col items-center gap-4">
        <p>Borneo &copy; 2024. Powered by Gemini.</p>
      </footer>
      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
};

export default App;
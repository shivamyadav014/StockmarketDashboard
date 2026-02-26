import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { watchlistAPI } from '../services/api';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchlistCount();
    }
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchWatchlistCount = async () => {
    try {
      const response = await watchlistAPI.getWatchlist();
      setWatchlistCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch watchlist count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          📈 Stock Dashboard
        </Link>

        <div className={styles.menu}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={styles.link}>
                Dashboard
              </Link>

              {!isAdmin && (
                <Link to="/user-panel" className={styles.link}>
                  Trading
                </Link>
              )}

              {isAdmin && (
                <Link to="/admin-panel" className={styles.link}>
                  Admin Panel
                </Link>
              )}

              <Link to="/watchlist" className={styles.link}>
                Watchlist ({watchlistCount})
              </Link>

              {/* User Dropdown Menu */}
              <div className={styles.userDropdown} ref={dropdownRef}>
                <button
                  className={styles.userBtn}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  👤 {user?.username}
                </button>

                {showDropdown && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownItem}>
                      <strong>{user?.username}</strong>
                      <small>{user?.email}</small>
                    </div>
                    <hr className={styles.divider} />
                    <button
                      className={styles.dropdownOption}
                      onClick={() => {
                        navigate('/profile-edit');
                        setShowDropdown(false);
                      }}
                    >
                      👤 View Profile
                    </button>
                    <hr className={styles.divider} />
                    <button
                      className={styles.dropdownOption}
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>

              <button onClick={toggleTheme} className={styles.themeBtn}>
                {isDarkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.link}>
                Login
              </Link>
              <Link to="/signup" className={styles.link}>
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

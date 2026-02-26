import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import styles from './ProfileEditPage.module.css';

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getProfile();
        setProfileData(response.data.user);
      } catch (err) {
        setError('Failed to load profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleUpdateProfile = async (updatedData) => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.updateProfile(updatedData);
      setProfileData(response.data.user);
      setUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!profileData && loading) {
    return <div className={styles.container}><p>Loading profile...</p></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Edit Profile</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        
        {profileData && (
          <ProfileEditForm
            profileData={profileData}
            onSubmit={handleUpdateProfile}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileEditPage;

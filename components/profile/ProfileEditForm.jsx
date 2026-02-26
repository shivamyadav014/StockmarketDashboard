import React, { useState } from 'react';
import styles from './ProfileEditForm.module.css';

const ProfileEditForm = ({ profileData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    firstName: profileData?.firstName || '',
    lastName: profileData?.lastName || '',
    country: profileData?.country || '',
    phoneNumber: profileData?.phoneNumber || '',
    bio: profileData?.bio || '',
  });

  const [preview, setPreview] = useState(profileData?.profilePicture || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          profilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Profile Picture Section */}
      <div className={styles.pictureSection}>
        <div className={styles.previewContainer}>
          {preview ? (
            <img src={preview} alt="Profile Preview" className={styles.preview} />
          ) : (
            <div className={styles.placeholderImage}>
              <span>No Image</span>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className={styles.imageInput}
          id="profileImage"
        />
        <label htmlFor="profileImage" className={styles.uploadButton}>
          Upload Profile Picture
        </label>
      </div>

      {/* Form Fields */}
      <div className={styles.formGroup}>
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Enter your first name"
          maxLength="50"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Enter your last name"
          maxLength="50"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="country">Country</label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="Enter your country"
          maxLength="50"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phoneNumber">Phone Number</label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Enter your phone number"
          maxLength="20"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about yourself (max 500 characters)"
          maxLength="500"
          rows="5"
          className={styles.textarea}
        />
        <span className={styles.charCount}>{formData.bio.length}/500</span>
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <a href="/dashboard" className={styles.cancelButton}>
          Cancel
        </a>
      </div>
    </form>
  );
};

export default ProfileEditForm;

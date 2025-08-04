import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Globe, Camera, Plus, X, AlertCircle, Check } from 'lucide-react';

interface FormData {
  name: string;
  logo_url: string;
  description: string;
  website: string;
  social_links: string[];
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

const BrandSignup = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    logo_url: '',
    description: '',
    website: '',
    social_links: [''],
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    return formData.name.trim() !== '' && 
           formData.email.trim() !== '' && 
           validateEmail(formData.email) &&
           formData.password.length >= 6;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    const newSocialLinks = [...formData.social_links];
    newSocialLinks[index] = value;
    setFormData(prev => ({
      ...prev,
      social_links: newSocialLinks
    }));
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      social_links: [...prev.social_links, '']
    }));
  };

  const removeSocialLink = (index: number) => {
    if (formData.social_links.length > 1) {
      const newSocialLinks = formData.social_links.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        social_links: newSocialLinks
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Filter out empty social links
      const cleanedData = {
        ...formData,
        social_links: formData.social_links.filter(link => link.trim() !== '')
      };

      const response = await fetch('/api/brands/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Registration Successful!</h1>
          <p className="text-slate-300 mb-8">
            Your brand has been registered successfully. You can now log in to your account.
          </p>
          <Link
            to="/login"
            className="inline-block w-full bg-blue-500 text-white py-4 rounded-2xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-800 px-6 py-8">
      <div className="w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-3xl mb-4 shadow-lg">
            <span className="text-slate-800 font-bold text-xl">C</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join CASA</h1>
          <p className="text-slate-300">Register your brand today</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <p className="text-red-600 text-sm font-medium">{errors.general}</p>
              </div>
            )}

            {/* Brand Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Brand Name *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all shadow-sm text-slate-800 placeholder-slate-400 ${
                    errors.name ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  placeholder="Enter your brand name"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Logo URL
              </label>
              <div className="relative">
                <Camera className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm text-slate-800 placeholder-slate-400"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-4 bg-slate-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm text-slate-800 placeholder-slate-400 resize-none"
                placeholder="Tell us about your brand..."
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm text-slate-800 placeholder-slate-400"
                  placeholder="https://yourbrand.com"
                />
              </div>
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Social Links
              </label>
              <div className="space-y-3">
                {formData.social_links.map((link, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm text-slate-800 placeholder-slate-400"
                      placeholder="https://instagram.com/yourbrand"
                    />
                    {formData.social_links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="w-10 h-10 bg-red-100 text-red-500 rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Social Link</span>
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all shadow-sm text-slate-800 placeholder-slate-400 ${
                    errors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-4 bg-slate-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:bg-white transition-all shadow-sm text-slate-800 placeholder-slate-400 ${
                    errors.password ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="w-full bg-black text-white py-4 rounded-2xl font-semibold hover:bg-slate-900 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Creating Account...' : 'Create Brand Account'}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrandSignup;
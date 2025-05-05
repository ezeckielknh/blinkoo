import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Eye, EyeOff, Check, X } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { addToast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength whenever password changes
  useEffect(() => {
    calculatePasswordStrength(password);
  }, [password]);

  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains number
    if (/[0-9]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 4) return 'Medium';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-700';
    if (passwordStrength <= 2) return 'bg-danger';
    if (passwordStrength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const validate = () => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;
    
    if (!name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      await register(name, email, password);
      addToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        addToast(error.message, 'error');
      } else {
        addToast('Failed to create account. Please try again.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md animate-fadeIn">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 5L21 12L13 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="text-2xl font-bold ml-2 text-textLight">Blinkoo</h1>
          </Link>
          <h2 className="text-2xl font-bold">Create your account</h2>
          <p className="text-gray-400 mt-1">Join thousands of users shortening URLs with Blinkoo</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              id="name"
              type="text"
              className={`form-input ${formErrors.name ? 'border-danger' : ''}`}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {formErrors.name && <p className="mt-1 text-sm text-danger">{formErrors.name}</p>}
          </div>
          
          <div className="form-control">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              className={`form-input ${formErrors.email ? 'border-danger' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {formErrors.email && <p className="mt-1 text-sm text-danger">{formErrors.email}</p>}
          </div>
          
          <div className="form-control">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input pr-10 ${formErrors.password ? 'border-danger' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.password && <p className="mt-1 text-sm text-danger">{formErrors.password}</p>}
            
            {password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Password strength: {getStrengthLabel()}</span>
                  <span className="text-xs text-gray-400">{passwordStrength}/5</span>
                </div>
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStrengthColor()} transition-all duration-300`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center">
                    {password.length >= 8 ? (
                      <Check size={12} className="text-green-500 mr-1" />
                    ) : (
                      <X size={12} className="text-gray-500 mr-1" />
                    )}
                    <span className={password.length >= 8 ? "text-green-500" : "text-gray-500"}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center">
                    {/[A-Z]/.test(password) ? (
                      <Check size={12} className="text-green-500 mr-1" />
                    ) : (
                      <X size={12} className="text-gray-500 mr-1" />
                    )}
                    <span className={/[A-Z]/.test(password) ? "text-green-500" : "text-gray-500"}>
                      Uppercase
                    </span>
                  </div>
                  <div className="flex items-center">
                    {/[0-9]/.test(password) ? (
                      <Check size={12} className="text-green-500 mr-1" />
                    ) : (
                      <X size={12} className="text-gray-500 mr-1" />
                    )}
                    <span className={/[0-9]/.test(password) ? "text-green-500" : "text-gray-500"}>
                      Number
                    </span>
                  </div>
                  <div className="flex items-center">
                    {/[^A-Za-z0-9]/.test(password) ? (
                      <Check size={12} className="text-green-500 mr-1" />
                    ) : (
                      <X size={12} className="text-gray-500 mr-1" />
                    )}
                    <span className={/[^A-Za-z0-9]/.test(password) ? "text-green-500" : "text-gray-500"}>
                      Special character
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-control">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-input pr-10 ${formErrors.confirmPassword ? 'border-danger' : ''}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="mt-1 text-sm text-danger">{formErrors.confirmPassword}</p>
            )}
          </div>
          
          <div className="mt-2">
            <p className="text-xs text-gray-400">
              By creating an account, you agree to our{' '}
              <Link to="#" className="text-primary hover:underline">Terms of Service</Link> and{' '}
              <Link to="#" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </div>
          
          <button
            type="submit"
            className={`btn btn-primary w-full mt-6 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
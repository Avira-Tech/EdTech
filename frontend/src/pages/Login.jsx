import { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';

export default function Login() {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Validate form
  const validateForm = useCallback(() => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    return true;
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  // Password strength indicator
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = [
      password.length >= 8,
      password.length >= 12,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];
    
    score = checks.filter(Boolean).length;
    
    const levels = [
      { score: 1, label: 'Very Weak', color: 'bg-red-500' },
      { score: 2, label: 'Weak', color: 'bg-orange-500' },
      { score: 3, label: 'Fair', color: 'bg-yellow-500' },
      { score: 4, label: 'Strong', color: 'bg-green-400' },
      { score: 5, label: 'Very Strong', color: 'bg-green-500' }
    ];
    
    return levels[Math.min(score - 1, 4)] || levels[0];
  }, [password]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-600/25">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to your EduTech account</p>
        </div>

        {/* Login Form */}
        <div className="panel p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || authError) && (
              <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 text-sm animate-shake">
                {error || authError}
              </div>
            )}

            <div 
              className={`transition-all duration-200 ${
                focusedField === 'email' ? 'transform scale-[1.02]' : ''
              }`}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            >
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                icon={<Mail className="w-4 h-4" />}
                required
                autoComplete="email"
              />
            </div>

            <div 
              className={`transition-all duration-200 ${
                focusedField === 'password' ? 'transform scale-[1.02]' : ''
              }`}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            >
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  icon={<Lock className="w-4 h-4" />}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-700 bg-gray-800 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link 
                to="/forgot-password" 
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-800">
            <p className="text-sm text-gray-400 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p><span className="text-primary-400">Super Admin:</span> superadmin@edtech.com / admin123</p>
              <p><span className="text-primary-400">Admin:</span> admin@edtech.com / admin123</p>
              <p><span className="text-primary-400">Teacher:</span> john.smith@edtech.com / teacher123</p>
              <p><span className="text-primary-400">Student:</span> alice@student.com / student123</p>
            </div>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}


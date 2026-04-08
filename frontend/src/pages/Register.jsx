import { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';

export default function Register() {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const { password } = formData;
    if (!password) return { score: 0, label: '', color: '', checks: [] };
    
    const checks = [
      { label: 'At least 8 characters', passed: password.length >= 8 },
      { label: 'At least 12 characters', passed: password.length >= 12 },
      { label: 'Contains uppercase letter', passed: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letter', passed: /[a-z]/.test(password) },
      { label: 'Contains a number', passed: /[0-9]/.test(password) },
      { label: 'Contains special character', passed: /[^A-Za-z0-9]/.test(password) },
    ];
    
    const passedCount = checks.filter(c => c.passed).length;
    
    const levels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Very Weak', color: 'bg-red-500' },
      { score: 2, label: 'Weak', color: 'bg-orange-500' },
      { score: 3, label: 'Fair', color: 'bg-yellow-500' },
      { score: 4, label: 'Strong', color: 'bg-green-400' },
      { score: 5, label: 'Very Strong', color: 'bg-green-500' }
    ];
    
    return {
      score: passedCount,
      label: levels[passedCount]?.label || '',
      color: levels[passedCount]?.color || '',
      checks
    };
  }, [formData.password]);

  const validateForm = useCallback(() => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (formData.firstName.length < 2) {
      setError('First name must be at least 2 characters');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const roleOptions = [
    { value: 'student', label: 'Student', icon: BookOpen, description: 'Learn new skills' },
    { value: 'teacher', label: 'Teacher', icon: User, description: 'Share your knowledge' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-600/25">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Create Account</h1>
          <p className="text-gray-400 mt-2">Join EduTech and start learning</p>
        </div>

        {/* Register Form */}
        <div className="panel p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || authError) && (
              <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-400 text-sm animate-shake">
                {error || authError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`transition-all duration-200 ${
                  focusedField === 'firstName' ? 'transform scale-[1.02]' : ''
                }`}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
              >
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  icon={<User className="w-4 h-4" />}
                  required
                />
              </div>

              <div 
                className={`transition-all duration-200 ${
                  focusedField === 'lastName' ? 'transform scale-[1.02]' : ''
                }`}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField(null)}
              >
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

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
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                icon={<Mail className="w-4 h-4" />}
                required
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password strength meter */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden flex">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 h-full ${
                            level <= passwordStrength.score 
                              ? passwordStrength.color 
                              : 'bg-gray-700'
                          } ${level === 1 ? 'rounded-l' : ''} ${level === 5 ? 'rounded-r' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              icon={<Lock className="w-4 h-4" />}
              required
              error={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''}
            />

            {/* Password requirements */}
            {formData.password && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Password requirements:</p>
                <div className="grid grid-cols-2 gap-1">
                  {passwordStrength.checks.slice(0, 4).map((check, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs">
                      <span className={check.passed ? 'text-green-400' : 'text-gray-500'}>
                        {check.passed ? '✓' : '○'}
                      </span>
                      <span className={check.passed ? 'text-gray-300' : 'text-gray-500'}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="label">I want to</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: option.value })}
                    className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                      formData.role === option.value
                        ? 'border-primary-500 bg-primary-900/20 text-primary-400'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <option.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-primary-400 hover:underline">Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>.
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>
        </div>

        {/* Login Link */}
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}


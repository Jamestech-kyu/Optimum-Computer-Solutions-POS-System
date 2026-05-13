import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/auth';
import api from '../api/axiosInstance';

// ─── tiny reusable field ───────────────────────────────────────────────────
function Field({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        className={`
          w-full border rounded-xl px-4 py-2.5 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          placeholder:text-gray-300 transition
          ${error ? 'border-red-400' : 'border-gray-300'}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── role card ────────────────────────────────────────────────────────────
const ROLES = [
  {
    value: 'cashier',
    label: 'Cashier',
    icon: '🛒',
    description: 'Process sales and receipts',
  },
  {
    value: 'manager',
    label: 'Manager',
    icon: '📊',
    description: 'Manage products and view reports',
  },
  {
    value: 'admin',
    label: 'Admin',
    icon: '⚙️',
    description: 'Full system access',
  },
];

// ─── SIGN IN ──────────────────────────────────────────────────────────────
function SignInForm({ onGoRegister, onGoForgot }) {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [form,    setForm   ] = useState({ username: '', password: '' });
  const [error,   setError  ] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/sales');
    } catch {
      setError('Incorrect username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏪</div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-400 text-sm mt-1">Sign in to SalesERP</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Username"
          type="text"
          placeholder="Enter your username"
          value={form.username}
          onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
          autoFocus
          required
        />
        <Field
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
          required
        />

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
            ❌ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </>
          ) : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={onGoForgot}
          className="text-sm text-primary-700 hover:underline"
        >
          Forgot your password?
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Don't have an account?{' '}
          <button
            onClick={onGoRegister}
            className="text-blue-600 font-semibold hover:underline"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── CREATE ACCOUNT ───────────────────────────────────────────────────────
function CreateAccountForm({ onGoSignIn }) {
  const [step,    setStep   ] = useState(1); // 1 = role, 2 = details
  const [role,    setRole   ] = useState('');
  const [form,    setForm   ] = useState({
    first_name: '',
    last_name:  '',
    email:      '',
    phone:      '',
    username:   '',
    password:   '',
    confirm:    '',
  });
  const [errors,  setErrors ] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const setField = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  // Step 1 validation — just need a role picked
  const handleRoleNext = () => {
    if (!role) return;
    setStep(2);
  };

  // Step 2 validation
  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = 'First name is required';
    if (!form.last_name.trim())  e.last_name  = 'Last name is required';
    if (!form.email.trim())      e.email      = 'Email is required';
    if (!form.username.trim())   e.username   = 'Username is required';
    if (form.password.length < 8)
      e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm)
      e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);
    try {
      await api.post('/auth/register/', {
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email,
        phone:      form.phone,
        username:   form.username,
        password:   form.password,
        role,
      });
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data || {};
      // Map backend field errors onto our form
      setErrors({
        username: data.username?.[0],
        email:    data.email?.[0],
        general:  data.detail || data.non_field_errors?.[0],
      });
    } finally {
      setLoading(false);
    }
  };

  // ── success screen
  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Account Created!</h2>
        <p className="text-gray-500 text-sm mb-2">
          Your <span className="font-semibold capitalize">{role}</span> account has been created successfully.
        </p>
        <p className="text-gray-400 text-xs mb-6">
          An administrator may need to approve your account before you can sign in.
        </p>
        <button
          onClick={onGoSignIn}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">👤</div>
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-400 text-sm mt-1">Join SalesERP — Step {step} of 2</p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2].map(s => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* ── STEP 1: Choose role ── */}
      {step === 1 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-4">
            What is your role in the organisation?
          </p>
          <div className="space-y-3">
            {ROLES.map(r => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all
                  ${role === r.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <span className="text-3xl">{r.icon}</span>
                <div>
                  <p className={`font-semibold text-sm ${role === r.value ? 'text-blue-700' : 'text-gray-800'}`}>
                    {r.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>
                </div>
                {role === r.value && (
                  <span className="ml-auto text-blue-600 text-xl">✓</span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleRoleNext}
            disabled={!role}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      )}

      {/* ── STEP 2: Personal details ── */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Role reminder badge */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-2">
            <span className="text-lg">
              {ROLES.find(r => r.value === role)?.icon}
            </span>
            <span className="text-sm text-blue-700 font-medium capitalize">
              Registering as: {role}
            </span>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="ml-auto text-xs text-blue-500 hover:underline"
            >
              Change
            </button>
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="First Name"
              type="text"
              placeholder="John"
              value={form.first_name}
              onChange={setField('first_name')}
              error={errors.first_name}
              required
            />
            <Field
              label="Last Name"
              type="text"
              placeholder="Doe"
              value={form.last_name}
              onChange={setField('last_name')}
              error={errors.last_name}
              required
            />
          </div>

          <Field
            label="Email Address"
            type="email"
            placeholder="john.doe@example.com"
            value={form.email}
            onChange={setField('email')}
            error={errors.email}
            required
          />

          <Field
            label="Phone Number (optional)"
            type="tel"
            placeholder="+254 700 000 000"
            value={form.phone}
            onChange={setField('phone')}
          />

          <Field
            label="Username"
            type="text"
            placeholder="Choose a username"
            value={form.username}
            onChange={setField('username')}
            error={errors.username}
            required
          />

          <Field
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={setField('password')}
            error={errors.password}
            required
          />

          <Field
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            value={form.confirm}
            onChange={setField('confirm')}
            error={errors.confirm}
            required
          />

          {/* Password strength indicator */}
          {form.password && (
            <PasswordStrength password={form.password} />
          )}

          {errors.general && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
              ❌ {errors.general}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : 'Create Account'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <button
            onClick={onGoSignIn}
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── PASSWORD STRENGTH ────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters',     pass: password.length >= 8          },
    { label: 'Uppercase letter',  pass: /[A-Z]/.test(password)        },
    { label: 'Number',            pass: /[0-9]/.test(password)        },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? colors[score - 1] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        score <= 1 ? 'text-red-500' :
        score === 2 ? 'text-orange-500' :
        score === 3 ? 'text-yellow-600' : 'text-green-600'
      }`}>
        {labels[score - 1] || 'Too weak'}
      </p>
      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <p key={c.label} className={`text-xs flex items-center gap-1 ${c.pass ? 'text-green-600' : 'text-gray-400'}`}>
            <span>{c.pass ? '✓' : '○'}</span> {c.label}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
function ForgotPasswordForm({ onGoSignIn }) {
  const [email,   setEmail  ] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent   ] = useState(false);
  const [error,   setError  ] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/password-reset/', { email });
      setSent(true);
    } catch {
      // Show success even on error — security best practice
      // (don't reveal whether the email exists in the system)
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm mb-1">
          If an account exists for <span className="font-semibold">{email}</span>,
        </p>
        <p className="text-gray-500 text-sm mb-8">
          a password reset link has been sent.
        </p>
        <button
          onClick={onGoSignIn}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🔐</div>
        <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
        <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
          Enter the email address linked to your account and we'll send a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          autoFocus
          required
        />

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </>
          ) : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <button
          onClick={onGoSignIn}
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────
// This is what App.jsx uses. It switches between the three forms above.
export default function LoginPage() {
  const [view, setView] = useState('signin'); // 'signin' | 'register' | 'forgot'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-gray-100">
        {view === 'signin'   && (
          <SignInForm
            onGoRegister={() => setView('register')}
            onGoForgot={()   => setView('forgot')}
          />
        )}
        {view === 'register' && (
          <CreateAccountForm
            onGoSignIn={() => setView('signin')}
          />
        )}
        {view === 'forgot'   && (
          <ForgotPasswordForm
            onGoSignIn={() => setView('signin')}
          />
        )}
      </div>
    </div>
  );
}
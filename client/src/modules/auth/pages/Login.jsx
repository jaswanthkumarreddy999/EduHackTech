import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight, Loader2, User, Key, Mail, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  // State
  // Steps: 'email' -> 'otp-login' (Existing) OR 'name-input' -> 'otp-register' (New)
  const [step, setStep] = useState('email'); 
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Check Email Logic
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      setTimeout(async () => {
         if (data.exists) {
            // EXISTING USER: Send OTP immediately and go to Login
            await sendOtpToUser();
            setStep('otp-login'); 
          } else {
            // NEW USER: Ask for Name first
            setStep('name-input');
          }
          setIsLoading(false);
      }, 600);
    } catch (err) {
      setError('Connection failed.');
      setIsLoading(false);
    }
  };

  // Helper: Send OTP
  const sendOtpToUser = async () => {
    await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
  };

  // 2. Handle Name Submit (For New Users)
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Send OTP now that we have the name
    await sendOtpToUser();
    setIsLoading(false);
    setStep('otp-register');
  };

  // 3. Login with OTP (Existing Users)
  const handleLoginOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const res = await fetch('http://localhost:5000/api/auth/login-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });
        const data = await res.json();
        
        if (data.success) {
            loginUser(data.user, data.token);
            navigate('/'); 
        } else {
            setError(data.message);
        }
    } catch (err) {
        setError('Login failed');
    } finally {
        setIsLoading(false);
    }
  };

  // 4. Register with OTP (New Users)
  const handleRegisterOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, otp }) 
        });
        const data = await res.json();
        if(data.success) {
            loginUser(data.user, data.token);
            navigate('/');
        } else {
            setError(data.message);
        }
    } catch (err) {
        setError('Registration failed');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#020617] selection:bg-indigo-500/30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent blur-3xl pointer-events-none"></div>
      
      <div className="relative w-full max-w-[440px] bg-white rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] p-8 md:p-12 z-10 transition-all duration-500 hover:shadow-[0_40px_70px_-10px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
        
        <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                {step === 'email' && 'Welcome'}
                {step === 'name-input' && 'What should we call you?'}
                {(step === 'otp-login' || step === 'otp-register') && 'Verify Identity'}
            </h2>
            <p className="text-slate-500 font-medium text-sm">
               {step === 'email' ? 'Enter email to continue' : email}
            </p>
        </div>

        {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3 animate-shake">
                <ShieldCheck size={18} /> {error}
            </div>
        )}

        {/* STEP 1: EMAIL */}
        {step === 'email' && (
            <form onSubmit={handleCheckEmail} className="flex flex-col gap-6 animate-fadeIn">
                <div className="relative group">
                    <Mail className="absolute left-5 top-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors h-5 w-5" />
                    <input type="email" required className="w-full pl-14 pr-5 py-4.5 rounded-2xl bg-[#020617] border-2 border-slate-100 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all duration-300 shadow-inner" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
                </div>
                <button disabled={isLoading} className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base hover:shadow-lg transition-all duration-300 flex justify-center items-center gap-2 mt-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Continue'} <ArrowRight size={20} />
                </button>
            </form>
        )}

        {/* STEP 2: NAME (Only for New Users) */}
        {step === 'name-input' && (
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-6 animate-fadeIn">
                <div className="relative group">
                    <User className="absolute left-5 top-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors h-5 w-5" />
                    <input type="text" required className="w-full pl-14 pr-5 py-4.5 rounded-2xl bg-[#020617] border-2 border-slate-100 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all duration-300 shadow-inner" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                </div>
                <button disabled={isLoading} className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base hover:shadow-lg transition-all duration-300 flex justify-center items-center gap-2 mt-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Send OTP'} <ArrowRight size={20} />
                </button>
            </form>
        )}

        {/* STEP 3: OTP (Shared for Login & Register) */}
        {(step === 'otp-login' || step === 'otp-register') && (
            <form onSubmit={step === 'otp-login' ? handleLoginOtp : handleRegisterOtp} className="flex flex-col gap-6 animate-fadeIn">
                <div className="relative group">
                    <Key className="absolute left-5 top-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors h-5 w-5" />
                    <input type="text" required className="w-full pl-14 pr-5 py-4.5 rounded-2xl bg-[#020617] border-2 border-slate-100 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all duration-300 tracking-[0.5em] font-mono text-center shadow-inner" placeholder="0000" value={otp} onChange={(e) => setOtp(e.target.value)} autoFocus />
                </div>
                <button className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base hover:shadow-lg transition-all duration-300 flex justify-center items-center gap-2 mt-2">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
                </button>
                <button type="button" onClick={() => setStep('email')} className="text-slate-400 text-sm font-medium hover:text-indigo-600 transition-colors">Change Email</button>
            </form>
        )}

      </div>
      <div className="absolute bottom-8 text-slate-600 text-xs font-medium tracking-wide">Secure Passwordless Login</div>
    </div>
  );
};

export default Login;
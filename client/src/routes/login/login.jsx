import React, { useContext, useState } from "react";
// NOTE: Replaced original "./login.scss" import with inline <style> block below.
import { Link, useNavigate } from "react-router-dom";
// Assuming apiRequest and AuthContext are correctly configured in your environment
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";

// --- START: SVG Icon Definitions (Required for the new UI structure) ---
// These mimic the icons used in the commented-out file structure.
const User = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Key = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 20A8 8 0 0 0 20 10V4h-6L6 14l2 4 4-2Z"/><circle cx="14" cy="14" r="2"/><circle cx="17.5" cy="6.5" r=".5"/></svg>;
const Mail = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const CheckCircle = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;
const ArrowRight = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>;
const Loader = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4m3 12-2-2m-6 0-2 2m0-6H4m12 3 2 2m0-6 2-2M7 7 5 5m12 0 2 2M12 18v4m-3-3 2-2m6 0L15 6m-3-3L12 6M6 9H4"/></svg>;
const Sparkles = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3m-3 3 1.5 1.5m6 0L15 6m3 3-1.5 1.5M6 18h12m-3-3 1.5-1.5m-6 0L9 15m0 3 1.5-1.5m6 0-1.5-1.5M12 21v-3"/></svg>;
const Shield = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const Home = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const FaEye = ({ size = 20, className = "" }) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const FaEyeSlash = ({ size = 20, className = "" }) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7"/><path d="M6.28 17.72 2 22m15.46-3.82L22 22m-7.22-7.22-4.54-4.54"/><circle cx="12" cy="12" r="3"/><path d="M1.3 1.3 22.7 22.7"/></svg>;
// --- END: SVG Icon Definitions ---

function Login() {
    // Original State and Context Logic
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // New State for UI enhancement (Show Password, Input Focus)
    const [showPassword, setShowPassword] = useState(false);
    const [usernameFocused, setUsernameFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    // Helper function for input focus style (from commented code)
    const getStyle = (isFocused) => {
        const baseColor = "#9CA3AF";
        const focusedColor = "#3B82F6";
        return {
            color: isFocused ? focusedColor : baseColor,
            transition: 'color 0.3s'
        };
    };

    // Original handleSubmit Logic (Kept intact)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        const formData = new FormData(e.target);

        const username = formData.get("username");
        const password = formData.get("password");

        try {
            // Your original apiRequest call is preserved
            const res = await apiRequest.post("/auth/login", {
                username,
                password,
            });

            // Your original context update is preserved
            updateUser(res.data);

            navigate("/");
        } catch (err) {
            console.error("Login Error:", err);
            // Handling error based on common response structure
            setError(err.response?.data?.message || "Login failed due to network error.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* START: Pure CSS/SCSS Output Block from the commented code */}
            <style>
                {`
                /* CSS Reset and Base Styles */
                .login-page * {
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }
                .login-page {
                    min-height: 100vh;
                    position: relative;
                    overflow: hidden;
                    background-color: #f7f9fc; /* Light background */
                }
                .text-blue-500 { color: #3b82f6; }
                .text-gray-700 { color: #374151; }
                .text-gray-600 { color: #4b5563; }
                .text-gray-800 { color: #1f2937; }
                .text-gray-500 { color: #6b7280; }
                .text-error { 
                    color: #ef4444; 
                    margin-top: 0.75rem; 
                    text-align: center; 
                    font-weight: 500;
                    background-color: #fee2e2;
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    border: 1px solid #f87171;
                }

                /* --- Background and Animated Elements --- */
                .bg-main {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom right, #eff6ff, #eef2ff, #f5f3ff);
                }
                .bg-main::before, .bg-main::after, .bg-blob {
                    content: '';
                    position: absolute;
                    inset: 0;
                }
                .bg-main::before {
                    background: linear-gradient(to top right, rgba(219, 234, 254, 0.3), transparent, rgba(237, 233, 254, 0.3));
                }
                .bg-main::after {
                    background: linear-gradient(to bottom left, transparent, rgba(224, 231, 255, 0.2), transparent);
                }

                /* Floating Blobs */
                @keyframes floating {
                    0%, 100% { transform: translateY(-3px); }
                    50% { transform: translateY(3px); }
                }
                .floating-blob {
                    position: absolute;
                    border-radius: 9999px;
                    filter: blur(40px);
                    opacity: 0.5;
                    animation: floating 4s infinite ease-in-out;
                }
                .blob-1 {
                    top: 5rem;
                    left: 5rem;
                    width: 8rem;
                    height: 8rem;
                    background: linear-gradient(to bottom right, rgba(96, 165, 250, 0.2), rgba(99, 102, 241, 0.2));
                    animation-delay: 0s;
                }
                .blob-2 {
                    bottom: 8rem;
                    right: 8rem;
                    width: 10rem;
                    height: 10rem;
                    background: linear-gradient(to bottom right, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2));
                    animation-delay: 1s;
                }
                .blob-3 {
                    top: 50%;
                    left: 2.5rem;
                    width: 6rem;
                    height: 6rem;
                    background: linear-gradient(to bottom right, rgba(74, 222, 128, 0.2), rgba(59, 130, 246, 0.2));
                    animation-delay: 2s;
                }
                
                /* --- Login Wrapper and Card --- */
                .login-wrapper {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    padding: 5rem 1rem;
                }
                .login-card-container {
                    width: 100%;
                    max-width: 28rem;
                }
                .login-card {
                    position: relative;
                    background-color: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(12px);
                    border-radius: 1.5rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    overflow: hidden;
                    padding: 3rem 2rem 2rem;
                }

                /* Decorative Corners */
                .card-deco-top {
                    position: absolute;
                    top: -1rem;
                    right: -1rem;
                    width: 6rem;
                    height: 6rem;
                    background: linear-gradient(to bottom right, rgba(59, 130, 246, 0.2), rgba(79, 70, 229, 0.2));
                    border-radius: 9999px;
                    filter: blur(20px);
                }
                .card-deco-bottom {
                    position: absolute;
                    bottom: -1rem;
                    left: -1rem;
                    width: 8rem;
                    height: 8rem;
                    background: linear-gradient(to bottom right, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2));
                    border-radius: 9999px;
                    filter: blur(20px);
                }

                /* --- Logo/Header Section --- */
                .header-section {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }
                .logo-link {
                    display: inline-block;
                    transition: transform 0.2s;
                }
                .logo-group {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .logo-icon-wrapper {
                    padding: 0.75rem;
                    background: linear-gradient(to bottom right, #2563eb, #4f46e5);
                    border-radius: 0.75rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    animation: pulse 2s infinite ease-in-out;
                }
                .logo-title {
                    font-size: 1.875rem;
                    font-weight: 700;
                    background-image: linear-gradient(to right, #2563eb, #4f46e5, #9333ea);
                    -webkit-background-clip: text;
                    color: transparent;
                    background-clip: text;
                }
                @keyframes sparkle {
                    0%, 100% { transform: scale(1) rotate(0deg); }
                    50% { transform: scale(1.2) rotate(180deg); }
                }
                .sparkle-icon {
                    animation: sparkle 3s infinite ease-in-out;
                    color: #facc15;
                }

                /* --- Form and Input Styles --- */
                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .input-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                }
                .input-field-wrapper {
                    position: relative;
                }
                .input-field {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3rem;
                    padding-right: 3rem; 
                    border-radius: 0.75rem;
                    background-color: rgba(249, 250, 251, 0.8);
                    backdrop-filter: blur(2px);
                    border: 1px solid #e5e7eb;
                    transition: all 0.3s;
                    color: #1f2937;
                    outline: none;
                }
                .input-field::placeholder {
                    color: #9ca3af;
                }
                .input-field:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                }

                /* Show/Hide Password Button */
                .toggle-password-btn {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                    padding: 0.25rem;
                    border-radius: 0.5rem;
                    transition: color 0.3s, background-color 0.3s;
                    cursor: pointer;
                    background: none;
                    border: none;
                }
                .toggle-password-btn:hover {
                    color: #4b5563;
                    background-color: #f3f4f6;
                }
                
                /* Forgot Password Link */
                .forgot-password-link {
                    font-size: 0.875rem;
                    color: #2563eb;
                    font-weight: 500;
                    transition: color 0.3s;
                    text-decoration: none;
                }
                .forgot-password-link:hover {
                    color: #1d4ed8;
                    text-decoration: underline;
                }

                /* --- Submit Button --- */
                .btn-submit {
                    width: 100%;
                    background: linear-gradient(to right, #2563eb, #4f46e5, #9333ea);
                    color: white;
                    padding: 1rem;
                    border-radius: 0.75rem;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.25);
                    position: relative;
                    overflow: hidden;
                    border: none;
                    cursor: pointer;
                }
                .btn-submit:disabled {
                    opacity: 0.7;
                    box-shadow: none;
                    cursor: not-allowed;
                }
                .btn-submit:hover:not(:disabled)::before {
                    opacity: 1;
                }
                .btn-submit::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to right, rgba(255, 255, 255, 0.2), transparent);
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .btn-submit:hover .icon-arrow {
                    transform: translateX(0.25rem);
                }
                .icon-arrow {
                    transition: transform 0.3s;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .loader-icon {
                    animation: spin 1s linear infinite;
                }

                /* --- Divider and Sign Up Link --- */
                .divider {
                    position: relative;
                    margin: 2rem 0;
                }
                .divider::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background-color: #d1d5db;
                    z-index: 1;
                }
                .divider-text {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    font-size: 0.875rem;
                    z-index: 2;
                }
                .divider-text span {
                    padding: 0 1rem;
                    background-color: rgba(255, 255, 255, 0.8);
                    color: #6b7280;
                    font-weight: 500;
                    /* Match card background for seamless look */
                    background-color: rgba(255, 255, 255, 0.9);
                }
                
                .btn-signup {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 0.75rem;
                    color: #374151;
                    transition: all 0.3s;
                    font-weight: 500;
                    text-decoration: none;
                }
                .btn-signup:hover {
                    background: linear-gradient(to right, #f9fafb, #eff6ff);
                    border-color: #bfdbfe;
                }
                .btn-signup:hover .icon-user {
                    color: #2563eb;
                }
                .btn-signup:hover .icon-arrow {
                    transform: translateX(0.25rem);
                }
                /* Mobile optimization for smaller screens */
                @media (max-width: 640px) {
                    .login-card {
                        padding: 2rem 1rem 1.5rem;
                        border-radius: 1rem;
                    }
                    .header-section {
                        margin-bottom: 2rem;
                    }
                }
                `}
            </style>
            {/* END: Pure CSS/SCSS Output Block */}

            {/* Enhanced Background with Animated Blobs */}
            <div className="bg-main">
                <div className="floating-blob blob-1" />
                <div className="floating-blob blob-2" />
                <div className="floating-blob blob-3" />
            </div>

            <div className="login-wrapper">
                <div className="login-card-container">
                    <div className="login-card">
                        {/* Decorative Elements */}
                        <div className="card-deco-top"></div>
                        <div className="card-deco-bottom"></div>

                        <div className="relative">
                            {/* Logo & Title Section */}
                            <div className="header-section">
                                <Link to="/" className="logo-link">
                                    <div className="logo-group">
                                        <div className="logo-icon-wrapper">
                                            <Home className="w-6 h-6 text-white" />
                                        </div>
                                        <h1 className="logo-title">
                                            PropertyHuntt
                                        </h1>
                                        <div className="sparkle-icon">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Link>

                                <div >
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back!</h2>
                                    <p className="text-gray-600 flex items-center justify-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-500" />
                                        Sign in to your secure account
                                    </p>
                                </div>
                            </div>

                            {/* Enhanced Form - Uses original handleSubmit logic */}
                            <form
                                onSubmit={handleSubmit}
                                className="login-form"
                            >
                                {/* Username Field */}
                                <div className="input-group">
                                    <label htmlFor="username" className="input-label text-gray-700">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                        Username
                                    </label>
                                    <div className="input-field-wrapper">
                                        <input
                                            type="text"
                                            name="username" // Name attribute preserved for formData logic
                                            id="username"
                                            required
                                            minLength={3}
                                            maxLength={20}
                                            onFocus={() => setUsernameFocused(true)}
                                            onBlur={() => setUsernameFocused(false)}
                                            className="input-field"
                                            placeholder="Enter username"
                                        />
                                        <div
                                            className="input-icon"
                                            style={getStyle(usernameFocused)}
                                        >
                                            <User className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="input-group">
                                    <label htmlFor="password" className="input-label text-gray-700">
                                        <Key className="w-4 h-4 text-blue-500" />
                                        Password
                                    </label>
                                    <div className="input-field-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password" // Name attribute preserved for formData logic
                                            id="password"
                                            required
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => setPasswordFocused(false)}
                                            className="input-field"
                                            placeholder="••••••••"
                                        />
                                        <div
                                            className="input-icon"
                                            style={getStyle(passwordFocused)}
                                        >
                                            <Key className="w-5 h-5" />
                                        </div>
                                        {/* Toggle Password Button */}
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="toggle-password-btn"
                                        >
                                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Forgot Password Link */}
                                <div className="flex items-center justify-end">
                                    <Link
                                        to="/forgot-password" // Placeholder link
                                        className="forgot-password-link"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Enhanced Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-submit group"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="w-5 h-5 loader-icon" />
                                            <span>Signing in...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Sign in</span>
                                            <ArrowRight className="w-5 h-5 icon-arrow" />
                                        </>
                                    )}
                                </button>
                                
                                {/* Error Display */}
                                {error && <span className="text-error">{error}</span>}

                                {/* Enhanced Divider */}
                                <div className="divider">
                                    <div className="divider-text">
                                        <span>
                                            Don&apos;t you have an account?
                                        </span>
                                    </div>
                                </div>

                                {/* Enhanced Sign Up Link (Link to /register preserved) */}
                                <div>
                                    <Link
                                        to="/register"
                                        className="btn-signup group"
                                    >
                                        <User className="w-5 h-5 text-gray-500 icon-user" />
                                        Create an account
                                        <ArrowRight className="w-4 h-4 icon-arrow" />
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

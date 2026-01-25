import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// Using the REAL dependencies
import apiRequest from "../../lib/apiRequest";
import { AuthContext } from "../../context/AuthContext";

// --- START: SVG Icon Definitions (Used in this component) ---
const User = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Key = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10 14 4-4"/><path d="M18 10a1.5 1.5 0 0 0-3 0m3 0 1.5-1.5L21 7l-1.5 1.5"/><path d="m14 6-4-4-4 4 4 4"/><path d="M12 22s-8-4-8-10 8-10 8-10 8 4 8 10-8 10-8 10Z"/></svg>;
const Mail = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const CheckCircle = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;
const ArrowRight = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
const Loader = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const Sparkles = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3m-3 3 1.5 1.5m6 0L15 6m3 3-1.5 1.5M6 18h12m-3-3 1.5-1.5m-6 0L9 15m0 3 1.5-1.5m6 0-1.5-1.5M12 21v-3"/></svg>;
const Shield = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const Home = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const FaEye = ({ size = 20, className = "" }) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const FaEyeSlash = ({ size = 20, className = "" }) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>;
const GoogleLogo = () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691L22.999 4l1.694 2.866l-16.635 11.233z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-0.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C39.999 36.31 44 30.603 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>;
// --- END: SVG Icon Definitions ---

function Login() {
    // State from Login component
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // UI State from Register component
    const [showPassword, setShowPassword] = useState(false);
    const [usernameFocused, setUsernameFocused] = useState(false); // Using this for email/username
    const [passwordFocused, setPasswordFocused] = useState(false);

    // --- Google Login useEffect (from Login component) ---
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const userData = params.get("user"); // Assuming backend might send user data

        if (token && userData) {
            try {
                // Parse user data and update context
                const user = JSON.parse(decodeURIComponent(userData));
                updateUser(user);
                
                // Store token if needed (though httpOnly cookie is primary)
                // localStorage.setItem("token", token); 

                console.log("Google login callback successful, updating user.");
                navigate("/");
            } catch (err) {
                 console.error("Failed to parse user data from Google callback:", err);
                 setError("Google login succeeded but failed to process user data.");
            }
        } else if (token) {
             // Fallback if only token is sent (e.g., page refresh after cookie set)
             // We rely on context to fetch user with the new cookie
             console.log("Google login callback detected, redirecting.");
             navigate("/");
        }
    }, [navigate, updateUser]);


    // Helper function for input focus style
    const getStyle = (isFocused) => ({
        color: isFocused ? "#3B82F6" : "#9CA3AF",
        transition: 'color 0.3s'
    });

    // --- Standard Login HandleSubmit (from Login component) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        const formData = new FormData(e.target);
        const username = formData.get("username");
        const password = formData.get("password");

        try {
            const res = await apiRequest.post("/auth/login", {
                username,
                password,
            });
            updateUser(res.data);
            navigate("/");
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Google Login Handler (from Login component) ---
    const handleGoogleLogin = () => {
        // Redirect to the backend Google auth route
        // Ensure this matches your backend's URL
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8800/api'}/auth/google`;
    };


    return (
        <div className="login-page">
            {/* START: Inline Styles (from Register component) */}
            <style>
                {`
                /* CSS Reset and Base Styles */
                .login-page * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
                .login-page { min-height: 100vh; position: relative; overflow: hidden; background-color: #f7f9fc; }
                
                /* Text Colors */
                .text-blue-500 { color: #3b82f6; }
                .text-gray-700 { color: #374151; }
                .text-gray-600 { color: #4b5563; }
                .text-gray-800 { color: #1f2937; }
                .text-gray-500 { color: #6b7280; }
                .text-error { color: #ef4444; margin-top: 0.75rem; text-align: center; font-weight: 500; background-color: #fee2e2; padding: 0.75rem 1rem; border-radius: 0.5rem; border: 1px solid #f87171; font-size: 0.9rem; }

                /* Background & Blobs */
                .bg-main { position: absolute; inset: 0; background: linear-gradient(to bottom right, #eff6ff, #eef2ff, #f5f3ff); }
                .bg-main::before, .bg-main::after { content: ''; position: absolute; inset: 0; }
                .bg-main::before { background: linear-gradient(to top right, rgba(219, 234, 254, 0.3), transparent, rgba(237, 233, 254, 0.3)); }
                .bg-main::after { background: linear-gradient(to bottom left, transparent, rgba(224, 231, 255, 0.2), transparent); }
                @keyframes floating { 0%, 100% { transform: translateY(-3px) scale(1); } 50% { transform: translateY(3px) scale(1.03); } }
                .floating-blob { position: absolute; border-radius: 9999px; filter: blur(40px); opacity: 0.4; animation: floating 6s infinite ease-in-out alternate; }
                .blob-1 { top: 5rem; left: 5rem; width: 8rem; height: 8rem; background: rgba(96, 165, 250, 0.2); animation-delay: 0s; }
                .blob-2 { bottom: 8rem; right: 8rem; width: 10rem; height: 10rem; background: rgba(168, 85, 247, 0.2); animation-delay: -2s; }
                .blob-3 { top: 40%; right: 5rem; width: 6rem; height: 6rem; background: rgba(74, 222, 128, 0.2); animation-delay: -4s; }

                /* Wrapper & Card */
                .login-wrapper { position: relative; z-index: 10; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 4rem 1rem; }
                .login-card-container { width: 100%; max-width: 28rem; }
                .login-card { position: relative; background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.6); overflow: hidden; padding: 2.5rem 2rem; }
                .card-deco-top, .card-deco-bottom { position: absolute; border-radius: 9999px; filter: blur(20px); z-index: -1; }
                .card-deco-top { top: -1.5rem; right: -1.5rem; width: 6rem; height: 6rem; background: rgba(59, 130, 246, 0.15); }
                .card-deco-bottom { bottom: -1.5rem; left: -1.5rem; width: 8rem; height: 8rem; background: rgba(147, 51, 234, 0.15); }

                /* Header */
                .header-section { text-align: center; margin-bottom: 2rem; }
                .logo-link { display: inline-block; transition: transform 0.2s; }
                .logo-link:hover { transform: scale(1.05); }
                .logo-group { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 1rem; }
                .logo-icon-wrapper { padding: 0.75rem; background: linear-gradient(to bottom right, #2563eb, #4f46e5); border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.1); display: inline-flex; }
                .logo-icon-wrapper svg { width: 1.5rem; height: 1.5rem; color: white; }
                .logo-title { font-size: 1.75rem; font-weight: 700; color: #374151; }
                .header-text h2 { font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem; }
                .header-text p { color: #4b5563; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.9rem;}
                .header-text svg { width: 1rem; height: 1rem; }
                @keyframes sparkle { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                .sparkle-icon { animation: sparkle 3s infinite ease-in-out; color: #facc15; }
                .sparkle-icon svg { width: 1.25rem; height: 1.25rem; }

                /* Form & Inputs */
                .login-form { display: flex; flex-direction: column; gap: 1.25rem; }
                .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .input-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #374151; }
                .input-label svg { width: 1rem; height: 1rem; }
                .input-field-wrapper { position: relative; }
                .input-field { width: 100%; padding: 0.9rem 1rem 0.9rem 2.75rem; padding-right: 2.75rem; border-radius: 0.75rem; background-color: rgba(249, 250, 251, 0.9); border: 1px solid #e5e7eb; transition: all 0.3s; color: #1f2937; outline: none; font-size: 0.9rem; }
                .input-field::placeholder { color: #9ca3af; }
                .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); background-color: white; }
                .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
                .input-icon svg { width: 1.25rem; height: 1.25rem; }
                .toggle-password-btn { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); color: #9ca3af; padding: 0.35rem; border-radius: 0.5rem; transition: color 0.3s, background-color 0.3s; cursor: pointer; background: none; border: none; display: flex; align-items: center; justify-content: center;}
                .toggle-password-btn:hover { color: #4b5563; background-color: #f3f4f6; }
                .forgot-password-link { font-size: 0.875rem; color: #3b82f6; font-weight: 500; transition: color 0.3s; text-decoration: none; }
                .forgot-password-link:hover { color: #1d4ed8; text-decoration: underline; }

                /* Submit Button */
                .btn-submit { width: 100%; background: linear-gradient(to right, #3b82f6, #6366f1); color: white; padding: 0.9rem 1rem; border-radius: 0.75rem; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 0.75rem; font-weight: 600; font-size: 0.95rem; box-shadow: 0 8px 15px -3px rgba(59, 130, 246, 0.3); border: none; cursor: pointer; position: relative; overflow: hidden;}
                .btn-submit:disabled { opacity: 0.6; box-shadow: none; cursor: not-allowed; }
                .btn-submit:hover:not(:disabled) { box-shadow: 0 12px 20px -3px rgba(59, 130, 246, 0.35); transform: translateY(-2px); }
                .btn-submit svg { width: 1.25rem; height: 1.25rem; }
                .btn-submit .icon-arrow { transition: transform 0.3s; }
                .btn-submit:hover:not(:disabled) .icon-arrow { transform: translateX(0.25rem); }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .loader-icon { animation: spin 1s linear infinite; }

                /* --- Google Button --- */
                .btn-google {
                    width: 100%;
                    padding: 0.9rem 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid #d1d5db;
                    background: #ffffff;
                    color: #374151;
                    font-weight: 500;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .btn-google:hover {
                    background-color: #f9fafb;
                    border-color: #adb5bd;
                }
                .btn-google img {
                    width: 20px;
                    height: 20px;
                }
                
                /* Divider & Alt Link */
                .divider { position: relative; margin: 1.25rem 0; } /* Reduced margin */
                .divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background-color: #d1d5db; z-index: 1; }
                .divider-text { position: relative; display: flex; justify-content: center; z-index: 2; }
                .divider-text span { padding: 0 0.75rem; background-color: rgba(255, 255, 255, 0.95); color: #6b7280; font-size: 0.8rem; font-weight: 500; backdrop-filter: blur(10px);}
                .btn-alt-link { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 0.9rem 1rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; color: #374151; transition: all 0.3s; font-weight: 500; text-decoration: none; background-color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;}
                .btn-alt-link:hover { background-color: #f9fafb; border-color: #d1d5db; }
                .btn-alt-link svg { width: 1.1rem; height: 1.1rem; color: #6b7280; transition: color 0.3s;}
                .btn-alt-link:hover svg.icon-user { color: #3b82f6; }
                .btn-alt-link .icon-arrow { transition: transform 0.3s; }
                .btn-alt-link:hover .icon-arrow { transform: translateX(0.25rem); }

                /* Responsive */
                @media (max-width: 640px) {
                    .login-card { padding: 2rem 1.25rem; }
                    .header-section { margin-bottom: 1.5rem; }
                    .login-form { gap: 1rem; }
                    .btn-submit, .btn-alt-link, .btn-google { padding: 0.8rem 1rem; font-size: 0.9rem;}
                    .input-field { padding: 0.8rem 1rem 0.8rem 2.5rem; padding-right: 2.5rem;}
                    .input-icon svg, .toggle-password-btn svg { width: 1.1rem; height: 1.1rem;}
                }
                `}
            </style>
            {/* END: Inline Styles */}

            {/* Background */}
            <div className="bg-main">
                <div className="floating-blob blob-1" />
                <div className="floating-blob blob-2" />
                <div className="floating-blob blob-3" />
            </div>

            {/* Content */}
            <div className="login-wrapper">
                <div className="login-card-container">
                    <div className="login-card">
                        <div className="card-deco-top"></div>
                        <div className="card-deco-bottom"></div>

                        <div style={{position: 'relative', zIndex: 1}}> {/* Content Wrapper */}
                            {/* Header */}
                            <div className="header-section">
                                <Link to="/" className="logo-link">
                                    <div className="logo-group">
                                        <div className="logo-icon-wrapper">
                                            <Home style={{ width: "1.5rem", height: "1.5rem", color: "white" }} />
                                        </div>
                                        <h1 className="logo-title">PropertyHuntt</h1>
                                        <div className="sparkle-icon">
                                            <Sparkles style={{ width: "1.25rem", height: "1.25rem" }} />
                                        </div>
                                    </div>
                                </Link>
                                <div className="header-text">
                                    <h2>Welcome back!</h2>
                                    <p>
                                         <Shield style={{ width: "1rem", height: "1rem" }} className="text-blue-500" />
                                        Sign in to your secure account
                                    </p>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="login-form" noValidate>
                                {/* Username */}
                                <div className="input-group">
                                    <label htmlFor="username" className="input-label">
                                        <Mail style={getStyle(usernameFocused)} />
                                        Username or Email
                                    </label>
                                    <div className="input-field-wrapper">
                                        <input
                                            type="text" name="username" id="username" required
                                            minLength={3}
                                            onFocus={() => setUsernameFocused(true)}
                                            onBlur={() => setUsernameFocused(false)}
                                            className="input-field" placeholder="Enter username or email"
                                        />
                                        <div className="input-icon"><Mail style={getStyle(usernameFocused)}/></div>
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="input-group">
                                    <label htmlFor="password" className="input-label">
                                        <Key style={getStyle(passwordFocused)} />
                                        Password
                                    </label>
                                    <div className="input-field-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password" id="password" required
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => setPasswordFocused(false)}
                                            className="input-field" placeholder="••••••••"
                                        />
                                        <div className="input-icon"><Key style={getStyle(passwordFocused)}/></div>
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="toggle-password-btn" aria-label={showPassword ? "Hide password" : "Show password"}>
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {/* Forgot Password Link */}
                                    <div style={{display: 'flex', justifyContent: 'flex-end', paddingTop: '0.25rem'}}>
                                        <Link to="/forgot-password" className="forgot-password-link">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button type="submit" disabled={isLoading} className="btn-submit">
                                    {isLoading ? (
                                        <> <Loader className="loader-icon" /> <span>Signing in...</span> </>
                                    ) : (
                                        <> <CheckCircle /> <span>Sign in</span> <ArrowRight className="icon-arrow" /> </>
                                    )}
                                </button>

                                {/* Error Display */}
                                {error && <p className="text-error" role="alert">{error}</p>}

                                {/* --- Google Login Button --- */}
                                <button
                                  type="button"
                                  onClick={handleGoogleLogin}
                                  className="btn-google"
                                >
                                  <GoogleLogo />
                                  Sign in with Google
                                </button>
                                {/* --- END GOOGLE BUTTON --- */}


                                {/* Divider */}
                                <div className="divider">
                                    <div className="divider-text"><span>Don't have an account?</span></div>
                                </div>

                                {/* Register Link */}
                                <div>
                                    <Link to="/register" className="btn-alt-link">
                                        <User style={{ color: "#6b7280" }} className="icon-user" />
                                        Create an account
                                        <ArrowRight className="icon-arrow" style={{ color: "#6b7280" }} />
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

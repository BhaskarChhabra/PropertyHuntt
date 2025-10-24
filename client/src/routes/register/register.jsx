import React, { useState } from "react";
// Assuming you have these components/hooks in your project
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../lib/apiRequest"; // Assuming this is your API request utility

// --- START: SVG Icon Definitions (Only Used Icons) ---
const User = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Key = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10 14 4-4"/><path d="M18 10a1.5 1.5 0 0 0-3 0m3 0 1.5-1.5L21 7l-1.5 1.5"/><path d="m14 6-4-4-4 4 4 4"/><path d="M12 22s-8-4-8-10 8-10 8-10 8 4 8 10-8 10-8 10Z"/></svg>; // Updated Key Icon (Simpler)
const Mail = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const CheckCircle = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;
const ArrowRight = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>; // Updated Arrow Icon
const Loader = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>; // Updated Loader Icon (Spinner)
const FaEye = ({ size = 20, className = "" }) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const FaEyeSlash = ({ size = 20, className = "" }) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>; // Updated EyeSlash Icon
// Removed: Sparkles, Shield, Home, Verified, Fingerprint, Globe
// --- END: SVG Icon Definitions ---

function RegisterContent() {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); // Using actual hook

    const [showPassword, setShowPassword] = useState(false);
    const [usernameFocused, setUsernameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const getStyle = (isFocused) => ({
        color: isFocused ? "#3B82F6" : "#9CA3AF",
        transition: 'color 0.3s'
    });

    const getPasswordStrength = (p) => {
        let strength = 0;
        if (p.length > 0) strength += 1;
        if (p.length >= 8) strength += 1;
        if (/[A-Z]/.test(p) || /[a-z]/.test(p)) strength += 1;
        if (/\d/.test(p)) strength += 1;
        if (/[^A-Za-z0-9]/.test(p)) strength += 1;

        const score = Math.min(5, strength);
        const percentage = (score / 5) * 100;

        let label, color;
        if (score <= 1) { label = "Too Short"; color = "#ef4444"; }
        else if (score <= 3) { label = "Medium"; color = "#f97316"; }
        else { label = "Strong"; color = "#10b981"; }

        return { percentage, label, color };
    };
    const strength = getPasswordStrength(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        const formData = new FormData(e.target);

        const username = formData.get("username");
        const email = formData.get("email");
        const passwordValue = formData.get("password"); // Renamed variable

        // Basic frontend validation
        if (!username || !email || !passwordValue) {
            setError("All fields are required.");
            setIsLoading(false);
            return;
        }
        if (passwordValue.length < 6) { // Example: Minimum password length
             setError("Password must be at least 6 characters long.");
             setIsLoading(false);
             return;
        }

        try {
            // Using actual apiRequest
            const res = await apiRequest.post("/auth/register", {
                username,
                email,
                password: passwordValue, // Use renamed variable
            });

            console.log("Registration successful:", res.data); // Log success
            navigate("/login"); // Navigate using actual hook

        } catch (err) {
            console.error("Registration Error:", err);
            // Extract error message reliably
            const message = err.response?.data?.message || err.message || "Registration failed. Please try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Inline Styles */}
            <style>
                {`
                /* Basic Reset */
                .login-page * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
                .login-page { min-height: 100vh; position: relative; overflow: hidden; background-color: #f7f9fc; }

                /* Text Colors */
                .text-blue-500 { color: #3b82f6; }
                .text-green-500 { color: #10b981; }
                .text-purple-500 { color: #8b5cf6; } /* Adjusted purple */
                .text-gray-700 { color: #374151; }
                .text-gray-600 { color: #4b5563; }
                .text-gray-800 { color: #1f2937; }
                .text-gray-500 { color: #6b7280; }
                .text-error { color: #ef4444; margin-top: 0.75rem; text-align: center; font-weight: 500; background-color: #fee2e2; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #f87171; font-size: 0.875rem;}

                /* Background Gradient & Blobs */
                .bg-main { position: absolute; inset: 0; background: linear-gradient(to bottom right, #eff6ff, #eef2ff, #f5f3ff); }
                .bg-main::before, .bg-main::after { content: ''; position: absolute; inset: 0; }
                .bg-main::before { background: linear-gradient(to top right, rgba(219, 234, 254, 0.3), transparent, rgba(237, 233, 254, 0.3)); }
                .bg-main::after { background: linear-gradient(to bottom left, transparent, rgba(224, 231, 255, 0.2), transparent); }
                @keyframes floating { 0%, 100% { transform: translateY(-3px) scale(1); } 50% { transform: translateY(3px) scale(1.03); } }
                .floating-blob { position: absolute; border-radius: 9999px; filter: blur(40px); opacity: 0.4; animation: floating 6s infinite ease-in-out alternate; }
                .blob-1 { top: 5rem; left: 5rem; width: 8rem; height: 8rem; background: rgba(96, 165, 250, 0.2); animation-delay: 0s; }
                .blob-2 { bottom: 8rem; right: 8rem; width: 10rem; height: 10rem; background: rgba(168, 85, 247, 0.2); animation-delay: -2s; }
                .blob-3 { top: 40%; right: 5rem; width: 6rem; height: 6rem; background: rgba(74, 222, 128, 0.2); animation-delay: -4s; }

                /* Login Wrapper & Card */
                .login-wrapper { position: relative; z-index: 10; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 4rem 1rem; }
                .login-card-container { width: 100%; max-width: 28rem; }
                .login-card { position: relative; background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 1.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid rgba(255, 255, 255, 0.6); overflow: hidden; padding: 2.5rem 2rem; }

                /* Card Decorations */
                .card-deco-top, .card-deco-bottom { position: absolute; border-radius: 9999px; filter: blur(20px); z-index: -1; }
                .card-deco-top { top: -1.5rem; right: -1.5rem; width: 6rem; height: 6rem; background: rgba(59, 130, 246, 0.15); }
                .card-deco-bottom { bottom: -1.5rem; left: -1.5rem; width: 8rem; height: 8rem; background: rgba(147, 51, 234, 0.15); }

                /* Header Section */
                .header-section { text-align: center; margin-bottom: 2rem; }
                .logo-link { display: inline-block; transition: transform 0.2s; }
                .logo-link:hover { transform: scale(1.05); }
                .logo-group { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 1rem; }
                .logo-icon-wrapper { padding: 0.75rem; background: linear-gradient(to bottom right, #3b82f6, #6366f1); border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.1); display: inline-flex; }
                .logo-icon-wrapper svg { width: 1.5rem; height: 1.5rem; color: white; } /* Ensure Home icon is sized */
                .logo-title { font-size: 1.75rem; font-weight: 700; color: #374151; }
                .header-text h2 { font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem; }
                .header-text p { color: #4b5563; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.9rem;}
                .header-text svg { width: 1rem; height: 1rem; } /* Size for Shield icon */

                /* Form & Inputs */
                .login-form { display: flex; flex-direction: column; gap: 1.25rem; }
                .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .input-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #374151; }
                .input-label svg { width: 1rem; height: 1rem; } /* Size icons in label */
                .input-field-wrapper { position: relative; }
                .input-field { width: 100%; padding: 0.9rem 1rem 0.9rem 2.75rem; padding-right: 2.75rem; border-radius: 0.75rem; background-color: rgba(249, 250, 251, 0.9); border: 1px solid #e5e7eb; transition: all 0.3s; color: #1f2937; outline: none; font-size: 0.9rem; }
                .input-field::placeholder { color: #9ca3af; }
                .input-field:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); background-color: white; }
                .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
                .input-icon svg { width: 1.25rem; height: 1.25rem; } /* Size icons in input */

                /* Show/Hide Password */
                .toggle-password-btn { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); color: #9ca3af; padding: 0.35rem; border-radius: 0.5rem; transition: color 0.3s, background-color 0.3s; cursor: pointer; background: none; border: none; display: flex; align-items: center; justify-content: center;}
                .toggle-password-btn:hover { color: #4b5563; background-color: #f3f4f6; }

                /* Password Strength */
                .strength-meter-container { margin-top: -0.25rem; margin-bottom: 0.75rem; }
                .strength-bar-bg { background-color: #e5e7eb; width: 100%; height: 6px; border-radius: 9999px; overflow: hidden;}
                .strength-bar { height: 100%; border-radius: 9999px; transition: width 0.4s ease-in-out, background-color 0.4s; }
                .strength-label { font-size: 0.75rem; font-weight: 500; margin-top: 0.25rem; color: #4b5563; }
                .strength-label span { font-weight: 600; }

                /* Submit Button */
                .btn-submit { width: 100%; background: linear-gradient(to right, #3b82f6, #6366f1); color: white; padding: 0.9rem 1rem; border-radius: 0.75rem; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 0.75rem; font-weight: 600; font-size: 0.95rem; box-shadow: 0 8px 15px -3px rgba(59, 130, 246, 0.3); border: none; cursor: pointer; position: relative; overflow: hidden;}
                .btn-submit:disabled { opacity: 0.6; box-shadow: none; cursor: not-allowed; }
                .btn-submit:hover:not(:disabled) { box-shadow: 0 12px 20px -3px rgba(59, 130, 246, 0.35); transform: translateY(-2px); }
                .btn-submit svg { width: 1.25rem; height: 1.25rem; }
                .btn-submit .icon-arrow { transition: transform 0.3s; }
                .btn-submit:hover:not(:disabled) .icon-arrow { transform: translateX(0.25rem); }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .loader-icon { animation: spin 1s linear infinite; }

                /* Divider & Alt Link */
                .divider { position: relative; margin: 1.75rem 0; }
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
                    .btn-submit, .btn-alt-link { padding: 0.8rem 1rem; font-size: 0.9rem;}
                    .input-field { padding: 0.8rem 1rem 0.8rem 2.5rem; padding-right: 2.5rem;}
                    .input-icon svg, .toggle-password-btn svg { width: 1.1rem; height: 1.1rem;}
                }
                `}
            </style>

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
                                            {/* Assuming you have a Home icon */}
                                            {/* If not using react-icons, replace with <img> or SVG */}
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.68-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.69Z"/><path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.43Z"/></svg>
                                        </div>
                                        <h1 className="logo-title">PropertyHuntt</h1>
                                    </div>
                                </Link>
                                <div className="header-text">
                                    <h2>Join the Community!</h2>
                                    <p>
                                        {/* Assuming Shield icon */}
                                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500"><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.177A7.547 7.547 0 0 1 6.648 6.61a.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" /></svg>
                                        Create your secure account
                                    </p>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="login-form" noValidate>
                                {/* Username */}
                                <div className="input-group">
                                    <label htmlFor="username" className="input-label">
                                        <User style={getStyle(usernameFocused)} /> Username
                                    </label>
                                    <div className="input-field-wrapper">
                                        <input
                                            type="text" name="username" id="username" required
                                            minLength={3} maxLength={20}
                                            onFocus={() => setUsernameFocused(true)}
                                            onBlur={() => setUsernameFocused(false)}
                                            className="input-field" placeholder="Choose a username"
                                            aria-describedby="username-error"
                                        />
                                        <div className="input-icon"><User style={getStyle(usernameFocused)}/></div>
                                    </div>
                                    {/* Add aria-live region for potential username errors */}
                                     <div id="username-error" aria-live="polite" style={{ height: '1rem' }}></div>
                                </div>

                                {/* Email */}
                                <div className="input-group">
                                    <label htmlFor="email" className="input-label">
                                        <Mail style={getStyle(emailFocused)} /> Email
                                    </label>
                                    <div className="input-field-wrapper">
                                        <input
                                            type="email" name="email" id="email" required
                                            onFocus={() => setEmailFocused(true)}
                                            onBlur={() => setEmailFocused(false)}
                                            className="input-field" placeholder="your@email.com"
                                            aria-describedby="email-error"
                                        />
                                        <div className="input-icon"><Mail style={getStyle(emailFocused)}/></div>
                                    </div>
                                     <div id="email-error" aria-live="polite" style={{ height: '1rem' }}></div>
                                </div>

                                {/* Password */}
                                <div className="input-group">
                                    <label htmlFor="password" className="input-label">
                                        <Key style={getStyle(passwordFocused)} /> Password
                                    </label>
                                    <div className="input-field-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password" id="password" required
                                            value={password} onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => setPasswordFocused(false)}
                                            className="input-field" placeholder="••••••••"
                                            aria-describedby="password-strength password-error"
                                        />
                                        <div className="input-icon"><Key style={getStyle(passwordFocused)}/></div>
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="toggle-password-btn" aria-label={showPassword ? "Hide password" : "Show password"}>
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                     {/* Password Strength Meter */}
                                    {password.length > 0 && (
                                        <div className="strength-meter-container" id="password-strength">
                                             <p className="strength-label">
                                                Password strength: <span style={{ color: strength.color }}>{strength.label}</span>
                                             </p>
                                             <div className="strength-bar-bg">
                                                 <div className="strength-bar" style={{ width: `${strength.percentage}%`, backgroundColor: strength.color }}/>
                                             </div>
                                         </div>
                                    )}
                                     <div id="password-error" aria-live="polite" style={{ height: '1rem' }}></div>
                                </div>

                                {/* Submit Button */}
                                <button type="submit" disabled={isLoading} className="btn-submit">
                                    {isLoading ? (
                                        <> <Loader className="loader-icon" /> <span>Creating Account...</span> </>
                                    ) : (
                                        <> <CheckCircle /> <span>Create Account</span> <ArrowRight className="icon-arrow" /> </>
                                    )}
                                </button>

                                {/* Error Display */}
                                {error && <p className="text-error" role="alert">{error}</p>}

                                {/* Divider */}
                                <div className="divider">
                                    <div className="divider-text"><span>Already joined?</span></div>
                                </div>

                                {/* Login Link */}
                                <div>
                                    <Link to="/login" className="btn-alt-link">
                                        <User className="icon-user" /> Sign in to your account <ArrowRight className="icon-arrow" />
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

// Wrapper component remains the same
const Register = () => {
    return <RegisterContent />;
}

export default Register;

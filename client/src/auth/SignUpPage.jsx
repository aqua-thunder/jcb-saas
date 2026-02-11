import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Logo from "../assets/jcblogo.png";

import { useToast } from "../store/ToastContext";
import AnimatedBackground from "../components/ui/AnimatedBackground";


export default function SignUpPage() {
  const { toast } = useToast();
  const navigate = useNavigate();


  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculateStrength = (password) => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    if (name === "password") {
      setPasswordStrength(calculateStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Frontend validation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError("Password must contain at least one uppercase letter");
      toast.error("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setError("Password must contain at least one number");
      toast.error("Password must contain at least one number");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(form.password)) {
      setError("Password must contain at least one symbol");
      toast.error("Password must contain at least one symbol");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:7000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        toast.error(data.message || "Signup failed");
        return;
      }

      // 🟢 SUCCESS TOAST
      toast.success("Account created successfully! Please login 👋");

      // ✅ Redirect to LOGIN page after signup
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setError("Server error. Please try again.");
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-[var(--text-secondary)] relative">
      <AnimatedBackground />
      <div className="w-full max-w-md bg-white backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] border border-white/40 relative z-10 transition-all duration-300">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center mb-2">
          Create Account
        </h1>
        <p className="text-center text-sm mb-8">
          Join us and manage your work smarter
        </p>

        {/* Error text (kept as-is) */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <Input
            label="Full Name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* Password Strength Meter */}
          {form.password && (
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider">
                <span className="text-gray-500">Strength</span>
                <span className={
                  passwordStrength <= 1 ? "text-red-500" :
                    passwordStrength === 2 ? "text-yellow-600" :
                      "text-green-600"
                }>
                  {passwordStrength <= 1 ? "Weak" :
                    passwordStrength === 2 ? "Medium" : "Strong"}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                <div className={`h-full flex-1 transition-all duration-500 ${passwordStrength >= 1 ? (passwordStrength <= 1 ? 'bg-red-500' : passwordStrength === 2 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                <div className={`h-full flex-1 transition-all duration-500 ${passwordStrength >= 2 ? (passwordStrength === 2 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                <div className={`h-full flex-1 transition-all duration-500 ${passwordStrength >= 3 ? (passwordStrength === 3 ? 'bg-green-500' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                <div className={`h-full flex-1 transition-all duration-500 ${passwordStrength >= 4 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                <div className={`text-[9px] flex items-center gap-1 ${form.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-1 h-1 rounded-full ${form.password.length >= 8 ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                  8+ Char
                </div>
                <div className={`text-[9px] flex items-center gap-1 ${/[A-Z]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(form.password) ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                  Aa
                </div>
                <div className={`text-[9px] flex items-center gap-1 ${/[0-9]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(form.password) ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                  123
                </div>
                <div className={`text-[9px] flex items-center gap-1 ${/[^A-Za-z0-9]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(form.password) ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                  #$!
                </div>
              </div>
            </div>
          )}

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          {/* Button */}
          <Button
            type="primary"
            className="w-full"
            disabled={loading}
            htmlType="submit"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm mt-8">
          Already have an account?{" "}
          <a
            href="/"
            className="text-[#fc8e00] font-medium hover:underline"
          >
            Sign In
          </a>
        </p>

      </div>
    </div>
  );
}

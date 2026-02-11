import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Logo from "../assets/jcblogo.png";
import { useAuth } from "../store/auth";
import { useToast } from "../store/ToastContext";
import AnimatedBackground from "../components/ui/AnimatedBackground";


export default function SignInPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { storeToken } = useAuth();


  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:7000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      // ❌ WRONG EMAIL / PASSWORD
      if (!res.ok) {
        const message = data.message || "Invalid email or password";
        setError(message);
        toast.error(message);
        return;
      }

      // ✅ Store token using the context function
      storeToken(data.token, form.remember);

      // ✅ Store user data
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🟢 SUCCESS TOAST
      toast.success(`Welcome back, ${data.user?.fullName || "User"} 👋`);

      // ✅ Redirect after login
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");

      // ❌ SERVER ERROR TOAST
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-[var(--text-secondary)] relative">
      <AnimatedBackground />



      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] border border-white/40 relative z-10 transition-all duration-300">
        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-sm mb-6">
          Sign in to continue to your account
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

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

          <div className="flex justify-end text-sm">
            <Link
              to="/forgot-password"
              className="text-[var(--color-primary)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="primary"
            className="w-full"
            disabled={loading}
            htmlType="submit"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm mt-8">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-[#fc8e00] font-medium hover:underline"
          >
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}

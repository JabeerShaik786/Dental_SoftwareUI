"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password strength calculation
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState("Weak");
  const [strengthColor, setStrengthColor] = useState("bg-red-500");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordVal = watch("password", "");

  useEffect(() => {
    let score = 0;
    if (!passwordVal) {
      setPasswordStrength(0);
      setStrengthLabel("Very Weak");
      setStrengthColor("bg-slate-300");
      return;
    }
    
    if (passwordVal.length >= 8) score += 25;
    if (/[A-Z]/.test(passwordVal)) score += 25;
    if (/[0-9]/.test(passwordVal)) score += 25;
    if (/[^a-zA-Z0-9]/.test(passwordVal)) score += 25;

    setPasswordStrength(score);

    if (score <= 25) {
      setStrengthLabel("Weak");
      setStrengthColor("bg-red-500");
    } else if (score <= 50) {
      setStrengthLabel("Fair");
      setStrengthColor("bg-orange-500");
    } else if (score <= 75) {
      setStrengthLabel("Good");
      setStrengthColor("bg-amber-500");
    } else {
      setStrengthLabel("Strong");
      setStrengthColor("bg-emerald-500");
    }
  }, [passwordVal]);

  const onSubmit = async (data: ResetPasswordSchemaType) => {
    setIsLoading(true);
    
    // Simulate API Request
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSuccess(true);
    
    // Auto redirect after 2s
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <AuthLayout
      title={!isSuccess ? "Reset Password" : ""}
      subtitle={!isSuccess ? "Please enter a new password for your clinic account." : ""}
    >
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-6"
          >
            <div className="mb-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[16px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* New Password */}
              <div className="space-y-4">
                <Label htmlFor="password" className="text-[#334155] dark:text-slate-300 font-medium text-[16px] block">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-[18px] top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`h-[56px] pl-[52px] pr-[50px] rounded-[14px] bg-white/22 border text-[17px] font-normal text-[#0F172A] placeholder-[#64748B] ${
                      errors.password
                        ? "border-red-400 focus-visible:ring-4 focus-visible:ring-red-455/10 focus-visible:border-red-400"
                        : "border-white/28 focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500"
                    }`}
                    disabled={isLoading}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[18px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-650 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Password Strength Indicator */}
              {passwordVal && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Password Strength:</span>
                    <span className={
                      passwordStrength <= 25 ? "text-red-600" :
                      passwordStrength <= 50 ? "text-orange-500" :
                      passwordStrength <= 75 ? "text-amber-500" : "text-emerald-600"
                    }>
                      {strengthLabel}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className={`h-1.5 rounded-full ${strengthColor}`} />
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Must be 8+ chars and contain uppercase, lowercase, numbers, and special symbols.
                  </p>
                </div>
              )}

              {/* Confirm Password */}
              <div className="space-y-4">
                <Label htmlFor="confirmPassword" className="text-[#334155] dark:text-slate-300 font-medium text-[16px] block">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-[18px] top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`h-[56px] pl-[52px] pr-[50px] rounded-[14px] bg-white/22 border text-[17px] font-normal text-[#0F172A] placeholder-[#64748B] ${
                      errors.confirmPassword
                        ? "border-red-400 focus-visible:ring-4 focus-visible:ring-red-455/10 focus-visible:border-red-400"
                        : "border-white/28 focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-500"
                    }`}
                    disabled={isLoading}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-[18px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 focus:outline-none"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-650 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-[56px] mt-8 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 shadow-md shadow-blue-500/10 font-semibold text-[17px] rounded-[14px] flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center text-center p-4"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-6 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-8 w-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Password Reset Successful</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed dark:text-slate-400">
              Your password has been changed. Auto-redirecting to the sign-in page...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}

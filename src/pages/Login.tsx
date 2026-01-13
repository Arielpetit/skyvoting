import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import { Mail, AtSign, ArrowRight, Sparkles } from "lucide-react";

// Google login commented out as per user request
/*
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);
*/

export const Login = () => {
    const [loading, setLoading] = useState(false);
    const [emailPrefix, setEmailPrefix] = useState("");
    const [domain, setDomain] = useState("@adorsys.com");
    const { toast } = useToast();

    /*
    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: window.location.origin,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            toast({
                title: "Error logging in",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
    */

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailPrefix) {
            toast({
                title: "Email required",
                description: "Please enter your email prefix.",
                variant: "destructive",
            });
            return;
        }

        const email = `${emailPrefix.trim()}${domain}`;

        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin,
                },
            });

            if (error) throw error;

            toast({
                title: "Magic link sent!",
                description: `Check your email (${email}) for the login link.`,
            });
            setEmailPrefix("");
        } catch (error: any) {
            toast({
                title: "Error sending magic link",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white p-4">
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    className="w-full max-w-[440px]"
                >
                    <Card className="border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white/90 backdrop-blur-md overflow-hidden rounded-[2rem]">
                        <CardHeader className="text-center pt-12 pb-6">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
                                className="mx-auto mb-6 flex items-center justify-center relative"
                            >
                                <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl scale-150" />
                                <img src={logo} alt="SkyEngPro Logo" className="h-20 object-contain relative z-10" />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-2"
                            >
                                <CardTitle className="text-4xl font-black tracking-tight text-slate-900">
                                    SkyVoting
                                </CardTitle>
                                <CardDescription className="text-slate-500 text-base font-medium">
                                    Secure, transparent, and modern voting.
                                </CardDescription>
                            </motion.div>
                        </CardHeader>

                        <CardContent className="pb-12 px-8 sm:px-12">
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                                        <div className="h-px flex-1 bg-slate-100" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Sign in with your work email</span>
                                        <div className="h-px flex-1 bg-slate-100" />
                                    </div>

                                    <form onSubmit={handleEmailLogin} className="space-y-5">
                                        <div className="space-y-3">
                                            <div className="flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/50">
                                                <button
                                                    type="button"
                                                    onClick={() => setDomain("@adorsys.com")}
                                                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${domain === "@adorsys.com" ? "bg-white text-primary shadow-md shadow-slate-200/50 scale-[1.02]" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"}`}
                                                >
                                                    adorsys.com
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDomain("@skyengpro.com")}
                                                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${domain === "@skyengpro.com" ? "bg-white text-primary shadow-md shadow-slate-200/50 scale-[1.02]" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"}`}
                                                >
                                                    skyengpro.com
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDomain("@plooh.com")}
                                                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${domain === "@plooh.com" ? "bg-white text-primary shadow-md shadow-slate-200/50 scale-[1.02]" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"}`}
                                                >
                                                    plooh.com
                                                </button>
                                            </div>

                                            <div className="relative group flex items-center w-full h-14 rounded-2xl border border-slate-200 bg-slate-50/50 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary focus-within:bg-white transition-all shadow-sm">
                                                <div className="pl-4 pr-3 text-slate-400 group-focus-within:text-primary transition-colors shrink-0">
                                                    <Mail className="h-5 w-5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="username"
                                                    value={emailPrefix}
                                                    onChange={(e) => setEmailPrefix(e.target.value)}
                                                    className="flex-1 h-full bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 font-medium placeholder:text-slate-300 min-w-0"
                                                    disabled={loading}
                                                />
                                                <div className="pr-4 pl-2 shrink-0">
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200/50">
                                                        <AtSign className="h-3.5 w-3.5 text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{domain.replace("@", "")}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98] transition-all group"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="h-6 w-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span>Send Magic Link</span>
                                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            )}
                                        </Button>
                                    </form>

                                    <div className="bg-primary/5 rounded-2xl p-4 flex items-start gap-3 border border-primary/10">
                                        <div className="mt-1 p-1 bg-primary/10 rounded-lg">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            We'll send a secure login link to your inbox. No password required.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative pt-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-100" />
                                    </div>
                                    <div className="relative flex justify-center text-[10px] uppercase">
                                        <span className="bg-white px-4 text-slate-300 font-bold tracking-[0.3em]">Trusted by teams</span>
                                    </div>
                                </div>

                                <p className="text-center text-[11px] text-slate-400 leading-relaxed pt-2">
                                    By signing in, you agree to our <Link to="/terms" className="text-slate-600 hover:underline cursor-pointer font-medium">Terms of Service</Link> and <Link to="/privacy" className="text-slate-600 hover:underline cursor-pointer font-medium">Privacy Policy</Link>.
                                </p>
                            </motion.div>
                        </CardContent>
                    </Card>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-10 flex flex-col items-center gap-4"
                    >
                        <div className="flex items-center gap-6">
                            <span className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">Help</span>
                            <Link to="/privacy" className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">Privacy</Link>
                            <Link to="/terms" className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">Terms</Link>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                            © 2026 SkyVoting. All rights reserved.
                        </p>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};


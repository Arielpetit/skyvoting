import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export const Login = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleLogin = async () => {
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
                    className="w-full max-w-[420px]"
                >
                    <Card className="border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="text-center pt-12 pb-8">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
                                className="mx-auto mb-8 flex items-center justify-center"
                            >
                                <img src={logo} alt="SkyEngPro Logo" className="h-20 object-contain" />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-2"
                            >
                                <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    SkyVoting
                                </CardTitle>
                                <CardDescription className="text-slate-500 text-base font-medium">
                                    Secure, transparent, and modern voting.
                                </CardDescription>
                            </motion.div>
                        </CardHeader>

                        <CardContent className="pb-12 px-10">
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-8"
                            >
                                <Button
                                    variant="outline"
                                    className="w-full h-14 text-[15px] font-semibold border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-300 flex items-center justify-center gap-3 rounded-xl"
                                    onClick={handleLogin}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <GoogleIcon />
                                            <span>Continue with Google</span>
                                        </>
                                    )}
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-100" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-slate-400 font-medium tracking-wider">Trusted by teams</span>
                                    </div>
                                </div>

                                <p className="text-center text-[11px] text-slate-400 leading-relaxed">
                                    By signing in, you agree to our <span className="text-slate-600 hover:underline cursor-pointer font-medium">Terms of Service</span> and <span className="text-slate-600 hover:underline cursor-pointer font-medium">Privacy Policy</span>.
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
                            <span className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">Privacy</span>
                            <span className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">Terms</span>
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

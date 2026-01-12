import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header Background */}
            <div className="h-64 bg-slate-900 w-full absolute top-0 left-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
                <Link to="/login" className="inline-block mb-8">
                    <Button variant="ghost" className="text-slate-200 hover:text-white hover:bg-white/10 gap-2 pl-0 pr-4">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Button>
                </Link>

                <div className="space-y-8">
                    <div className="text-center md:text-left space-y-2">
                        <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-xl mb-4 border border-white/20 shadow-xl">
                            <Shield className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Privacy Policy</h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            We value your privacy and are committed to protecting your personal data.
                        </p>
                    </div>

                    <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="grid md:grid-cols-[240px_1fr] divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                {/* Sidebar Navigation (Desktop) */}
                                <div className="hidden md:block bg-slate-50/50 p-6">
                                    <div className="sticky top-6 space-y-1">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Contents</p>
                                        {["Information We Collect", "How We Use Info", "Log Files", "Cookies", "Third Party Policies", "Data Security", "Contact Us"].map((item, i) => (
                                            <a
                                                key={item}
                                                href={`#section-${i + 1}`}
                                                className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                            >
                                                {i + 1}. {item}
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 md:p-10 bg-white">
                                    <div className="prose prose-slate max-w-none prose-headings:scroll-mt-20">
                                        <p className="text-sm text-slate-400 mb-8 font-medium">Last updated: January 12, 2026</p>

                                        <div id="section-1" className="space-y-4 mb-12">
                                            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-bold">1</span>
                                                Information We Collect
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                We only collect information that is necessary for the operation of the SkyVoting service. This primarily includes your email address and basic profile information provided by Google Authentication when you sign in.
                                            </p>
                                        </div>

                                        <div id="section-2" className="space-y-4 mb-12">
                                            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-bold">2</span>
                                                How We Use Your Information
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                We use the information we collect in various ways, including to:
                                            </p>
                                            <ul className="list-disc pl-6 space-y-2 text-slate-600 marker:text-emerald-500">
                                                <li>Provide, operate, and maintain our website</li>
                                                <li>Improve, personalize, and expand our website</li>
                                                <li>Understand and analyze how you use our website</li>
                                                <li>Develop new products, services, features, and functionality</li>
                                                <li>Prevent fraudulent voting and ensure election integrity</li>
                                            </ul>
                                        </div>

                                        <div id="section-3" className="space-y-4 mb-12">
                                            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-bold">3</span>
                                                Log Files
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                SkyVoting follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics.
                                            </p>
                                        </div>

                                        <div id="section-4" className="space-y-4 mb-12">
                                            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-bold">4</span>
                                                Cookies and Web Beacons
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                Like any other website, SkyVoting uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
                                            </p>
                                        </div>

                                        <div id="section-5" className="space-y-4 mb-12">
                                            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-bold">5</span>
                                                Third Party Privacy Policies
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                SkyVoting's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information.
                                            </p>
                                        </div>

                                        <div id="section-6" className="space-y-4 mb-12">
                                            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-bold">6</span>
                                                Data Security
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
                                            </p>
                                        </div>

                                        <div id="section-7" className="space-y-4">
                                            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-bold">7</span>
                                                Contact Us
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

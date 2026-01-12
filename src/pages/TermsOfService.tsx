import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsOfService = () => {
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
                            <FileText className="h-8 w-8 text-blue-400" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Terms of Service</h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Please read these terms carefully before using our service.
                        </p>
                    </div>

                    <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="grid md:grid-cols-[240px_1fr] divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                {/* Sidebar Navigation (Desktop) */}
                                <div className="hidden md:block bg-slate-50/50 p-6">
                                    <div className="sticky top-6 space-y-1">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Contents</p>
                                        {["Acceptance", "License", "Disclaimer", "Limitations", "Accuracy", "Modifications", "Governing Law"].map((item, i) => (
                                            <a
                                                key={item}
                                                href={`#section-${i + 1}`}
                                                className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
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
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">1</span>
                                                Acceptance of Terms
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                By accessing and using SkyVoting, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
                                            </p>
                                        </div>

                                        <div id="section-2" className="space-y-4 mb-12">
                                            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">2</span>
                                                Use License
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                Permission is granted to temporarily download one copy of the materials (information or software) on SkyVoting's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                                            </p>
                                            <ul className="list-disc pl-6 space-y-2 text-slate-600 marker:text-slate-400">
                                                <li>modify or copy the materials;</li>
                                                <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                                                <li>attempt to decompile or reverse engineer any software contained on SkyVoting's website;</li>
                                                <li>remove any copyright or other proprietary notations from the materials; or</li>
                                                <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                                            </ul>
                                        </div>

                                        <div id="section-3" className="space-y-4 mb-12">
                                            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">3</span>
                                                Disclaimer
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                The materials on SkyVoting's website are provided on an 'as is' basis. SkyVoting makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                                            </p>
                                        </div>

                                        <div id="section-4" className="space-y-4 mb-12">
                                            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">4</span>
                                                Limitations
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                In no event shall SkyVoting or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SkyVoting's website, even if SkyVoting or a SkyVoting authorized representative has been notified orally or in writing of the possibility of such damage.
                                            </p>
                                        </div>

                                        <div id="section-5" className="space-y-4 mb-12">
                                            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">5</span>
                                                Accuracy of Materials
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                The materials appearing on SkyVoting's website could include technical, typographical, or photographic errors. SkyVoting does not warrant that any of the materials on its website are accurate, complete or current. SkyVoting may make changes to the materials contained on its website at any time without notice. However SkyVoting does not make any commitment to update the materials.
                                            </p>
                                        </div>

                                        <div id="section-6" className="space-y-4 mb-12">
                                            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">6</span>
                                                Modifications
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                SkyVoting may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
                                            </p>
                                        </div>

                                        <div id="section-7" className="space-y-4">
                                            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">7</span>
                                                Governing Law
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
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

export default TermsOfService;

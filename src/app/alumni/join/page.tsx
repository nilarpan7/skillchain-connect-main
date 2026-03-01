'use client';

import { useState } from 'react';
import { useWalletContext } from '@/contexts/WalletContext';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WalletConnect } from '@/components/WalletConnect';
import { autoGenerateProfile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Upload, Sparkles, BrainCircuit, CheckCircle2, ArrowRight } from 'lucide-react';
import { Ripple } from '@/components/ui/ripple';
import NeoButton from '@/components/ui/NeoButton';

export default function AlumniJoinPage() {
    const router = useRouter();
    const { activeAddress, isConnected } = useWalletContext();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const generateMutation = useMutation({
        mutationFn: async () => {
            if (!resumeFile || !activeAddress) throw new Error('Missing resume file');

            const formData = new FormData();
            formData.append('document', resumeFile);

            return autoGenerateProfile(formData, activeAddress);
        },
        onSuccess: () => {
            toast({ title: 'Profile Generated!', description: 'Your AI profile is live on the Alumni Network.' });
            queryClient.invalidateQueries({ queryKey: ['alumni'] });
            router.push('/alumni');
        },
        onError: (error: Error) => {
            toast({ title: 'Generation Failed', description: error.message, variant: 'destructive' });
        },
    });

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
                <Ripple />
                <Card className="relative z-10 w-full max-w-md bg-zinc-900 border-4 border-zinc-800 shadow-[10px_10px_0px_0px_rgba(255,255,255,0.05)] pt-6">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-black uppercase tracking-tighter outfit-bold">
                            Alumni Join
                        </CardTitle>
                        <p className="text-zinc-400 mt-2">Connect your wallet to join the network.</p>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-10">
                        <WalletConnect />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden p-6">
            <Ripple />

            <div className="absolute top-6 left-6 z-50">
                <NeoButton onClick={() => router.push('/student')} hoverText="Back">
                    Back to Dashboard
                </NeoButton>
            </div>

            <Card className="relative z-10 w-full max-w-2xl bg-zinc-900 border-4 border-zinc-800 shadow-[20px_20px_0px_0px_rgba(255,255,255,0.05)] transition-all duration-300 hover:shadow-[20px_20px_0px_0px_emerald]">
                <CardHeader className="text-center space-y-4 pt-10 pb-6 border-b border-zinc-800/50">
                    <div className="flex justify-center">
                        <div className="bg-emerald-500/10 p-4 rounded-2xl relative group">
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl group-hover:bg-emerald-500/40 transition-all"></div>
                            <Sparkles className="h-12 w-12 text-emerald-400 relative z-10" />
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-4xl font-black uppercase tracking-tighter outfit-bold text-white mb-2">
                            Join the Network
                        </CardTitle>
                        <CardDescription className="text-lg text-zinc-400 max-w-lg mx-auto">
                            Upload your PDF Resume or LinkedIn export. Our AI will automatically extract your expertise and construct your mentorship profile in seconds.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="pt-8 pb-10 px-8">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            generateMutation.mutate();
                        }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <Label className="text-zinc-400 font-bold uppercase text-sm tracking-widest flex items-center justify-between">
                                <span>Resume Document (PDF)</span>
                                {resumeFile && <span className="text-emerald-400 normal-case font-normal text-xs">{resumeFile.name}</span>}
                            </Label>
                            <div className={`relative group border-2 border-dashed rounded-xl transition-all ${resumeFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-700 bg-black/50 hover:border-emerald-500/30'} p-8 text-center`}>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                                    required
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="pointer-events-none flex flex-col items-center gap-3">
                                    {resumeFile ? (
                                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                    ) : (
                                        <Upload className="h-10 w-10 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                                    )}
                                    <p className="font-medium text-zinc-300">
                                        {resumeFile ? 'Ready for AI processing' : 'Drop your PDF resume here'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <NeoButton
                            type="submit"
                            disabled={generateMutation.isPending || !resumeFile}
                            hoverText="Generate"
                            className="w-full h-14 text-xl group"
                        >
                            {generateMutation.isPending ? (
                                <>
                                    <BrainCircuit className="h-6 w-6 mr-3 animate-pulse" />
                                    Processing PDF...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5 mr-3 text-emerald-400" />
                                    Auto-Generate Profile
                                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </NeoButton>
                    </form>
                </CardContent>
            </Card>

            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        </div>
    );
}

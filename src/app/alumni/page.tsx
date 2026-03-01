'use client';

import { useWalletContext } from '@/contexts/WalletContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WalletConnect } from '@/components/WalletConnect';
import { Shield, GraduationCap, Mail, MessageSquare, BookOpen, ExternalLink, Code, ArrowRight } from 'lucide-react';
import { Ripple } from '@/components/ui/ripple';
import NeoButton from '@/components/ui/NeoButton';
import Image from 'next/image';

import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface Alumnus {
    id: string;
    name: string;
    wallet: string;
    degree: string;
    year: number;
    expertise: string[];
    status: string;
    offering: string;
    isReal: boolean;
}


export default function AlumniPage() {
    const router = useRouter();
    const { activeAddress, isConnected } = useWalletContext();
    const { toast } = useToast();

    const { data: alumniList = [], isLoading } = useQuery<Alumnus[]>({
        queryKey: ['alumni'],
        queryFn: async () => {
            const res = await fetch('http://localhost:4000/api/alumni');
            if (!res.ok) throw new Error('Failed to fetch alumni');
            return res.json();
        }
    });

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
                <Ripple />
                <Card className="relative z-10 w-full max-w-md bg-zinc-900 border-4 border-zinc-800 shadow-[10px_10px_0px_0px_rgba(255,255,255,0.05)] pt-6">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-2xl shadow-lg w-16 h-16 flex items-center justify-center mb-4">
                            <GraduationCap className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-black uppercase tracking-tighter outfit-bold">Alumni Network</CardTitle>
                        <CardDescription className="text-zinc-400 mt-2">
                            Connect your wallet to access the exclusive alumni directory and mentorship network.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-10">
                        <WalletConnect />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex flex-col bg-black text-white overflow-x-hidden">
            <Ripple />
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50">
                <div className="bg-black/60 backdrop-blur-md border border-white/20 px-8 py-3 rounded-full flex justify-between items-center shadow-2xl">
                    <div className="flex items-center gap-3">
                        <Image src="/logo-navbar.png?v=1" alt="AlgoVault Logo" width={180} height={45} className="object-contain" />
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded ml-2">
                            Alumni
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <NeoButton
                            onClick={() => router.push('/')}
                            hoverText="Back"
                            className="scale-90"
                        >
                            Home
                        </NeoButton>
                        <NeoButton
                            onClick={() => router.push('/student')}
                            hoverText="Profile"
                            className="scale-90"
                        >
                            My Dashboard
                        </NeoButton>
                        <NeoButton
                            onClick={() => router.push('/alumni/join')}
                            hoverText="Join"
                            className="scale-90 border-emerald-500/50 text-emerald-400 hover:text-emerald-300"
                        >
                            Join Network
                        </NeoButton>
                        <WalletConnect />
                    </div>
                </div>
            </nav>

            <main className="relative z-10 container mx-auto px-4 pt-40 pb-16 max-w-6xl">
                <div className="mb-20 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase outfit-bold leading-none">
                        Connect with our <br />
                        <span className="bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">Nexus Alumni</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
                        Accelerate your career with technical mentorship from <span className="text-white underline decoration-blue-500 decoration-4 underline-offset-4">verified graduates</span> of the AlgoVault ecosystem.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {isLoading ? (
                        <div className="col-span-full text-center text-zinc-500 py-20 font-mono text-sm">
                            Fetching verified alumni identities from ledger...
                        </div>
                    ) : alumniList.map((alumnus) => (
                        <Card key={alumnus.id} className="bg-zinc-900 border-4 border-zinc-800 shadow-[10px_10px_0px_0px_rgba(255,255,255,0.05)] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[15px_15px_0px_0px_#ffffff] hover:border-white overflow-hidden group">
                            <CardHeader className="pb-4 pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl font-black text-white uppercase tracking-tighter outfit-bold underline decoration-indigo-500 decoration-4 underline-offset-4">{alumnus.name}</CardTitle>
                                        <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mt-3">{alumnus.degree} '{alumnus.year.toString().slice(-2)}</p>
                                    </div>
                                    <div className="bg-zinc-800 p-2.5 rounded-xl border border-zinc-700 shadow-sm">
                                        <GraduationCap className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-sm font-medium text-zinc-400 bg-black/40 p-4 rounded-xl border border-zinc-800/50">
                                    <span className="font-black uppercase tracking-widest text-[10px] text-zinc-500 block mb-2">Current Role</span>
                                    <span className="text-white text-base">{alumnus.status}</span>
                                </div>

                                <div>
                                    <span className="font-black uppercase tracking-widest text-[10px] text-zinc-500 block mb-3 flex items-center gap-2">
                                        <Code className="h-4 w-4" /> Technical Expertise
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {alumnus.expertise.map((skill, idx) => (
                                            <span key={idx} className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-lg font-bold uppercase tracking-wider border border-blue-500/20">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-zinc-800/50">
                                    <span className="font-black uppercase tracking-widest text-[10px] text-zinc-500 block mb-3 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" /> Mentorship Offering
                                    </span>
                                    <p className="text-sm text-zinc-400 italic font-medium leading-relaxed">"{alumnus.offering}"</p>
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    {alumnus.wallet === activeAddress ? (
                                        <div className="bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-widest text-center py-3 rounded-xl flex items-center justify-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            Your Profile
                                        </div>
                                    ) : (
                                        <NeoButton
                                            onClick={() => {
                                                if (alumnus.isReal) {
                                                    router.push(`/chat/${alumnus.wallet}`);
                                                } else {
                                                    toast({
                                                        title: "Demo Profile",
                                                        description: "Chat is only available with real verified students.",
                                                        variant: "destructive"
                                                    });
                                                }
                                            }}
                                            hoverText="Message"
                                            className="w-full"
                                        >
                                            Connect
                                        </NeoButton>
                                    )}
                                    <NeoButton
                                        onClick={() => { }}
                                        hoverText="On-Chain"
                                        className="w-full"
                                    >
                                        View NFT Profile
                                    </NeoButton>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}

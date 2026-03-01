'use client';

import { useWalletContext } from '@/contexts/WalletContext';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useEffect } from 'react';
import { Ripple } from '@/components/ui/ripple';
import NeoButton from '@/components/ui/NeoButton';
import { ChevronLeft, Send, Shield, User, Lock, Clock, MessageSquare } from 'lucide-react';
import Image from 'next/image';

interface ChatMessage {
    id: string;
    sender_wallet: string;
    receiver_wallet: string;
    message: string;
    timestamp: string;
}

export default function ChatPage({ params }: { params: { wallet: string } }) {
    const receiverWallet = params.wallet;
    const router = useRouter();
    const { activeAddress, isConnected } = useWalletContext();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // Scroll to bottom when messages update
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch Chat History
    const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
        queryKey: ['chat', activeAddress, receiverWallet],
        queryFn: async () => {
            if (!activeAddress) return [];
            const res = await fetch(`http://localhost:4000/api/chat/${activeAddress}/${receiverWallet}`);
            if (!res.ok) throw new Error('Failed to fetch chat messages');
            return res.json();
        },
        enabled: !!activeAddress && isConnected,
        refetchInterval: 3000, // Poll every 3 seconds for new messages
    });

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Send Message Mutation
    const sendMutation = useMutation({
        mutationFn: async (messageText: string) => {
            if (!activeAddress) throw new Error('Not connected');
            const res = await fetch(`http://localhost:4000/api/chat/${activeAddress}/${receiverWallet}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText }),
            });
            if (!res.ok) throw new Error('Failed to send message');
            return res.json();
        },
        onSuccess: () => {
            setNewMessage('');
            queryClient.invalidateQueries({ queryKey: ['chat', activeAddress, receiverWallet] });
        },
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sendMutation.isPending) return;
        sendMutation.mutate(newMessage);
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Ripple />
                <div className="relative z-10 text-center">
                    <Shield className="w-16 h-16 mx-auto mb-6 text-zinc-500" />
                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Connect Wallet Required</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col items-center overflow-hidden">
            <Ripple />

            {/* Top Navbar */}
            <nav className="relative z-10 w-full max-w-4xl px-4 mt-6 flex justify-between items-center">
                <button
                    onClick={() => router.push('/alumni')}
                    className="text-zinc-400 hover:text-white flex items-center gap-2 group transition-colors text-sm font-semibold uppercase tracking-wider"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Directory
                </button>
                <div className="flex items-center gap-3">
                    <Image src="/logo-navbar.png?v=1" alt="AlgoVault Logo" width={140} height={35} className="object-contain opacity-50" />
                </div>
            </nav>

            <main className="relative z-10 w-full max-w-4xl mt-6 px-4 flex-1 flex flex-col pb-8">

                {/* Chat Header */}
                <div className="bg-zinc-900/60 border border-white/10 rounded-t-3xl backdrop-blur-xl p-6 flex items-center gap-6 border-b-0">
                    <div className="bg-gradient-to-br from-indigo-500 to-blue-600 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-zinc-800 shadow-lg">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-wider leading-none mb-2">Verified Graduate</h2>
                        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 rounded-md text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> App Online
                            </span>
                            <span>{receiverWallet.slice(0, 6)}...{receiverWallet.slice(-4)}</span>
                        </div>
                    </div>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 bg-zinc-900/40 border-x border-white/10 backdrop-blur-md p-6 overflow-y-auto flex flex-col gap-6 scrollbar-hide min-h-[50vh] max-h-[60vh]">

                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-zinc-800/80 px-4 py-2 rounded-full text-xs font-medium text-zinc-400 flex items-center gap-2 border border-white/5 backdrop-blur-sm shadow-inner">
                            <Lock className="w-3 h-3" /> End-to-end Encrypted Session
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-zinc-500">
                            Loading secure messages...
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-center px-8">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                            <p className="font-medium text-lg text-white mb-2">No messages yet</p>
                            <p className="text-sm">Send your first message to connect with this verified graduate.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMine = msg.sender_wallet === activeAddress;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl ${isMine
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-zinc-800 text-zinc-200 border border-white/5 rounded-bl-sm shadow-md'
                                        }`}>
                                        <p className="text-[15px] leading-relaxed break-words">{msg.message}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2 px-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600 flex-row">
                                        <Clock className="w-3 h-3" />
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-zinc-900/60 border border-white/10 rounded-b-3xl backdrop-blur-xl p-4 flex gap-3 shadow-2xl border-t-0">
                    <form onSubmit={handleSend} className="flex-1 flex gap-3 w-full">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message securely..."
                                className="w-full bg-[#0D0D0D] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shadow-inner font-medium placeholder:text-zinc-600"
                                disabled={sendMutation.isPending}
                            />
                        </div>
                        <NeoButton
                            type="submit"
                            disabled={!newMessage.trim() || sendMutation.isPending}
                            className="py-0 px-6 bg-white text-black hover:bg-zinc-200 transition-colors"
                            hoverText="Send"
                        >
                            {sendMutation.isPending ? '...' : <Send className="w-5 h-5" />}
                        </NeoButton>
                    </form>
                </div>

            </main>
        </div>
    );
}


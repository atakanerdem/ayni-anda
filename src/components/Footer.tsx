import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-6 mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <Link href="/" className="text-xl font-bold">
                            Aynı Anda
                        </Link>
                        <p className="text-gray-400 mt-2">Şu anda neler yapıyorsunuz?</p>
                    </div>

                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
                        <Link href="/" className="hover:text-indigo-300 transition-colors duration-200">
                            Ana Sayfa
                        </Link>
                        <Link href="/about" className="hover:text-indigo-300 transition-colors duration-200">
                            Hakkında
                        </Link>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
                    © {new Date().getFullYear()} Aynı Anda. Tüm hakları saklıdır.
                </div>
            </div>
        </footer>
    );
} 
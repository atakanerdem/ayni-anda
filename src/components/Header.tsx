import React from 'react';
import Link from 'next/link';

export default function Header() {
    return (
        <header className="bg-indigo-600 text-white py-4 shadow-md">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    Aynı Anda
                </Link>
                <nav>
                    <ul className="flex space-x-6">
                        <li>
                            <Link href="/" className="hover:text-indigo-200 transition-colors duration-200">
                                Ana Sayfa
                            </Link>
                        </li>
                        <li>
                            <Link href="/about" className="hover:text-indigo-200 transition-colors duration-200">
                                Hakkında
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
} 
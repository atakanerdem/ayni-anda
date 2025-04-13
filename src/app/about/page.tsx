import React from 'react';

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-indigo-800 mb-6">Aynı Anda Hakkında</h1>

            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Proje Nedir?</h2>
                <p className="text-gray-700 mb-4">
                    Aynı Anda, insanların şu anda yaptıkları aktiviteleri paylaşmalarını ve aynı aktiviteyi yapan kaç kişi olduğunu görmelerini sağlayan bir platformdur.
                </p>
                <p className="text-gray-700 mb-4">
                    Kullanıcılar, o an yaptıkları aktiviteyi girebilir ve aynı aktiviteyi yapan diğer kullanıcıları gerçek zamanlı olarak görebilirler.
                    Bir aktivite başlattığınızda, o aktiviteyi yapan kişi sayısı bir artar. Aktiviteyi bitirdiğinizde ise sayı bir azalır.
                </p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Nasıl Kullanılır?</h2>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                    <li>Ana sayfadaki form aracılığıyla şu an yaptığınız aktiviteyi girin.</li>
                    <li>Aktiviteyi başlattığınızda, o aktiviteyi yapan kişi sayısı bir artar.</li>
                    <li>Aktivite listesinde, hangi aktiviteleri kaç kişinin yaptığını görebilirsiniz.</li>
                    <li>En popüler üç aktivite, &quot;TREND&quot; etiketi ile işaretlenir.</li>
                    <li>Aktivitenizi bitirmek istediğinizde &quot;Bitir&quot; düğmesine tıklayın.</li>
                </ol>
            </div>
        </div>
    );
} 
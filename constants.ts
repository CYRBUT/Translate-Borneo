import { Language, Donation, Comment } from './types';

export const LANGUAGE_OPTIONS: Language[] = [
    Language.INDONESIAN,
    Language.BAKUMPAI,
    Language.NGAJU,
];

export const DANA_PHONE_NUMBER = '085651479650';
export const SOCIABUZZ_LINK = 'https://sociabuzz.com/your-profile-here'; // Ganti dengan link profil Sociabuzz Anda

export const SOCIAL_LINKS = {
    instagram: 'https://instagram.com',
    telegram: 'https://telegram.org',
    tiktok: 'https://tiktok.com',
    github: 'https://github.com/bangindra123',
};

// Mock data now uses ISO date strings for consistency with localStorage
export const MOCK_DONATIONS: Donation[] = [
    { id: 'mock-d-1', name: 'Budi Santoso', amount: 50000, date: new Date(Date.now() - 6 * 86400000).toISOString() },
    { id: 'mock-d-2', name: 'Siti Aminah', amount: 100000, date: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'mock-d-3', name: 'Ahmad Yani', amount: 25000, date: new Date(Date.now() - 4 * 86400000).toISOString() },
    { id: 'mock-d-4', name: 'Dewi Lestari', amount: 75000, date: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'mock-d-5', name: 'Eko Prasetyo', amount: 125000, date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'mock-d-6', name: 'Fitriani', amount: 30000, date: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 'mock-d-7', name: 'Gilang Dirga', amount: 90000, date: new Date().toISOString() },
];

export const MOCK_COMMENTS: Comment[] = [
    { 
        id: 'mock-1',
        username: 'Pengguna123', 
        email: 'user@example.com', 
        message: 'Aplikasi ini sangat membantu! Terjemahannya akurat.', 
        rating: 5, 
        date: new Date(Date.now() - 86400000).toISOString(),
        likes: 12,
        replies: []
    },
    { 
        id: 'mock-2',
        username: 'Budayawan', 
        email: 'culture@example.com', 
        message: 'Bagus sekali untuk melestarikan bahasa daerah. Mungkin bisa ditambahkan fitur suara?', 
        rating: 4, 
        date: new Date(Date.now() - 172800000).toISOString(),
        likes: 8,
        replies: [
            {
                id: 'mock-reply-1',
                username: 'Admin',
                email: '',
                message: 'Terima kasih atas sarannya! Fitur suara sedang kami kembangkan.',
                rating: 0,
                date: new Date(Date.now() - 170000000).toISOString(),
                likes: 5,
                replies: []
            }
        ] 
    },
     { 
        id: 'mock-3',
        username: 'John Doe', 
        email: 'john@example.com', 
        message: 'Desainnya modern dan mudah digunakan. Terkadang terjemahan masih perlu perbaikan, tapi secara keseluruhan bagus.', 
        rating: 4, 
        date: new Date(Date.now() - 259200000).toISOString(),
        likes: 3,
        replies: []
    },
];


export const MOCK_CULTURAL_FACTS: string[] = [
    "Rumah Betang, rumah panjang tradisional Suku Dayak, adalah simbol persatuan komunal, seringkali menampung puluhan keluarga di bawah satu atap.",
    "Upacara Tiwah dalam kepercayaan Kaharingan Suku Dayak Ngaju adalah ritual pemakaman sekunder yang kompleks untuk mengantarkan jiwa orang yang meninggal ke surga.",
    "Tato bagi banyak sub-suku Dayak bukan hanya hiasan; mereka melambangkan status sosial, pencapaian, atau perjalanan spiritual seseorang.",
    "Mandau adalah senjata tradisional Suku Dayak, sejenis parang yang dihiasi dengan ukiran rumit dan seringkali diyakini memiliki kekuatan spiritual.",
    "Bahasa Ngaju memiliki sistem vokal yang kaya dan digunakan oleh ratusan ribu orang di sepanjang sungai-sungai besar di Kalimantan Tengah.",
    "Orang Bakumpai secara tradisional adalah penghuni sungai, membangun komunitas mereka di sepanjang tepi sungai dan mengandalkan sungai untuk transportasi dan penghidupan.",
    "Tarian Hudoq adalah tarian ritual yang dilakukan untuk mengusir hama dan memohon panen yang melimpah, menampilkan topeng-topeng yang mengesankan.",
    "Kaharingan, agama asli Suku Dayak, adalah sistem kepercayaan animistik yang kompleks yang menghormati alam dan roh leluhur.",
    "Sumpit, atau 'Sipet', adalah senjata berburu tradisional yang digunakan dengan presisi luar biasa oleh para pemburu Dayak untuk menangkap mangsa di hutan lebat.",
    "Anyaman rotan adalah bentuk seni yang sangat berkembang di kalangan masyarakat Dayak, menghasilkan tikar, keranjang, dan topi yang indah dan fungsional.",
];

export const MOCK_CULTURAL_IMAGES: string[] = [
    "https://images.unsplash.com/photo-1629689423891-b0518c728851?q=80&w=1932&auto=format&fit=crop", // Longhouse
    "https://images.unsplash.com/photo-1620786311828-6eca4c875883?q=80&w=2070&auto=format&fit=crop", // River village
    "https://images.unsplash.com/photo-1587898514937-013158e08b17?q=80&w=1974&auto=format&fit=crop", // Rainforest
    "https://images.unsplash.com/photo-1590921485129-1f237f394c8e?q=80&w=1968&auto=format&fit=crop", // Traditional weaving
    "https://images.unsplash.com/photo-1561576483-8c43aff7c352?q=80&w=2070&auto=format&fit=crop", // Canoe on river
    "https://images.unsplash.com/photo-1568992687947-868a62a9f521?q=80&w=1932&auto=format&fit=crop", // Floating market
];

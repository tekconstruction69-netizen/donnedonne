import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Donnedonne.fr — Donnez, Recevez, Partagez',
  description:
    'Plateforme de don solidaire entre particuliers. Luttez contre le gaspillage et la précarité en donnant ou recevant nourriture et objets près de chez vous.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}

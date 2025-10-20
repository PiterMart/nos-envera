import localFont from "next/font/local";
import "../styles/globals.css";
import Nav from "../components/nav";
import Footer from "../components/Footer";
import LoadingProvider from "../components/LoadingProvider";
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400'],
})

const geistSans = localFont({
  src: "./assets/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./assets/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const minecraftRegular = localFont({
  src: "../../public/fonts/MinecraftRegular-Bmg3.otf",
  variable: "--font-minecraft-regular",
});

const minecraftItalic = localFont({
  src: "../../public/fonts/MinecraftItalic-R8Mo.otf",
  variable: "--font-minecraft-italic",
});

const lovelt = localFont({
  src: "../../public/fonts/Lovelt__.ttf",
  variable: "--font-lovelt",
  display: 'swap',
  preload: true,
});

// Helveti
// 
// a fonts
const helveticaRegular = localFont({
  src: "../../public/fonts/helvetica/Helvetica.ttf",
  variable: "--font-helvetica-regular",
});

const helveticaBold = localFont({
  src: "../../public/fonts/helvetica/Helvetica-Bold.ttf",
  variable: "--font-helvetica-bold",
});

const helveticaCondensed = localFont({
  src: "../../public/fonts/helvetica/helvetica_condensed.ttf",
  variable: "--font-helvetica-condensed",
});

const helveticaLight = localFont({
  src: "../../public/fonts/helvetica/helvetica-light.ttf",
  variable: "--font-helvetica-light",
});

const helveticaBlack = localFont({
  src: "../../public/fonts/helvetica/helvetica black.otf",
  variable: "--font-helvetica-black",
});

export const metadata = {
  title: "Artwings",
  description: " Berlin-based artspace redefining the boundaries of artistic expression. We offer a platform for emerging artists, diverse identities, alternative voices and seekers from all over the world to bring raw, intimate narratives into the spotlight, bridging the underground scene with the contemporary art world and market. ",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body 
        className={`${geistSans.variable} ${geistMono.variable} ${minecraftRegular.variable} ${minecraftItalic.variable} ${lovelt.variable} ${helveticaRegular.variable} ${helveticaBold.variable} ${helveticaCondensed.variable} ${helveticaLight.variable} ${helveticaBlack.variable} ${inter.className}`}
        style={{
          backgroundImage: 'url(/metaltextureverticaledited2.jpg)',
          backgroundSize: 'auto',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          

          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <LoadingProvider>
          <Nav/>
          <main style={{ flex: 1 }}>
            {children}
          </main>
          {/* <Footer/> */}
        </LoadingProvider>
      </body>
    </html>
  );
}

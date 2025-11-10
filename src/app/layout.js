import "../styles/globals.css";
import Nav from "../components/nav";
import Footer from "../components/Footer";
import LoadingProvider from "../components/LoadingProvider";


export const metadata = {
  title: "Nos en Vera",
  description: "Espacio de arte y cultura dedicado a la promoción de artistas emergentes y la experimentación artística",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body 
        style={{
          minHeight: '100vh',
          margin: 0,
          padding: 0
        }}
      >
        <LoadingProvider>
          <div style={{
            display: 'flex',
            minHeight: '100vh'
          }}>
            <main className="mainContent">
              {children}
            </main>
            <Nav/>
          </div>
          {/* <Footer/> */}
        </LoadingProvider>
      </body>
    </html>
  );
}

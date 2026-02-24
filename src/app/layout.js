import "../styles/globals.css";
import Nav from "../components/nav";
import Footer from "../components/Footer";
import LoadingProvider from "../components/LoadingProvider";
import PageTransitionProvider from "../components/PageTransitionProvider";
import PageTransitionWrapper from "../components/PageTransitionWrapper";
import ScrollToTop from "../components/ScrollToTop";

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
          <PageTransitionProvider>
            <ScrollToTop />
            <Nav />
          <div className="appGrid">
            <main className="mainContent">
              <PageTransitionWrapper>
                {children}
              </PageTransitionWrapper>
              <div>
                <Footer />
              </div>
            </main>
          </div>
          </PageTransitionProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}

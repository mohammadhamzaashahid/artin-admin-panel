import "./globals.css";
import AppProviders from "@/lib/providers/AppProviders";

export const metadata = {
  title: "Artin Admin",
  description: "Artin Course Platform Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RoleNavbar from "@/components/RoleNavBar";
import ToastContainer from "@/components/ToastContainer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          <RoleNavbar />
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}

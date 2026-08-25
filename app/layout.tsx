export const metadata = { title: "SHK Förder-Assistent" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, sans-serif", background: "#f6f6f4", color: "#1a1a18" }}>
        {children}
      </body>
    </html>
  );
}

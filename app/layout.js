import "./globals.css";

export const metadata = {
  title: "Whiteboard Studio — Personal Infinite Canvas",
  description: "Minimalist personal whiteboard for ideas, flows, and design references",
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/icon.png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#F1EFE8] dark:bg-[#18181A] text-neutral-900 dark:text-neutral-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}

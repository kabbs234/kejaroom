import './globals.css';

export const metadata = {
  title: 'KejaRoom',
  description: 'Find rooms in Kenya',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
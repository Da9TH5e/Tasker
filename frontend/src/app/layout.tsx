import type { Metadata } from "next"
import { Josefin_Sans, Roboto } from "next/font/google"
import "./globals.css"

const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
  weight: ["100", "300", "400", "600", "700"],
})

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
})

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Manage your tasks without the chaos",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${josefin.variable} ${roboto.variable}`}>
        {children}
      </body>
    </html>
  )
}
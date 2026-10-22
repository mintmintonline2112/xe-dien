/**
 * Font local Barlow + Barlow Condensed (next/font/local) và fontClassName gắn hai biến font.
 * Dùng bởi: app/admin/layout.tsx.
 * Lưu ý: next/font/local phải gọi ở module scope với đường dẫn tương đối từ chính file này tới các file .woff2 cùng thư mục.
 */
import localFont from "next/font/local";

export const barlow = localFont({
  variable: "--font-barlow",
  display: "swap",
  src: [
    { path: "./barlow-v13-7cHqv4kjgoGqM7E3p-ks6FospT4.woff2", weight: "300" },
    { path: "./barlow-v13-7cHqv4kjgoGqM7E3p-ks6VospT4.woff2", weight: "300" },
    { path: "./barlow-v13-7cHqv4kjgoGqM7E3p-ks51os.woff2", weight: "300" },
    { path: "./barlow-v13-7cHpv4kjgoGqM7E_A8s52Hs.woff2", weight: "400" },
    { path: "./barlow-v13-7cHpv4kjgoGqM7E_Ass52Hs.woff2", weight: "400" },
    { path: "./barlow-v13-7cHpv4kjgoGqM7E_DMs5.woff2", weight: "400" },
    { path: "./barlow-v13-7cHqv4kjgoGqM7E3_-gs6FospT4.woff2", weight: "500" },
    { path: "./barlow-v13-7cHqv4kjgoGqM7E3_-gs6VospT4.woff2", weight: "500" },
    { path: "./barlow-v13-7cHqv4kjgoGqM7E3_-gs51os.woff2", weight: "500" },
  ],
});

export const barlowCondensed = localFont({
  variable: "--font-barlow-cond",
  display: "swap",
  src: [
    {
      path: "./barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B47rxz3nWuZEC.woff2",
      weight: "300",
    },
    {
      path: "./barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B47rxz3jWuZEC.woff2",
      weight: "300",
    },
    {
      path: "./barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B47rxz3bWuQ.woff2",
      weight: "300",
    },
    {
      path: "./barlowcondensed-v13-HTx3L3I-JCGChYJ8VI-L6OO_au7B6x7T2kn3.woff2",
      weight: "400",
    },
    {
      path: "./barlowcondensed-v13-HTx3L3I-JCGChYJ8VI-L6OO_au7B6x_T2kn3.woff2",
      weight: "400",
    },
    {
      path: "./barlowcondensed-v13-HTx3L3I-JCGChYJ8VI-L6OO_au7B6xHT2g.woff2",
      weight: "400",
    },
    {
      path: "./barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B4-Lwz3nWuZEC.woff2",
      weight: "500",
    },
    {
      path: "./barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B4-Lwz3jWuZEC.woff2",
      weight: "500",
    },
    {
      path: "./barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B4-Lwz3bWuQ.woff2",
      weight: "500",
    },
    {
      path: "./barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B4873z3nWuZEC.woff2",
      weight: "600",
    },
    {
      path: "./barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B4873z3jWuZEC.woff2",
      weight: "600",
    },
    {
      path: "./barlowcondensed-v13-HTxwL3I-JCGChYJ8VI-L6OO_au7B4873z3bWuQ.woff2",
      weight: "600",
    },
  ],
});

export const fontClassName = `${barlow.variable} ${barlowCondensed.variable}`;

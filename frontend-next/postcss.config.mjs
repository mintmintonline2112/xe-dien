/**
 * Cấu hình PostCSS chỉ gồm plugin Tailwind v4.
 * Dùng bởi: Next.js khi build CSS (thay cho postcss mặc định).
 * Lưu ý: Tailwind v4 tự bundle @import và tự thêm vendor prefix (Lightning CSS) nên không cần autoprefixer / postcss-import.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

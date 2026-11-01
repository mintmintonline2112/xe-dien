/**
 * Client API admin của bộ CMS NestJS (họ primenutusa / xe-nang): đăng nhập bằng email + mật khẩu (cookie accessToken / refreshToken)
 * hoặc dùng sẵn access token (header Bearer), tự làm mới phiên một lần khi gặp 401, gọi JSON và upload file lên Thư viện.
 * Dùng bởi: targets/nest-cms-target.mjs.
 * Lưu ý: API bọc kết quả dạng { statusCode, message, data } — hàm trả thẳng `data`. Đăng nhập bị giới hạn 5 lần / phút.
 * Có token (CMS tự chạy tool, xem README mục "Chạy từ trang quản trị") thì không đăng nhập, token hết hạn là dừng.
 */
export function createNestCmsClient({ apiUrl, email, password, token }) {
  const baseUrl = apiUrl.replace(/\/$/, "");
  const cookies = new Map();

  const cookieHeader = () => [...cookies].map(([name, value]) => `${name}=${value}`).join("; ");

  function storeCookies(response) {
    for (const line of response.headers.getSetCookie?.() ?? []) {
      const [pair] = line.split(";");
      const separator = pair.indexOf("=");
      if (separator > 0) cookies.set(pair.slice(0, separator).trim(), pair.slice(separator + 1).trim());
    }
  }

  async function send(path, init = {}) {
    const response = await fetch(`${baseUrl}/${path.replace(/^\//, "")}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : { Cookie: cookieHeader() }),
        ...(init.headers ?? {}),
      },
    });
    storeCookies(response);
    return response;
  }

  async function unwrap(response, path) {
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = Array.isArray(payload?.message) ? payload.message.join(", ") : payload?.message;
      throw new Error(`${response.status} ${path}: ${message ?? "lỗi không rõ"}`);
    }
    return payload && typeof payload === "object" && "data" in payload ? payload.data : payload;
  }

  async function login() {
    if (token) return;
    const response = await send("admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    await unwrap(response, "admin/auth/login");
  }

  async function request(path, init = {}) {
    let response = await send(path, init);
    if (response.status === 401 && !token) {
      const refreshed = await send("admin/auth/refresh", { method: "POST" });
      if (!refreshed.ok) await login();
      response = await send(path, init);
    }
    return unwrap(response, path);
  }

  const requestJson = (path, method, body) =>
    request(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  async function uploadToLibrary(fileBuffer, fileName, folder) {
    const form = new FormData();
    form.append("file", new Blob([fileBuffer]), fileName);
    form.append("folder", folder);
    return request("admin/library/upload", { method: "POST", body: form });
  }

  return {
    login,
    get: (path) => request(path),
    post: (path, body) => requestJson(path, "POST", body),
    put: (path, body) => requestJson(path, "PUT", body),
    uploadToLibrary,
  };
}

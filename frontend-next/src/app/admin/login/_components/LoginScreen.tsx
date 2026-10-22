'use client';

/**
 * Màn đăng nhập admin bằng email + mật khẩu nhân sự; đã đăng nhập thì chuyển thẳng tới dashboard.
 * Dùng bởi: app/admin/login/page.tsx.
 */

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useAdminAuth } from '@/app/admin/_auth/AuthProvider';
import { AdminApiError } from '@/app/admin/_lib/admin-api';
import { adminRoutes } from '@/config/routes';

export function LoginScreen() {
  const router = useRouter();
  const { user, login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) router.replace(adminRoutes.dashboard);
  }, [router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      router.replace(adminRoutes.dashboard);
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof AdminApiError
          ? reason.message
          : 'Không thể kết nối máy chủ. Vui lòng thử lại.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-intro">
        <div className="admin-login-brand">
          <span className="admin-sidebar-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>Xe Điện Xanh</strong>
            <small>Xe điện chính hãng</small>
          </span>
        </div>
        <div>
          <p className="admin-eyebrow">Không gian quản trị</p>
          <h1>Quản lý cửa hàng xe điện.<br />Gọn trong một nơi.</h1>
          <p>
            Quản lý sản phẩm, danh mục, tin tức, trang nội dung và yêu cầu tư vấn
            của khách hàng trong một hệ thống tập trung.
          </p>
        </div>
        <small>© {new Date().getFullYear()} Xe Điện Xanh</small>
      </section>

      <section className="admin-login-panel">
        <form className="admin-login-card" onSubmit={handleSubmit}>
          <header>
            <p className="admin-eyebrow">Xe Điện Xanh CMS</p>
            <h2>Đăng nhập quản trị</h2>
            <p>Dùng tài khoản nhân sự đã được cấp quyền.</p>
          </header>

          <label className="admin-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
              autoFocus
            />
          </label>

          <label className="admin-field">
            <span>Mật khẩu</span>
            <span className="admin-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </span>
          </label>

          {error ? <p className="admin-form-error" role="alert">{error}</p> : null}

          <button className="admin-primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
            <span aria-hidden="true">→</span>
          </button>

          <p className="admin-login-note">
            Phiên đăng nhập được bảo vệ bằng cookie bảo mật; mật khẩu và token
            không được lưu trong trình duyệt.
          </p>
        </form>
      </section>
    </main>
  );
}

import { render, screen } from '@testing-library/react';
import AdminSidebar from '@/components/AdminSidebar';

describe('AdminSidebar', () => {
  it('should render sidebar', () => {
    render(<AdminSidebar />);
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
  });

  it('should display sidebar title', () => {
    render(<AdminSidebar />);
    expect(screen.getByTestId('sidebar-title')).toHaveTextContent('管理画面');
  });

  it('should render navigation menu', () => {
    render(<AdminSidebar />);
    expect(screen.getByTestId('sidebar-nav')).toBeInTheDocument();
  });

  it('should display all menu items', () => {
    render(<AdminSidebar />);

    const menuItems = [
      'ダッシュボード',
      '予約管理',
      '顧客管理',
      'スタッフ管理',
      'メニュー管理',
      '分析レポート',
      '店舗設定',
    ];

    menuItems.forEach((item) => {
      expect(screen.getByTestId(`nav-link-${item}`)).toBeInTheDocument();
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('should have correct hrefs for menu items', () => {
    render(<AdminSidebar />);

    const expectedLinks = [
      { name: 'ダッシュボード', href: '/admin/dashboard' },
      { name: '予約管理', href: '/admin/reservations' },
      { name: '顧客管理', href: '/admin/customers' },
      { name: 'スタッフ管理', href: '/admin/staff' },
      { name: 'メニュー管理', href: '/admin/menus' },
      { name: '分析レポート', href: '/admin/analytics' },
      { name: '店舗設定', href: '/admin/settings' },
    ];

    expectedLinks.forEach(({ name, href }) => {
      const link = screen.getByTestId(`nav-link-${name}`);
      expect(link).toHaveAttribute('href', href);
    });
  });

  it('should display user screen link', () => {
    render(<AdminSidebar />);
    const userScreenLink = screen.getByTestId('user-screen-link');

    expect(userScreenLink).toBeInTheDocument();
    expect(userScreenLink).toHaveTextContent('ユーザー画面へ');
    expect(userScreenLink).toHaveAttribute('href', '/');
  });

  it('should have correct styling classes', () => {
    render(<AdminSidebar />);
    const sidebar = screen.getByTestId('admin-sidebar');

    expect(sidebar).toHaveClass('fixed', 'left-0', 'top-0', 'h-screen', 'w-64');
  });

  it('should display logo with R character', () => {
    render(<AdminSidebar />);
    expect(screen.getByText('R')).toBeInTheDocument();
  });
});

import BrandingTheme from '@/components/branding-theme';
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description}>
            <BrandingTheme />
            {children}
        </AuthLayoutTemplate>
    );
}

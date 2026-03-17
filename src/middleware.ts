export { default } from 'next-auth/middleware'

export const config = {
  // 대시보드/온보딩 라우트 보호
  matcher: ['/dashboard/:path*', '/onboarding/:path*'],
}

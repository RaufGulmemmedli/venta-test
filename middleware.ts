// middleware.ts
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

// Create the next-intl middleware for localization
const intlMiddleware = createMiddleware({
  locales: ["en", "az", "ru"],
  defaultLocale: "en",
  localePrefix: "always",
});

export default function middleware(request: any) {
  try {
    console.log("Request URL:", request.url);
    console.log("Request Pathname:", request.nextUrl.pathname);

    const { pathname } = request.nextUrl;

    // Get locale from the path
    let locale = request.nextUrl.pathname.split('/')[1];
    console.log("Detected Locale:", locale);

    // If locale is not valid, use default
    if (!["en", "az", "ru"].includes(locale)) {
      locale = "en";
    }

    console.log("Final Locale:", locale);

    // Path without locale prefix
    const pathWithoutLocale = pathname.replace(/^\/(en|az|ru)/, "");
    console.log("Path Without Locale:", pathWithoutLocale);

    // If trying to access root ("/"), redirect to login
    if (pathWithoutLocale === "/") {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      console.log("Redirecting to:", loginUrl.toString());
      return NextResponse.redirect(loginUrl);
    }

    return intlMiddleware(request);
  } catch (error) {
    console.error("Middleware Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const config = {
  // Match all paths except for:
  // - API routes (/api/*)
  // - Next.js specific files (/_next/*)
  // - Static files (images, assets) with file extensions
  matcher: ["/((?!api|_next|.*\\..*).*)", "/"],
};
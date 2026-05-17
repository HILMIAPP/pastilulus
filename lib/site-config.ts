function publicEnv(value: string | undefined, fallback: string) {
  return value || fallback;
}

function publicFlag(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

export const brand = {
  name: publicEnv(process.env.NEXT_PUBLIC_BRAND_NAME, "Pastilulus"),
  owner: publicEnv(process.env.NEXT_PUBLIC_BRAND_OWNER, "Nukaedu"),
  suffix: publicEnv(process.env.NEXT_PUBLIC_BRAND_SUFFIX, "BY NUKAEDU"),
  logoWide: publicEnv(process.env.NEXT_PUBLIC_BRAND_LOGO_WIDE, "/assets/pastilulus-logo-wide-cropped.png"),
  logoIcon: publicEnv(process.env.NEXT_PUBLIC_BRAND_LOGO_ICON, "/assets/pastilulus-logo-only.png"),
  tagline: publicEnv(
    process.env.NEXT_PUBLIC_BRAND_TAGLINE,
    "Persiapan ujian mandiri PTN yang terarah: soal, simulasi, AI tutor, dan deadline.",
  ),
  promise: publicEnv(process.env.NEXT_PUBLIC_BRAND_PROMISE, "Belajar pasti lulus, masa depan pasti cerah."),
  url: publicEnv(process.env.NEXT_PUBLIC_APP_URL, "https://www.nukaedu.web.id"),
  email: publicEnv(process.env.NEXT_PUBLIC_CONTACT_EMAIL, "halo@pastilulus.id"),
  whatsappGroupUrl: publicEnv(process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL, "https://chat.whatsapp.com/CACw9kvVRxU8QpgRkX2KsW"),
};

export const whiteLabel = {
  brand,
  colors: {
    blue: "#0A66FF",
    navy: "#0D1B2A",
    lightBlue: "#E6F0FF",
    charcoal: "#111111",
    coolGray: "#6B7280",
  },
  storagePrefix: publicEnv(process.env.NEXT_PUBLIC_STORAGE_PREFIX, "pastilulus"),
  auth: {
    sessionCookieName: publicEnv(process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME, "pastilulus_session"),
    adminEmail: publicEnv(process.env.NEXT_PUBLIC_ADMIN_EMAIL, "admin@pastilulus.id"),
    superAdminEmail: publicEnv(process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL, "superadmin@pastilulus.id"),
  },
};

export const site = {
  name: brand.name,
  brandSuffix: brand.suffix,
  fullName: brand.owner ? `${brand.name} by ${brand.owner}` : brand.name,
  logoWide: brand.logoWide,
  logoIcon: brand.logoIcon,
  tagline: brand.tagline,
  promise: brand.promise,
  url: brand.url,
  emailKontak: brand.email,
  whatsappGroupUrl: brand.whatsappGroupUrl,
  enableBaileysCrm: publicFlag(process.env.NEXT_PUBLIC_ENABLE_BAILEYS_CRM, false),
  colors: whiteLabel.colors,
};

export const storageKeys = {
  onboardingProfile: `${whiteLabel.storagePrefix}_onboarding_profile`,
  ptnTargets: `${whiteLabel.storagePrefix}_ptn_targets`,
  ptnChecklist: `${whiteLabel.storagePrefix}_ptn_checklist`,
  latestTryoutResult: `${whiteLabel.storagePrefix}_latest_tryout_result`,
  moduleProgress: (userId: string) => `${whiteLabel.storagePrefix}_mods_${userId}`,
};

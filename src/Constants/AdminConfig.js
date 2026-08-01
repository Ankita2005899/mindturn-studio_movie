// ⚠️ IMPORTANT: Replace this with YOUR actual email (the one you sign in with).
// Only these email(s) will be able to see/use the Studio dashboard.
export const ADMIN_EMAILS = ["saluankesakshi@gmail.com"];

export const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(
    email.toLowerCase()
  );
};

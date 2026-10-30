export const LOGIN_DESTINATION_KEY = "pagecraft:pos-login";

export function safeDestination(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return "/painel";
  const path = value.split(/[?#]/)[0];
  return path === "/entrar" || path === "/redefinir-senha" ? "/painel" : value;
}

export function authErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/invalid login credentials/i.test(message)) return "E-mail ou senha incorretos. Confira os dados e tente novamente.";
  if (/email not confirmed/i.test(message)) return "Confirme seu e-mail antes de entrar. Verifique também a pasta de spam.";
  if (/already registered/i.test(message)) return "Este e-mail já tem uma conta. Entre ou recupere sua senha.";
  if (/rate limit|too many requests/i.test(message)) return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  if (/password.*(weak|pwned)|weak.*password/i.test(message)) return "Escolha uma senha mais forte que não tenha sido exposta em vazamentos.";
  if (/network|fetch/i.test(message)) return "Não foi possível conectar. Confira sua internet e tente novamente.";
  return "Não foi possível concluir. Tente novamente ou fale com a PageCraft.";
}
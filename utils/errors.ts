export function getErrorMessage(error: unknown): string {
  if (!error) return 'Algo deu errado. Tente novamente.';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return translateMessage(error.message);
  if (typeof error === 'object' && 'message' in error) {
    return translateMessage(String((error as { message: unknown }).message));
  }
  return 'Algo deu errado. Tente novamente.';
}

function translateMessage(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha inválidos.',
    'User already registered': 'Já existe uma conta com este e-mail.',
    'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
    'Password should be at least 6 characters.': 'A senha deve ter pelo menos 6 caracteres.',
  };
  return map[message] ?? message;
}

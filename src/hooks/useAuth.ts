// #region Perfis
export type UserRole =
  | 'colaborador'
  | 'gestor'
  | 'analista';
// #endregion

// #region Usuário
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area: string;
}
// #endregion

// #region Credenciais
export interface LoginCredentials {
  email: string;
  password: string;
}
// #endregion

// #region Perfil de demonstração
export interface DemoProfile {
  role: UserRole;
  title: string;
  subtitle: string;
  description: string;
  permissions: string[];
  restrictions: string[];
}
// #endregion
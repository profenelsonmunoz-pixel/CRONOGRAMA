import { User } from '../types';

const USERS_STORAGE_KEY = 'cronograma_iensecan_users';

// In a real app, passwords should be hashed. For this project, we'll store them as-is.
const getDefaultUser = (): User => ({
  username: 'admin',
  password: 'Iensecan2025*',
});

export const initializeUsers = (): void => {
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([getDefaultUser()]));
  }
};

export const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const login = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  if (user) {
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = (): void => {
  sessionStorage.removeItem('loggedInUser');
};

export const getLoggedInUser = (): User | null => {
  const userJson = sessionStorage.getItem('loggedInUser');
  return userJson ? JSON.parse(userJson) : null;
};


export const changePassword = (username: string, oldPassword: string, newPassword: string): { success: boolean, message: string } => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === username && u.password === oldPassword);

    if (userIndex === -1) {
        return { success: false, message: 'La contraseña actual es incorrecta.' };
    }

    users[userIndex].password = newPassword;
    saveUsers(users);
    
    // Update session storage if the logged in user changed their own password
    const loggedInUser = getLoggedInUser();
    if (loggedInUser && loggedInUser.username === username) {
        sessionStorage.setItem('loggedInUser', JSON.stringify(users[userIndex]));
    }

    return { success: true, message: 'Contraseña actualizada exitosamente.' };
};

export const addUser = (username: string, password: string): { success: boolean, message: string } => {
    if (!username || !password) {
        return { success: false, message: 'El nombre de usuario y la contraseña no pueden estar vacíos.' };
    }
    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: `El usuario '${username}' ya existe.` };
    }

    users.push({ username, password });
    saveUsers(users);
    return { success: true, message: `Usuario '${username}' creado exitosamente.` };
};

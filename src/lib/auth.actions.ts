'use server';

import fs from 'fs/promises';
import path from 'path';
import type { User, UserWithPassword } from '@/lib/types';

// CHEMIN VERS VOTRE PLACEHOLDER JSON (à remplacer par votre logique DB)
const USERS_DB_PLACEHOLDER_PATH = path.join(process.cwd(), 'db', 'users.json');

// SIMULE la lecture depuis une base de données.
// TODO: ICI, remplacez cette fonction par votre code Node.js pour lire depuis SQLite.
async function getUsersFromDb(): Promise<UserWithPassword[]> {
  try {
    // Logique pour lire depuis db/users.json (PLACEHOLDER)
    const data = await fs.readFile(USERS_DB_PLACEHOLDER_PATH, 'utf-8');
    const usersFromFile = JSON.parse(data) as UserWithPassword[];
    return usersFromFile;
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier users.json (placeholder DB):", error);
    // Si le fichier n'existe pas ou est invalide, et qu'aucun admin .env n'est défini, le login échouera.
    return [];
  }
}

// SIMULE la sauvegarde dans une base de données (ex: pour mettre à jour lastLogin).
// TODO: ICI, remplacez cette fonction par votre code Node.js pour écrire dans SQLite.
async function saveUsersToDb(users: UserWithPassword[]): Promise<void> {
  try {
    // Logique pour écrire dans db/users.json (PLACEHOLDER)
    await fs.writeFile(USERS_DB_PLACEHOLDER_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error("Erreur lors de l'écriture dans users.json (placeholder DB):", error);
    throw new Error("Impossible de sauvegarder les données utilisateur (placeholder).");
  }
}

export async function authenticateUser(
  emailInput: string,
  passwordInput?: string
): Promise<{ user: User; error?: null } | { user?: null; error: string }> {
  
  const usersFromDb = await getUsersFromDb();
  let foundUser: UserWithPassword | undefined = usersFromDb.find((u) => u.email === emailInput);

  // Logique pour l'admin par défaut via .env (si users.json est vide ou l'utilisateur n'y est pas)
  // Cela est utile si vous initialisez votre DB SQLite sans cet utilisateur au début
  // ou si vous préférez gérer l'admin principal via .env pour le développement.
  if (!foundUser && process.env.ADMIN_EMAIL && emailInput === process.env.ADMIN_EMAIL) {
    if (passwordInput === process.env.ADMIN_PASSWORD) {
      foundUser = {
        id: process.env.ADMIN_ID || "env-admin-001",
        firstName: process.env.ADMIN_FIRSTNAME || "Admin",
        lastName: process.env.ADMIN_LASTNAME || "User",
        username: process.env.ADMIN_USERNAME || "admin_env",
        email: process.env.ADMIN_EMAIL,
        role: (process.env.ADMIN_ROLE as User["role"]) || "Owner",
        password: process.env.ADMIN_PASSWORD, // Ne pas stocker en clair en production
        avatarUrl: "https://placehold.co/100x100.png",
        tags: ["admin", "owner", "env_configured"],
        lastLogin: new Date().toISOString(),
      };
      // Optionnel : si l'utilisateur .env n'est pas dans users.json, on pourrait l'y ajouter
      // pour la démo, mais dans un vrai cas SQLite, vous le géreriez via vos scripts d'initialisation DB.
    }
  }

  if (!foundUser) {
    return { error: 'Utilisateur non trouvé.' };
  }

  // IMPORTANT: En production, les mots de passe DOIVENT être hashés.
  // Remplacez cette vérification par une comparaison de hash (ex: avec bcrypt).
  // Exemple: const passwordIsValid = await bcrypt.compare(passwordInput, foundUser.passwordHash);
  if (foundUser.password && passwordInput !== foundUser.password) {
    return { error: 'Mot de passe invalide.' };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userToReturn } = foundUser;
  const finalUserToReturn = {
    ...userToReturn,
    name: (userToReturn.firstName && userToReturn.lastName) 
          ? `${userToReturn.firstName} ${userToReturn.lastName}`
          : userToReturn.name || userToReturn.email,
  } as User;


  // Mise à jour de lastLogin
  // TODO: Adaptez cette logique pour mettre à jour votre base de données SQLite.
  const userIndexInDb = usersFromDb.findIndex(u => u.id === foundUser!.id);
  if (userIndexInDb !== -1) {
    usersFromDb[userIndexInDb].lastLogin = new Date().toISOString();
    await saveUsersToDb(usersFromDb);
  } else if (foundUser.email === process.env.ADMIN_EMAIL) {
    // Si c'est l'utilisateur .env et qu'il n'était pas dans le JSON,
    // on pourrait envisager de le "sauvegarder" s'il n'y a qu'un admin,
    // mais pour SQLite, cela serait géré par une insertion si non existant.
    // Pour l'instant, on ne fait rien ici pour le placeholder JSON dans ce cas spécifique.
    console.log("Utilisateur admin via .env connecté, lastLogin non persisté dans users.json car non trouvé initialement.")
  }
  
  return { user: finalUserToReturn };
}

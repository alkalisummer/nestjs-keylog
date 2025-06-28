import * as bcrypt from 'bcrypt';

/**
 * Hash a password using bcrypt
 * @param password The plain text password to hash
 * @returns Promise<string> The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 * @param password The plain text password
 * @param hashedPassword The hashed password to compare against
 * @returns Promise<boolean> True if passwords match, false otherwise
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

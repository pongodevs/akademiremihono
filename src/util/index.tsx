import bcrypt from 'bcryptjs';

export const publicStorageUrl = "https://storage.akademiremi.com"
export const publicHonoUrl = "https://api.akademiremi.com"
export const publicUrl = "https://www.akademiremi.com"
export const midtransApiUrl = "https://api.midtrans.com"

export function uuidToBytes(uuid: string): Uint8Array {
    const hex = uuid.replace(/-/g, "");
    const matches = hex.match(/.{1,2}/g);

    if (!matches) {
        throw new Error("Invalid UUID format");
    }

    return Uint8Array.from(matches.map(byte => parseInt(byte, 16)));
}

export const generateVerificationCode = (length = 6)=> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
}

export const hashPassword = (plainTextPassword:string)=>{
    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(plainTextPassword, salt);
    return hashed
}

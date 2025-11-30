import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    node_env: process.env.NODE_ENV,
    port: Number(process.env.PORT) || 5000,  
    database_url: process.env.DATABASE_URL,
     bcrypt: {
        salt_round: process.env.BCRYPT_SALT_ROUND
    },
    jwt: {
        access_token_secret: process.env.JWT_ACCESS_SECRET,
        access_token_expires: process.env.JWT_ACCESS_EXPIRES,
    },
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    },
}
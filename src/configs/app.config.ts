export interface IAppConfig {
  port: number;
  apiPrefix: string;
  bcryptSalt: number;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
}

export default (): IAppConfig => ({
  port: parseInt(process.env.PORT, 10),
  apiPrefix: process.env.API_PREFIX,
  bcryptSalt: parseInt(process.env.BCRYPT_SALT, 10) || 10,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
});

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
 baseDirectory: __dirname,
});

const eslintConfig = [
 ...compat.extends("next/core-web-vitals", "next/typescript"),
 {
   // 🚨 TEMPORARY FIX: Remove these rules when you want to improve type safety and code quality
   rules: {
     "@typescript-eslint/no-explicit-any": "off", // Replace 'any' with specific types
     "@typescript-eslint/no-unused-vars": "off", // Remove unused variables or add '_' prefix
     "@next/next/no-img-element": "off", // Replace <img> with Next.js <Image> component
     "react/no-unescaped-entities": "off" // Escape quotation marks
   }
 }
];

export default eslintConfig;
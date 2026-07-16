declare module 'vite-plugin-compression' {
  import { Plugin } from 'vite';
  
  interface ViteCompressionOptions {
    verbose?: boolean;
    disable?: boolean;
    threshold?: number;
    algorithm?: 'gzip' | 'brotliCompress' | 'deflate' | 'deflateRaw';
    ext?: string;
    deleteOriginFile?: boolean;
    filter?: RegExp | ((file: string) => boolean);
  }
  
  export default function viteCompression(options?: ViteCompressionOptions): Plugin;
}

declare module 'multer' {
    import { Request, RequestHandler } from 'express';

    interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer?: Buffer;
        destination?: string;
        filename?: string;
        path?: string;
    }

    interface Options {
        storage?: any;
        limits?: {
            fieldNameSize?: number;
            fieldSize?: number;
            fields?: number;
            fileSize?: number;
            files?: number;
            parts?: number;
            headerPairs?: number;
        };
        fileFilter?(req: any, file: File, cb: (error: Error | null, acceptFile?: boolean) => void): void;
    }

    interface Multer {
        single(fieldName: string): RequestHandler;
        array(fieldName: string, maxCount?: number): RequestHandler;
        fields(fields: { name: string; maxCount?: number }[]): RequestHandler;
        none(): RequestHandler;
        any(): RequestHandler;
    }

    class MulterError extends Error {
        code: string;
        field?: string;
        constructor(code: string, field?: string);
    }

    function multer(options?: Options): Multer;

    namespace multer {
        function memoryStorage(): any;
        function diskStorage(options: any): any;
        class MulterError extends Error {
            code: string;
            field?: string;
            constructor(code: string, field?: string);
        }
    }

    export = multer;
}

declare namespace Express {
    interface Request {
        file?: {
            fieldname: string;
            originalname: string;
            encoding: string;
            mimetype: string;
            size: number;
            buffer?: Buffer;
            destination?: string;
            filename?: string;
            path?: string;
        };
        files?: any;
    }
}

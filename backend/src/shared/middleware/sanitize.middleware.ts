import { Request, Response, NextFunction } from 'express';

const HTML_TAG_REGEX = /<[^>]*>/g;

function stripHtml(value: unknown): unknown {
    if (typeof value === 'string') {
        return value.replace(HTML_TAG_REGEX, '').trim();
    }
    if (Array.isArray(value)) {
        return value.map(stripHtml);
    }
    if (value !== null && typeof value === 'object') {
        const cleaned: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value)) {
            cleaned[key] = stripHtml(val);
        }
        return cleaned;
    }
    return value;
}

export const sanitizeBody = (req: Request, _res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
        req.body = stripHtml(req.body);
    }
    next();
};

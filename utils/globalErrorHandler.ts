import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message,

        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

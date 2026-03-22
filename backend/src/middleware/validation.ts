import type { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

const handleValidationErrors = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const validateMyUserRequest = [
  body('auth0_id').isString().notEmpty().withMessage('auth0_id is required and must be a string'),
  body('email').isEmail().notEmpty().withMessage('email is required and must be a valid email'),
  body("username").isString().notEmpty().withMessage("username is required and must be a string").optional(),
  body("district").isString().notEmpty().withMessage("district must be a string").optional(),
  body("city").isString().notEmpty().withMessage("city must be a string").optional(),
  handleValidationErrors,
];

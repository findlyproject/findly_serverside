import type { Request, Response, NextFunction } from "express";
import { type AnyZodObject, ZodError } from "zod";
import { CustomError } from "../Utils/errorHandler";

export function validateData(bodySchema?: AnyZodObject, paramSchema?: AnyZodObject) {
	return (req: Request, _res: Response, next: NextFunction) => {
	  try {
		if (paramSchema) {
		  paramSchema.parse(req.params); // Validate params
		}
		if (bodySchema) {
		  bodySchema.parse(req.body); // Validate body
		}
		next();
	  } catch (error) {
		if (error instanceof ZodError) {
		  throw new CustomError(
			`Invalid data, ${error.errors[0].path}: ${error.errors[0].message}`,
			400
		  );
		}
		throw new CustomError("Error when validating data", 400);
	  }
	};
  }
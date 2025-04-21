
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../Utils/errorHandler';

const errorHandler = ( err: Error | CustomError,req: Request,res: Response,next: NextFunction) => {

  if (err instanceof CustomError) {
     res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errorCode: err.errorCode, 
    });
    
  }

 
  console.error(`Unexpected Error: ${err}`);
  res.status(500).json({  status: "error",message: "Something went wrong!",});
 
}

export default errorHandler;

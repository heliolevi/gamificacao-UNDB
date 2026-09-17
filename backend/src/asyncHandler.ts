import { NextFunction, Request, RequestHandler, Response } from "express";

// Express 4 não encaminha rejeições de Promise pra o error handler sozinho —
// sem isso, um erro assíncrono (ex: timeout de conexão do banco) derruba o
// processo inteiro em vez de virar um 500 pra quem fez a requisição.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

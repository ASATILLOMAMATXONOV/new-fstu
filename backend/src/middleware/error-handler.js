export function errorHandler(error, req, res, _next) {
  const suppliedStatus = Number(error.statusCode || error.status);
  const statusCode = Number.isInteger(suppliedStatus) && suppliedStatus >= 400 && suppliedStatus <= 599 ? suppliedStatus : 500;
  if (res.headersSent) return _next(error);
  if (error.type === 'entity.parse.failed') req.securityEvent = {
    type: 'invalid_body', severity: 'medium', summary: 'Noto‘g‘ri JSON so‘rovi rad etildi.'
  };

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    message: statusCode >= 500 ? 'Internal server error.' : error.type === 'entity.parse.failed' ? 'Invalid JSON body.' : error.message || 'Request rejected.',
    requestId: req.securityRequestId
  });
}

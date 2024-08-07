import httpStatus from "http-status";
import fs from "fs";

class HttpError extends Error {
  constructor(message = "Unhandled http error") {
    super(message);
    this.name = this.constructor.name;
    this.http_code = httpStatus.INTERNAL_SERVER_ERROR;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFound extends HttpError {
  constructor(message = "Resource not found") {
    super(message);
    this.http_code = httpStatus.NOT_FOUND;
  }
}

class Unauthenticated extends HttpError {
  constructor(message = "Please authenticate") {
    super(message);
    this.http_code = httpStatus.UNAUTHORIZED;
  }
}

class BadRequest extends HttpError {
  constructor(
    message = "Your request could not be processed due to invalid data"
  ) {
    super(message);
    this.http_code = httpStatus.BAD_REQUEST;
  }
}

class Forbidden extends HttpError {
  constructor(message = "You are not allowed to access this resource") {
    super(message);
    this.http_code = httpStatus.FORBIDDEN;
  }
}

class ServerError extends HttpError {
  constructor(message = "Internal server error") {
    super(message);
    this.http_code = httpStatus.INTERNAL_SERVER_ERROR;
  }
}

const catchResponse = (err, req, res) => {
  let httpCode = err.http_code || 500,
    message = err.message || "Internal server error",
    data = undefined;

  if (err.code == "P2003") {
    httpCode = httpStatus.UNPROCESSABLE_ENTITY;
    message =
      "Cannot modified the resource because it is related to other resource";
  } else if (err.name == "PrismaClientValidationError") {
    httpCode = httpStatus.BAD_REQUEST;
    if (err.message.includes("Unknown argument")) {
      const part = err.message.match(/Unknown argument `[^`]+`/);
      message = part ? part[0] : "Unknown argument on request";
    } else if (err.message.includes("Unknown field")) {
      const part = err.message.match(
        /Unknown field `[^`]+` for select statement`/
      );
      message = part ? part[0] : "Unknown field name on request";
    }
  } else if (
    err.name == "PrismaClientKnownRequestError" &&
    err.code == "P2025"
  ) {
    httpCode = httpStatus.NOT_FOUND;
    message = "Resource to execute not found";
  } else if (err.name == "ValidationError" && err.details) {
    httpCode = httpStatus.UNPROCESSABLE_ENTITY;
    message = "Request validation error";
    data = err.details.map((det) => det.message);
  } else if (err instanceof HttpError) {
    httpCode = err.http_code;
    message = err.message;
  } else {
    // logger.error(err);
  }

  // delete uploaded files on request for storage efficiency
  const uploaded = [];

  if (req.file) uploaded.push(req.file);
  if (req.files) {
    if (typeof req.files === "object")
      Object.keys(req.files).forEach((field) => {
        req.files[field].forEach((file) => {
          uploaded.push(file);
        });
      });
    else if (Array.isArray(req.files))
      req.files.forEach((file) => uploaded.push(file));
  }

  if (uploaded.length)
    uploaded.forEach((up) => {
      fs.unlink(up.path, (err) => {
        if (err) {
          console.error("ERR(file): ", err);
        }
      });
    });

  res.status(httpCode).json({
    status: httpCode > 199 && httpCode < 300,
    message: message,
    data: data,
  });
};

export {
  catchResponse,
  ServerError,
  NotFound,
  Unauthenticated,
  Forbidden,
  BadRequest,
};

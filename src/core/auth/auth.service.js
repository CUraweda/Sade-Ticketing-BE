import base64url from 'base64url';
import bcrypt from "bcrypt";
import CryptoJS from 'crypto-js';
import jwt from "jsonwebtoken";
import BaseService from "../../base/service.base.js";
import constant from "../../config/constant.js";
import { prism } from "../../config/db.js";
import { userFields } from "../../data/model-fields.js";
import EmailHelper from "../../helper/emailHelper.js";
import { BadRequest, Forbidden, NotFound } from "../../lib/response/catch.js";

function encrypt (text) {
  const passphrase = '123';
  return CryptoJS.AES.encrypt(text, passphrase).toString();
};

function decrypt (ciphertext) {
  const passphrase = '123';
  const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};


class AuthService extends BaseService {
  constructor() {
    super(prism);
    this.mailHelper = new EmailHelper();
  }

  login = async (payload) => {
    const user = await this.db.user.findUnique({
      where: { email: payload.email },
      select: {
        ...this.include(userFields),
        user_roles: {
          select: {
            id: true,
            is_active: true,
            role: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });
    if (!user) throw new NotFound("Akun tidak ditemukan");

    if (!user.status) throw new Forbidden("Akun saat ini sedang non-aktif");

    const pwValid = await bcrypt.compare(payload.password, user.password);
    if (!pwValid) throw new BadRequest("Password tidak cocok");

    const activeRole = user.user_roles.filter((ur) => ur.is_active);

    const [at, rt] = await Promise.all([
      jwt.sign(
        {
          uid: user.id,
          role: activeRole.length > 0 ? activeRole[0].role.code : null,
          iss: process.env.JWT_ISSUER,
        },
        process.env.JWT_ACCESS_SECRET,
        {
          expiresIn: constant.JWT_ACCESS_EXP,
        }
      ),
      jwt.sign(
        { uid: user.id, iss: process.env.JWT_ISSUER },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: constant.JWT_REFRESH_EXP,
        }
      ),
    ]);

    return {
      user: this.exclude(user, ["password"]),
      token: {
        at,
        rt,
      },
    };
  };

  refreshToken = async (payload) => {
    const user = await this.db.user.findUnique({
      where: { email: payload.email },
      select: {
        ...this.include(userFields),
        user_roles: {
          select: {
            id: true,
            is_active: true,
            role: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });
    if (!user) throw new NotFound("Akun tidak ditemukan");

    if (!user.status) throw new Forbidden("Akun saat ini sedang non-aktif");

    const activeRole = user.user_roles.filter((ur) => ur.is_active);

    const [at, rt] = await Promise.all([
      jwt.sign(
        {
          uid: user.id,
          role: activeRole.length > 0 ? activeRole[0].role.code : null,
          iss: process.env.JWT_ISSUER,
        },
        process.env.JWT_ACCESS_SECRET,
        {
          expiresIn: constant.JWT_ACCESS_EXP,
        }
      ),
      jwt.sign(
        { uid: user.id, iss: process.env.JWT_ISSUER },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: constant.JWT_REFRESH_EXP,
        }
      ),
    ]);

    return {
      user: this.exclude(user, ["password"]),
      token: {
        at,
        rt,
      },
    };
  };

  register = async (payload) => {
    const verifyEmail = await this.db.user.findFirst({ where: { email: payload.email } });

    if (verifyEmail) {
        throw new Forbidden("Akun dengan email telah digunakan");
    }
    if (payload.password !== payload.confirm_password) {
        throw new BadRequest("Kata sandi tidak cocok. Mohon pastikan bahwa kedua kata sandi yang Anda masukkan adalah sama");
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    const data = await this.db.user.create({
        data: {
            full_name: payload.full_name,
            email: payload.email,
            password: hashedPassword
        }
    });

    const user_role = await this.db.role.findFirst({ where: { code: "USR" } });

    await this.db.userRole.create({
        data: {
            role_id: user_role.id,
            user_id: data.id,
            is_active: false
        }
    });

    const encryptedEmail = encrypt(payload.email); 
    const url = `${process.env.WEB_URL}/verifikasi/${base64url.encode(encryptedEmail)}`;
    const mailBody = './src/register.html';

    this.mailHelper.sendEmail(
        url,
        process.env.EMAIL_ACCOUNT,
        payload.email,
        process.env.SUBJECT,
        mailBody
    );

    return {
        data,
        message: "Akun anda berhasil terdaftar! Silahkan verifikasi email anda"
    };
  };

  verifyEmail = async (payload) => {
    const encodedEmail = payload.encoded_email;
    const encryptedEmail = base64url.decode(encodedEmail);
    const decodedEmail = decrypt(encryptedEmail);

    const user = await this.db.user.findFirst({ where: { email: decodedEmail } });

    if (!user) {
        throw new BadRequest("User tidak ditemukan.");
    }

    await this.db.user.update({
        where: {id: user.id},
        data: {status: true, email_verified: true}
    });

    await this.db.userRole.updateMany({
        where: { user_id: user.id },
        data: { is_active: true }
    });

    return "Email berhasil diverifikasi!";
  };

  forgotPassword = async (payload) => {
    const verifyEmail = await this.db.user.findFirst({ where: { email: payload.email } });
    if (!verifyEmail) {
      throw new BadRequest("Akun tidak ditemukan");
    }
    
    const encryptedEmail = encrypt(payload.email); 
    const url = `${process.env.WEB_URL}/verifikasi/${base64url.encode(encryptedEmail)}`;
    const mailBody = './src/register.html';

    this.mailHelper.sendEmail(
        url,
        process.env.EMAIL_ACCOUNT,
        payload.email,
        process.env.SUBJECT,
        mailBody
    );

    return "Email dikirim!"
  }
  resetPass = async (payload) => {
    const encodedEmail = payload.encoded_email;
    const encryptedEmail = base64url.decode(encodedEmail);
    const decodedEmail = decrypt(encryptedEmail);

    const user = await this.db.user.findFirst({ where: { email: decodedEmail } });

    if (!user) {
        throw new BadRequest("User tidak ditemukan.");
    }
    
    if (payload.new_password !== payload.confirm_password) {
      throw new BadRequest("Kata sandi tidak cocok. Mohon pastikan bahwa kedua kata sandi yang Anda masukkan adalah sama");
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(payload.new_password, salt);

    const data = await this.db.user.update({
      where: { email: decodedEmail},
        data: {
          password: hashedPassword
        }
    });
    
    return {data, message: "Password berhasil diupdate!"}
  }
};

export default AuthService;

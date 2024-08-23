import fs from 'fs';
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import email from '../config/emailConfig.js';

const transporter = nodemailer.createTransport({
  //? GMAIL CONFIG
  service: "gmail",
  auth: {
    user: email.account,
    pass: email.password
  }

});

var readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
    if (err) {
      callback(err);
    } else {
      callback(null, html);
    }
  });
};

class EmailHelper {
  async sendEmail(
    webUrl,
    from,
    to,
    subject,
    body,
    auth = null,
    attachment = false
  ) {
    try {
      readHTMLFile(body, function (err, html) {
        if (err) {
          console.log("error reading file", err);
          return;
        }
        var template = handlebars.compile(html);
        var replacements = {
          url: webUrl,
        };
        var htmlToSend = template(replacements);
        var mailOptions = {
          from: from,
          to: to,
          subject: subject, 
          html: htmlToSend,
        };
        transporter.sendMail(mailOptions, function (error, response) {
          if (error) {
            console.log(error);
          }
        });
      });
    } catch (err) {
      console.log(err);
      logger.error(err);
      return false;
    }
  }
}

export default EmailHelper;

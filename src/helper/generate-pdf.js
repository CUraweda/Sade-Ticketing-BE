import fs from "fs";
import puppeteer from "puppeteer";
import handlebars from "handlebars";
import path from "path";

const DEFAULT_OPTIONS = {
  format: "A4",
  //   displayHeaderFooter: false,
  margin: {
    top: "40px",
    right: "40px",
    bottom: "40px",
    left: "40px",
  },
  printBackground: true,
};

class GeneratePDF {
  compileHTML(fileName, data) {
    const templatePath = path.join(path.resolve(), "views", `${fileName}.hbs`);
    const templateHtml = fs.readFileSync(templatePath, "utf-8");
    const template = handlebars.compile(templateHtml);
    return template(data);
  }

  async create({ html, options = DEFAULT_OPTIONS }) {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const buffer = await page.pdf(options);
    await browser.close();
    return buffer;
  }
}

export default GeneratePDF;

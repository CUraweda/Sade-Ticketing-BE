import BaseService from "../../base/service.base.js";
import { prism } from "../../config/db.js";
import fs from "fs";
import htmlToPdfmake from "html-to-pdfmake";
import moment from "moment";
import { JSDOM } from "jsdom";
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
import { QuestionTyp } from "../question/question.validator.js";
pdfMake.vfs = pdfFonts.vfs;

class QuestionnaireResponseService extends BaseService {
  constructor() {
    super(prism);
  }

  findAll = async (query, userId) => {
    const q = this.transformBrowseQuery(query);
    const data = await this.db.questionnaireResponse.findMany({
      ...q,
      where: {
        ...q.where,
        OR: [
          { user_id: userId },
          {
            client: {
              user_id: userId,
            },
          },
        ],
      },
      include: this.select(["questionnaire.title"]),
    });

    if (query.paginate) {
      const countData = await this.db.questionnaireResponse.count({
        where: q.where,
      });
      return this.paginate(data, countData, q);
    }
    return data;
  };

  findById = async (id) => {
    const data = await this.db.questionnaireResponse.findUnique({
      where: { id },
      include: {
        signatures: true,
        questionnaire: true,
        user: {
          select: {
            avatar: true,
            full_name: true,
          },
        },
        client: {
          include: {
            user: {
              select: {
                avatar: true,
                full_name: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    return data;
  };

  create = async (payload) => {
    const data = await this.db.questionnaireResponse.create({ data: payload });
    return data;
  };

  update = async (id, payload) => {
    const data = await this.db.questionnaireResponse.update({
      where: { id },
      data: payload,
    });
    return data;
  };

  delete = async (id) => {
    const data = await this.db.questionnaireResponse.delete({ where: { id } });
    return data;
  };

  checkOwner = async (id, uid) => {
    const check = await this.db.questionnaireResponse.count({
      where: {
        id,
        user_id: uid,
      },
    });
    return check;
  };

  checkAccess = async (id, uid) =>
    await this.db.questionnaireResponse.count({
      where: {
        id,
        OR: [
          { user_id: uid },
          {
            client: {
              user_id: uid,
            },
          },
        ],
      },
    });

  addSignature = async (id, payload) =>
    this.db.questionnaireResponse.update({
      where: { id },
      data: {
        signatures: {
          create: payload,
        },
      },
    });

  exportResponse = async (id) => {
    const dat = await this.findById(id);

    const logoBinar = fs.readFileSync(
      "src/assets/images/logo-binar.png",
      "base64"
    );

    // js dom helper
    const { window } = new JSDOM();

    // common styles
    const tdStyle = {
      marginTop: 8,
      marginBottom: 8,
      border: [0, 0, 0, 1],
      borderColor: ["", "", "", "#d0d0d0"],
    };

    const doc = pdfMake.createPdf({
      pageMargins: [40, 120, 40, 72],
      header: [
        {
          margin: 24,
          table: {
            widths: ["25%", "75%"],
            body: [
              [
                {
                  image: `data:image/png;base64,${logoBinar}`,
                  borderColor: ["", "", "", "#c0c0c0"],
                  border: [false, false, false, true],
                  width: 130,
                  marginBottom: 8,
                },
                {
                  borderColor: ["", "", "", "#c0c0c0"],
                  border: [false, false, false, true],
                  marginBottom: 8,
                  stack: [
                    {
                      width: "auto",
                      marginTop: 12,
                      marginBottom: 4,
                      text: "Binar Harmoni Indonesia",
                      fontSize: 18,
                      bold: true,
                    },
                    {
                      text: "Together We Achieve More",
                      fontSize: 12,
                      italics: true,
                      color: "#666",
                    },
                  ],
                },
              ],
            ],
          },
        },
      ],
      footer: (page, totalPage) => ({
        layout: "noBorders",
        margin: 24,
        table: {
          widths: ["85%", "15%"],
          body: [
            [
              {
                fontSize: 10,
                lineHeight: 1.2,
                text: `Jl Bungsan No. 80. Bedahan, Sawangan, Kota Depok. Telp. 087812066496\nJl Gemini Blok A No. I9/10 Kel. Mekarsari, Kec. Tambun Selatan, Kab. Bekasi. Telp. 087812066496`,
                color: "#666",
              },
              {
                text: `${page} dari ${totalPage}`,
                color: "#666",
                alignment: "right",
              },
            ],
          ],
        },
      }),
      content: [
        // title
        {
          fontSize: 14,
          bold: true,
          alignment: "center",
          text: dat.questionnaire.title,
          marginBottom: 4,
        },
        {
          fontSize: 12,
          color: "#666",
          bold: true,
          alignment: "center",
          text: `${moment(dat.updated_at).format("DD/MM/YYYY")} [${dat.is_locked ? "FINAL" : "DRAF"}]`,
        },

        // client information
        {
          layout: "noBorders",
          marginTop: 24,
          marginBottom: 16,
          fontSize: 12,
          color: "#333",
          table: {
            widths: ["20%", "3%", "77%"],
            body: [
              [
                { marginBottom: 4, text: "Nama" },
                { text: ": " },
                {
                  text: `${dat.client.first_name} ${dat.client.last_name ?? ""}`,
                },
              ],
              [
                { marginBottom: 4, text: "Tanggal lahir" },
                { text: ": " },
                {
                  text: `${moment(dat.client.dob).locale("id").format("dddd, DD MMMM YYYY")} (${moment().diff(dat.client.dob, "years")} tahun)`,
                },
              ],
              [
                { marginBottom: 4, text: "Jenis kelamin" },
                { text: ": " },
                {
                  text: `${dat.client.sex == "L" ? "Laki-laki" : "perempuan"}`,
                },
              ],
              [
                { marginBottom: 4, text: "Kategori" },
                { text: ": " },
                { text: dat.client.category },
              ],
              [
                { marginBottom: 4, text: "Hubungan" },
                { text: ": " },
                { text: `${dat.client.relation} dari ${dat.user.full_name}` },
              ],
            ],
          },
        },

        // table
        {
          fontSize: 12,
          table: {
            widths: ["40%", "3%", "57%"],
            body: dat.answers
              .map((ans, i, arr) => {
                const item = [];

                // add section title
                if (
                  ans.question?.section &&
                  (i == 0 ||
                    arr[i - 1].question?.section != ans.question?.section)
                )
                  item.push([
                    {
                      ...tdStyle,
                      text: ans.question.section,
                      bold: true,
                      fontSize: 14,
                      marginTop: 24,
                    },
                    {
                      text: "",
                      ...tdStyle,
                    },
                    {
                      text: "",
                      ...tdStyle,
                    },
                  ]);

                let val = "",
                  typ = ans.question.typ,
                  typs = QuestionTyp;

                if (typ == typs.TEXT || typ == typs.TEXTAREA) val = ans.text;
                else if (typ == typs.WYSIWYG)
                  val = ans.long_text
                    ? htmlToPdfmake(ans.long_text, { window })
                    : "";
                else if (typ == typs.NUMBER) val = ans.number;
                else if (typ == typs.DATE)
                  val = moment(ans.date).format("DD MMMM YYYY");
                else if (typ == typs.DATETIME)
                  val = moment(ans.date).format("DD MMMM YYYY HH:mm:ss");
                else if (typ == typs.RADIO || typ == typs.SELECT)
                  val =
                    ans.question?.options?.find((o) => o.value == ans.text)
                      ?.label ?? (ans.question?.other ? ans.text : "");

                item.push([
                  {
                    text: ans.question?.label ?? "-",
                    marginLeft: 8,
                    ...tdStyle,
                  },
                  { text: ": ", ...tdStyle },
                  {
                    text: val,
                    ...tdStyle,
                  },
                ]);

                return item;
              })
              .flat(),
          },
        },

        // description
        {
          marginTop: 32,
          lineHeight: 1.5,
          color: "#333",
          text: dat.questionnaire.description
            ? htmlToPdfmake(dat.questionnaire.description, { window })
            : "",
        },

        // signatures
        dat.signatures.length > 0 && {
          alignment: "right",
          color: "#333",
          marginTop: 32,
          lineHeight: 1.2,
          columns: [
            {
              width: "*",
              text: "",
            },
            ...dat.signatures.map((sig) => {
              let image = null;

              if (fs.existsSync(sig.signature_img_path))
                image = fs.readFileSync(sig.signature_img_path, "base64");

              return {
                width: "auto",
                stack: [
                  `${sig.signed_place}, ${moment(sig.signed_at).locale("id").format("DD MMMM YYYY")}`,
                  `${sig.role}`,
                  {
                    ...(image
                      ? {
                          image: `data:image/png;base64,${image}`,
                        }
                      : { text: "-" }),
                    width: 130,
                    height: 130,
                  },
                  {
                    color: "#000",
                    fontSize: 12,
                    text: `${sig.name}, ${sig.role}`,
                    bold: true,
                  },
                  htmlToPdfmake(sig.detail ?? "", { window }),
                ],
              };
            }),
          ],
          columnGap: 16,
        },
      ],
    });

    return { data: dat, doc };
  };
}

export default QuestionnaireResponseService;

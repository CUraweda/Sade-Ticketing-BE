export const formatMoney = (
  number,
  { locale = "id-ID", currency = "IDR", shorten = false } = {}
) => {
  if (!number) return "Rp 0";

  let formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(number);

  if (formatted.includes(",")) {
    formatted = formatted.replace(/,00$/, "");
  }

  if (shorten) {
    if (number >= 1_000_000_000_000) {
      // Triliun
      formatted = `Rp ${(number / 1_000_000_000_000)
        .toFixed(2)
        .replace(/\.0+$/, "")}T`;
    } else if (number >= 1_000_000_000) {
      // Miliar
      formatted = `Rp ${(number / 1_000_000_000)
        .toFixed(2)
        .replace(/\.0+$/, "")}M`;
    } else if (number >= 1_000_000) {
      // Juta
      formatted = `Rp ${(number / 1_000_000)
        .toFixed(2)
        .replace(/\.0+$/, "")}jt`;
    } else if (number >= 1_000) {
      // Ribu
      formatted = `Rp ${(number / 1_000).toFixed(0)}rb`;
    }
  }

  return formatted;
};

export const numberToWords = (n) => {
  const satuan = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
  ];
  const belasan = [
    "sepuluh",
    "sebelas",
    "dua belas",
    "tiga belas",
    "empat belas",
    "lima belas",
    "enam belas",
    "tujuh belas",
    "delapan belas",
    "sembilan belas",
  ];
  const puluhan = [
    "",
    "",
    "dua puluh",
    "tiga puluh",
    "empat puluh",
    "lima puluh",
    "enam puluh",
    "tujuh puluh",
    "delapan puluh",
    "sembilan puluh",
  ];
  const ribuan = ["", "ribu", "juta", "miliar", "triliun"];

  function convert(n) {
    if (n === 0) return "";
    else if (n < 10) return satuan[n];
    else if (n < 20) return belasan[n - 10];
    else if (n < 100)
      return (
        puluhan[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + satuan[n % 10] : "")
      );
    else if (n < 200)
      return "seratus" + (n % 100 !== 0 ? " " + convert(n % 100) : "");
    else if (n < 1000)
      return (
        satuan[Math.floor(n / 100)] +
        " ratus" +
        (n % 100 !== 0 ? " " + convert(n % 100) : "")
      );
    else {
      for (let i = 1; i < ribuan.length; i++) {
        let unit = Math.pow(1000, i);
        if (n < unit * 1000) {
          return (
            (Math.floor(n / unit) === 1 && i === 1
              ? "seribu"
              : convert(Math.floor(n / unit)) + " " + ribuan[i]) +
            (n % unit !== 0 ? " " + convert(n % unit) : "")
          );
        }
      }
    }
  }

  return convert(n).trim();
};

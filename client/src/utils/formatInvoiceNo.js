export const formatInvoiceNo = (
  prefix = "",
  suffix = "",
  sequence = "001",
  date = new Date(),
) => {
  const today = new Date(date);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Financial Year Logic (India: April-March)
  const fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;
  const fyEndYear = fyStartYear + 1;

  const values = {
    "{{mm}}": String(currentMonth + 1).padStart(2, "0"),
    "{{mmm}}": today.toLocaleString("default", { month: "short" }),
    "{{xx}}": String(fyStartYear).slice(-2),
    "{{xxxx}}": String(fyStartYear),
    "{{yy}}": String(fyEndYear).slice(-2),
    "{{yyyy}}": String(fyEndYear),
  };

  let p = prefix;
  let s = suffix;

  Object.keys(values).forEach((key) => {
    p = p.split(key).join(values[key]);
    s = s.split(key).join(values[key]);
  });

  return `${p}${sequence}${s}`;
};

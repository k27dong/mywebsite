const CONST = {
  GITHUB: "https://github.com/k27dong",
  LINKEDIN: "https://www.linkedin.com/in/k27dong/",
  MAIL: "mailto:me@kefan.me",
  CIBC: "https://www.cibc.com/",
  UWENG: "https://uwaterloo.ca/engineering/",
  SAFYRELABS: "https://www.safyrelabs.com/",
  POINTCLICKCARE: "https://pointclickcare.com",
  HOST: "http://localhost:5000/",
  CURRENTYEAR: new Date().getFullYear(),
  BUYMECOFFEE: "https://www.buymeacoffee.com/kefan",
  WHOAMI: "Kefan Dong",
  ZHIHU: "https://www.zhihu.com/people/csbt34d",
  RESUME: `${process.env.PUBLIC_URL}/Kefan_Dong_Resume_PDF.pdf`,
  DEPLOYMENT_HOST: "http://kefan.me/",
  // DEPLOYMENT_HOST: "http://localhost:5000/",
}

const ConvertDate = (date, format) => {
  const month_names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]

  try {
    if (format === "post") {
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    } else if (format === "main") {
      return `${date.getDate()}, ${month_names[date.getMonth()]}`
    } else {
      return ""
    }
  } catch (err) {
    return ""
  }
}

const MyAge = () => {
  let age_diff = Date.now() - new Date("April 3, 2000 12:00:00")
  let age_date = new Date(age_diff)
  return Math.abs(age_date.getUTCFullYear() - 1970)
}

export { CONST, ConvertDate, MyAge }

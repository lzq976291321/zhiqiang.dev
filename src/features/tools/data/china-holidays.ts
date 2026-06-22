export type ChinaHolidayGroup = {
  name: string
  dates: string[]
}

export type ChinaSpecialWorkday = {
  date: string
  reason: string
}

export const chinaHolidaySource = {
  title: "国务院办公厅关于2026年部分节假日安排的通知",
  url: "https://big5.www.gov.cn/gate/big5/www.gov.cn/gongbao/2025/issue_12406/202511/content_7048922.html",
}

export const chinaHolidayGroups2026: ChinaHolidayGroup[] = [
  {
    name: "元旦",
    dates: ["2026-01-01", "2026-01-02", "2026-01-03"],
  },
  {
    name: "春节",
    dates: [
      "2026-02-15",
      "2026-02-16",
      "2026-02-17",
      "2026-02-18",
      "2026-02-19",
      "2026-02-20",
      "2026-02-21",
      "2026-02-22",
      "2026-02-23",
    ],
  },
  {
    name: "清明节",
    dates: ["2026-04-04", "2026-04-05", "2026-04-06"],
  },
  {
    name: "劳动节",
    dates: ["2026-05-01", "2026-05-02", "2026-05-03", "2026-05-04", "2026-05-05"],
  },
  {
    name: "端午节",
    dates: ["2026-06-19", "2026-06-20", "2026-06-21"],
  },
  {
    name: "中秋节",
    dates: ["2026-09-25", "2026-09-26", "2026-09-27"],
  },
  {
    name: "国庆节",
    dates: [
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
    ],
  },
]

export const chinaSpecialWorkdays2026: ChinaSpecialWorkday[] = [
  { date: "2026-01-04", reason: "元旦调休上班" },
  { date: "2026-02-14", reason: "春节调休上班" },
  { date: "2026-02-28", reason: "春节调休上班" },
  { date: "2026-05-09", reason: "劳动节调休上班" },
  { date: "2026-09-20", reason: "国庆节调休上班" },
  { date: "2026-10-10", reason: "国庆节调休上班" },
]

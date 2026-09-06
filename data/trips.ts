export type TripStatus = "open" | "full" | "closed";

export type Trip = {
  clubId: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  summary: string;
  location: string;
  date: string;
  duration: string;
  difficulty: string;
  capacity: number;
  registered: number;
  price: number;
  status: TripStatus;
};

export const trips: Trip[] = [
  {
    clubId: "mojnoo",
    slug: "alvand-classic",
    title: "الوند کلاسیک",
    subtitle: "صعود یک روزه از مسیر گنجنامه",
    description: "برنامه‌ای استاندارد برای اعضایی که می‌خواهند صعود منظم و قابل اتکا در منطقه الوند داشته باشند.",
    summary: "یک برنامه استاندارد برای اعضای باشگاه که به دنبال صعود منظم، امن و خوش‌مسیر در منطقه الوند هستند.",
    location: "همدان - گنجنامه - الوند",
    date: "1405/05/10",
    duration: "1 روزه",
    difficulty: "متوسط",
    capacity: 25,
    registered: 0,
    price: 850000,
    status: "open",
  },
  // سایر برنامه‌ها را با افزودن clubId: "mojnoo" مشابه بالا ویرایش کن
];

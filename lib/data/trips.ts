export type TripStatus = "open" | "full" | "closed";

export type Trip = {
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
    slug: "alvand-classic",
    title: "الوند کلاسیک",
    subtitle: "صعود یک روزه از مسیر گنجنامه",
    description:
      "برنامه‌ای استاندارد برای اعضایی که می‌خواهند صعود منظم و قابل اتکا در منطقه الوند داشته باشند.",
    summary:
      "یک برنامه استاندارد برای اعضای باشگاه که به دنبال صعود منظم، امن و خوش‌مسیر در منطقه الوند هستند.",
    location: "همدان - گنجنامه - الوند",
    date: "1405/05/10",
    duration: "1 روزه",
    difficulty: "متوسط",
    capacity: 25,
    registered: 0,
    price: 850000,
    status: "open",
  },
  {
    slug: "alvand-sunrise",
    title: "طلوع الوند",
    subtitle: "حرکت بامدادی با تمرکز بر طلوع و عکاسی",
    description:
      "برنامه‌ای سبک‌تر برای تجربه حرکت سحرگاهی، هوای خنک و چشم‌انداز طلوع در کوهستان.",
    summary:
      "مناسب برای اعضایی که تجربه حرکت سحرگاهی، برنامه سبک‌تر و چشم‌انداز صبحگاهی الوند را می‌خواهند.",
    location: "همدان - دشت میشان",
    date: "1405/05/17",
    duration: "1 روزه",
    difficulty: "سبک تا متوسط",
    capacity: 20,
    registered: 0,
    price: 780000,
    status: "full",
  },
  {
    slug: "alvand-camp",
    title: "کمپ ارتفاع الوند",
    subtitle: "شب‌مانی و آموزش مقدماتی کمپینگ کوهستان",
    description:
      "برنامه‌ای برای تجربه شب‌مانی، کار تیمی و آشنایی با اصول پایه کمپینگ در ارتفاع.",
    summary:
      "برنامه‌ای مناسب برای تجربه شب‌مانی، کار تیمی و آشنایی با اصول پایه کمپینگ در ارتفاع.",
    location: "همدان - الوند",
    date: "1405/05/24",
    duration: "2 روزه",
    difficulty: "متوسط",
    capacity: 15,
    registered: 0,
    price: 1450000,
    status: "closed",
  },
];

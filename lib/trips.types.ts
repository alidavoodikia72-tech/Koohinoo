export const TRIP_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
  "CANCELLED",
] as const;

export type TripStatus = (typeof TRIP_STATUSES)[number];

export type ClubOption = {
  id: string;
  name: string;
};

export type TripFormValues = {
  title: string;
  destination: string;
  region: string;
  summary: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  clubId: string;
  capacity: string;
  price: string;
};

export const EMPTY_TRIP_FORM_VALUES: TripFormValues = {
  title: "",
  destination: "",
  region: "",
  summary: "",
  startDate: "",
  endDate: "",
  status: "DRAFT",
  clubId: "",
  capacity: "1",
  price: "",
};

export type TripFieldErrors = Partial<Record<keyof TripFormValues, string>>;

export type TripActionResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message: string;
      errors: TripFieldErrors;
    };

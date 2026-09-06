import type { TripStatus } from "@prisma/client";

export type TripListItem = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string;
  difficulty: string;
  price: number;
  capacity: number;
  status: TripStatus;
  clubId: string;
  club: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
};

export type EditableTrip = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string;
  difficulty: string;
  price: number;
  capacity: number;
  status: TripStatus;
  clubId: string;
};

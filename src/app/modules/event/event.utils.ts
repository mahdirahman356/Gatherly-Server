// src/modules/event/event.utils.ts

import { Prisma } from "@prisma/client";

export interface EventSearchParams {
  type?: string;        
  date?: string;        
  startDate?: string;  
  endDate?: string;   
  location?: string;  
}

export const buildEventSearchQuery = (
  params: EventSearchParams
): Prisma.EventWhereInput => {
  const { type, date, startDate, endDate, location } = params;

  const where: Prisma.EventWhereInput = {
    status: "OPEN", 
  };

  //  Filter by Event Type
  if (type) {
    where.type = {
      equals: type,
      mode: "insensitive",
    };
  }

  // Filter by Single Date
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    where.date = {
      gte: start,
      lt: end,
    };
  }

  // Filter by Date Range
  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  // Filter by Location (partial search)
  if (location) {
    where.location = {
      contains: location,
      mode: "insensitive",
    };
  }

  return where;
};

import { Request } from "express";
import { User, UserRole } from "./user.interface";
import bcrypt from "bcryptjs";
import config from "../../../config";
import { prisma } from "../../lib/prisma";
import { IJWTPayload } from "../../types/common";
import { fileUploader } from "../../helper/fileUploader";
import ApiError from "../../errors/ApiError";
import { UserStatus } from "@prisma/client";

const createUser = async (req: Request) => {

  const { email, password, fullName, location } = req.body;

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt.salt_round)
  );

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

    await tx.profile.create({
      data: {
        fullName,
        location,
        userId: user.id,
      },
    });

    return user;
  });

  return result;
};

const myProfile = async (user: IJWTPayload) => {

  const userInfo = await prisma.user.findUniqueOrThrow({
    where: { email: user.email },

    include: {
      profile: true,
      _count: {
        select: {
          events: true,
        },
      },
      participants: {

        include: {
          event: {
            include: {
              host: {
                select: {
                  id: true,
                  email: true,
                  profile: true,
                },
              },
              _count: {
                select: {
                  participants: true,
                },
              },
            },
          },
        },

        orderBy: {
          joinedAt: "desc",
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                  image: true,
                }
              }
            }
          }
        }
      },
      events: {
        include: {
          host: {
            select: {
              id: true,
              email: true,
              profile: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },

          },
        },
        orderBy: {
          date: "desc",
        },
      },
      hostRequests: true
    },
  });

  if (userInfo.role === "USER") {
    const events = userInfo.participants.map(p => ({
      ...p.event,
    }));

    return {
      id: userInfo.id,
      email: userInfo.email,
      role: userInfo.role,
      status: userInfo.status,
      createdAt: userInfo.createdAt,
      profile: userInfo.profile,
      totalEvents: events.length,
      hostRequest: userInfo.hostRequests,
      events,
    };
  }

  //  HOST VIEW
  if (userInfo.role === "HOST") {
    return {
      id: userInfo.id,
      email: userInfo.email,
      role: userInfo.role,
      status: userInfo.status,
      createdAt: userInfo.createdAt,
      profile: userInfo.profile,
      totalEvents: userInfo._count.events,
      reviews: userInfo.reviews,
      events: userInfo.events.map(event => ({
        ...event,
      })),
    };
  }

  return userInfo;



};

const getAllUsers = async (role: UserRole) => {

  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      profile: true,
      _count: {
        select: {
          events: true,
        },
      },
    },
  });

  const result = users.map(({ _count, role, ...user }) => ({
    ...user,
    role,
    ...(role === "HOST" && {
      eventsCount: _count.events,
    }),
  }));

  return result;

};

const getSingleUser = async (userId: string) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: {
      profile: true,
      _count: {
        select: {
          events: true,
        },
      },
      participants: {

        include: {
          event: {
            include: {
              host: {
                select: {
                  id: true,
                  email: true,
                  profile: true,
                },
              },
              _count: {
                select: {
                  participants: true,
                },
              },
            },
          },
        },

        orderBy: {
          joinedAt: "desc",
        },
      },
      events: {
        include: {
          host: {
            select: {
              id: true,
              email: true,
              profile: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },

          },
        },
        orderBy: {
          date: "desc",
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                  image: true,
                }
              }
            }
          }
        }
      }

    },
  });

  if (userInfo.role === "USER") {
    const events = userInfo.participants.map(p => ({
      ...p.event,
    }));

    return {
      id: userInfo.id,
      email: userInfo.email,
      role: userInfo.role,
      status: userInfo.status,
      createdAt: userInfo.createdAt,
      profile: userInfo.profile,
      totalEvents: events.length,
      events,
    };
  }

  //  HOST VIEW
  if (userInfo.role === "HOST") {
    return {
      id: userInfo.id,
      email: userInfo.email,
      role: userInfo.role,
      status: userInfo.status,
      createdAt: userInfo.createdAt,
      profile: userInfo.profile,
      totalEvents: userInfo._count.events,
      reviews: userInfo.reviews,
      events: userInfo.events.map(event => ({
        ...event,
      })),
    };
  }

  return userInfo;
};

const updateProfile = async (user: IJWTPayload, req: Request) => {

  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });


  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);

    if (!uploadResult?.secure_url) {
      throw new Error("Image upload failed");
    }

    req.body.image = uploadResult.secure_url;
  }

  const profileInfo = await prisma.profile.upsert({
    where: {
      userId: userInfo.id,
    },
    update: req.body,
    create: {
      userId: userInfo.id,
      ...req.body,
    },
  });

  return profileInfo;
};

const changeUserStatus = async (userId: string, status: UserStatus) => {

  const result = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      status: status
    },
  })

  return result

};

const changeUserRole = async (userId: string, role: UserRole) => {

  const result = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      role: role
    },
  })

  return result

};

const requestHostRole = async (user: IJWTPayload) => {

  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });


  const existing = await prisma.hostRequest.findUnique({
    where: { userId: userInfo.id },
  });

  if (existing) {
    throw new ApiError(400, "You already submitted a host request");
  }

  const result = await prisma.hostRequest.create({
    data: {
      userId: userInfo.id,
    },
  });

  return result

};

const getPendingHostRequests = async () => {
   const requests = await prisma.hostRequest.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!requests.length) {
      throw new ApiError(404, "No pending host requests found");
    }

    return requests;

};

const updateHostRequestStatus = async (id: string, status: "APPROVED" | "REJECTED") => {

  const req = await prisma.hostRequest.findUnique({
    where: { id },
  });

  if (!req) throw new ApiError(404, "Request not found");

  const result = await prisma.hostRequest.update({
    where: { id },
    data: { status },
  });

  if (status === "APPROVED") {
   const result = await prisma.user.update({
      where: { id: req.userId },
      data: { role: "HOST" },
    });
  }

  return result

};

const deleteUser = async (userId: string) => {

  const result = await prisma.user.delete({
    where: {
      id: userId
    }
  })

  return result

};


export const UserService = {
  createUser,
  myProfile,
  getAllUsers,
  getSingleUser,
  updateProfile,
  changeUserStatus,
  changeUserRole,
  requestHostRole,
  getPendingHostRequests,
  updateHostRequestStatus,
  deleteUser
}
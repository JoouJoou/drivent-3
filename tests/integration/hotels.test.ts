import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

const server = supertest(app);

beforeAll(async () => {
  await init();
  await cleanDb();
});
beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
});

describe("GET /hotels", () => {
  it("should responde with 400 if valid token and there is no paid ticket or no hotel tickets", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const enrollment = await createEnrollmentWithAddress(user);
    const response = await server
      .get("/hotels")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });
  it("should responde with 404 if valid token but user has no enrollment", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const response = await server
      .get("/hotels")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
  it("should respond with status 401 if no token", async () => {
    const result = await server.get("/hotels");
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if invalid token", async () => {
    const result = await server
      .get("/hotels")
      .set("Authorization", "Bearer XXXXX");
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should responde with status 200 and an empty array if valid token and no hotels are found", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const response = await server
      .get("/hotels")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toStrictEqual([]);
  });

  it("should respond with status 200 if valid token and there is hotels and tickets paid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await prisma.hotel.create({
      data: {
        name: "One piece",
        image: "sunny.jpeg",
      },
    });
    const response = await server
      .get("/hotels")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ])
    );
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token", async () => {
    const result = await server.get("/hotels/1");
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if invalid token", async () => {
    const result = await server
      .get("/hotels/1")
      .set("Authorization", "Bearer XXXXX");
    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should responde with 404 if valid token but no hotel is found", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const response = await server
      .get("/hotels/1")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
  it("should responde with 200 and the hotel with an array of rooms if valid token and the hotel exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await prisma.hotel.create({
      data: {
        name: "One piece",
        image: "sunny.jpeg",
      },
    });
    await prisma.room.create({
      data: {
        name: "room 37",
        capacity: 4,
        hotelId: hotel.id,
      },
    });
    const response = await server
      .get(`/hotels/${hotel.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        Rooms: expect.any(Array),
      })
    );
  });
});

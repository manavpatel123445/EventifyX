import request from "supertest";
import app from "../utils/app.js";
import mongoose from "mongoose";

describe("Health Check API", () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should return 200 and healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "healthy");
  });

  it("should return 200 for root endpoint", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("EventifyX API is running");
  });
});

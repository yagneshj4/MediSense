const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../index");

let mongoServer;

beforeAll(async () => {
  // Ensure JWT_SECRET is set for tests
  process.env.JWT_SECRET = "test_jwt_secret_key_value";
  process.env.GEMINI_API_KEY = "test_gemini_key";

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Authentication Routes Validation & API Flows", () => {
  const testUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "securepassword",
  };

  it("should fail registration with invalid input schemas (short password)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "John",
        email: "john.doe@example.com",
        password: "123", // Too short (min 6 required by schema)
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation failed.");
    expect(res.body.errors).toBeDefined();
  });

  it("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("should fail registration if email already exists", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Email is already registered.");
  });

  it("should log in successfully with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("should deny access with invalid login credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "wrongpassword",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

const request = require("supertest");
const app = require("./app");

let server;

beforeAll((done) => {
  server = app.listen(3000, () => {
    console.log("Server running for tests");
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

test("GET /", async () => {
  const response = await request(server).get("/");
  expect(response.statusCode).toBe(200);
  expect(response.text).toBe("Hello World!");
});

// Test for the add endpoint
test("POST /add", async () => {
  const response = await request(server).post("/add").send({ a: 5, b: 10 });

  expect(response.statusCode).toBe(200);
  expect(response.body.result).toBe(15);
});

test("POST /add with invalid operands", async () => {
  const response = await request(server)
    .post("/add")
    .send({ a: "five", b: 10 });

  expect(response.statusCode).toBe(400);
  expect(response.body.error).toBe(
    "Invalid operands. Both a and b must be numbers."
  );
});

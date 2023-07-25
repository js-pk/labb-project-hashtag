const request = require("supertest");
const app = require("../src/app.js");
// const agent = request.agent(app);
const Database = require('../src/database/connection.js');

const db = new Database();

describe("Test router", () => {
    test("Router", async () => {
      const response = await request(app).get("/");
      expect(response.statusCode).toBe(200);
    });

    // test("Login/ user exists", async () => {
    //     const response = await agent
    //         .post('/user/login')
    //         .send({name: "김삡빠"})
    //     // console.log(response);
    //     expect(response.statusCode).toEqual(301);
    // });
});

//TODO: Better to elaborate more tests and expect type..
describe('Test DB', () => {
    test("Insert method", async () => {
        const response = await db.insert("users", ["name"], ["테스트"]);
        expect(response).toBeDefined();
    });

    test("First method/ item exists", async () => {
        const response = await db.first("users", "name=?", ["테스트"]);
        expect(response).toBeDefined();
    });

    test("Frst method/ item not exits", async () => { 
        const response = await db.first("users", "name=?", ["afafadasddf11fdf2ad"]);
        expect(response).toBeNull();
    });

    test("Update method", async () => {
        const response = await db.update("users", "mail = 'test@gmail.com'", "name=?", ["김삡빠"]);
        expect(response).toBeDefined();
    })

    test("All method", async () => {
        const response = await db.all("users", "stage_01=?", [0]);
        expect(response).toBeDefined();
    });

    test("Delete method", async () => {
        const response = await db.delete("users", "name=?", ["테스트"]);
        expect(response.toBeDefined);
    })
});
const request = require("supertest");
const session = require('supertest-session');
const app = require("../src/app.js");
const Database = require('../database/connection.js');

const db = new Database(); // TODO: should replace to development DB

describe("Test /", () => {
    test("/", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toEqual(200);
      });
})

describe("Test /game", () => {
    describe("user logined", () => { //I don't know why but async/await was not working with session. need to check later
        let authSession;
        let testSession = session(app);
        beforeAll((done) => {
            testSession.post('/user/register')
                .send({
                    "name": "테스트", 
                    "email": "test@test.com"
                })
                .end((err) => {
                    if (err) return done(err);
                    authSession = testSession;
                    return done();
                })
        })
        afterAll(async () => {
            await db.delete("users", "email=?", ["test@test.com"]);
        });

        test("game/01", (done) => {
            authSession.get('/game/01')
                .expect(200)
                .end(done)            
        });
        test("game/02", (done) => {
            authSession.get('/game/02')
                .expect(200)
                .end(done)         
        });
        test("game/03", (done) => {
            authSession.get('/game/03')
                .expect(200)
                .end(done)    
        });

        test("game/upload image exists", (done) => {
            authSession.post('/game/upload')
                .field('name', 'asdadas')
                .attach('image', __dirname + '/test.png')
                .expect(200)
                .end(done)
        }, 30000);

        test("game/upload image not exists", (done) => {
            authSession.post('/game/upload')
                .field('name', 'asdadas')
                .attach('image', undefined)
                .expect(400)
                .end(done)
        });
    });
    describe("user not logined", () => {
        let agent;
        beforeAll(async () => {
            agent = await request.agent(app);
        });
        test("game/01", async () => {
            const response = await agent.get("/game/01");
            expect(response.statusCode).toEqual(302);
            expect(response.header.location).toEqual('/');
        })
        test("game/02", async () => {
            const response = await agent.get("/game/02");
            expect(response.statusCode).toEqual(302);
            expect(response.header.location).toEqual('/');
        })
        test("game/03", async () => {
            const response = await agent.get("/game/03");
            expect(response.statusCode).toEqual(302);
            expect(response.header.location).toEqual('/');
        })
    })
})

describe("Test /user", () => {

    beforeAll(async () => {
        await db.insert("users", ["name", "email"], ["테스트", "test@test.com"]);
    });

    afterAll(async () => {
        await db.delete("users", "email=?", ["test@test.com"]);
        await db.delete("users", "email=?", ["nouser@nooo.com"]);
    });

    test("POST user/login, user name exists", async () => {
        const response = await request(app)
            .post('/user/login')
            .send({"email": "test@test.com"});
        expect(response.statusCode).toEqual(302);
        expect(response.header.location).toEqual('/');
    });

    test("POST user/login, user name not exists", async () => {
        const response = await request(app)
            .post('/user/login')
            .send({"email": "nouser@nooo.com"});
        expect(response.statusCode).toEqual(200);
    });

    test("POST user/register, user email not exists", async () => {
        const response = await request(app)
            .post('/user/register')
            .send({
                "name": "NoUser",
                "email": "nouser@nooo.com"
            });
        expect(response.statusCode).toEqual(302);
        expect(response.header.location).toEqual('/game/01');
        
    });
    test("POST user/register, user email already exists", async () => {
        const response = await request(app)
            .post('/user/register')
            .send({
                "name": "없는유저",
                "email": "test@test.com"
            });
            expect(response.statusCode).toEqual(200);
    });

    test("POST user/logout", async () => { //TODO: should I use agent?
        const response = await request(app)
            .post('/user/logout')
            expect(response.statusCode).toEqual(302);
            expect(response.header.location).toEqual('/');
    });
});

describe('Test DB', () => {
    test("Insert method", async () => {
        const response = await db.insert("users", ["name", "email"], ["테스트", "test@test.com"]);
        expect(typeof response).toBe("number");
    });

    test("First method/ item exists", async () => {
        const response = await db.first("users", "name=?", ["테스트"]);
        expect(response.name).toBe("테스트");
    });

    test("Frst method/ item not exists", async () => { 
        const response = await db.first("users", "name=?", ["afafadasddf11fdf2ad"]);
        expect(response).toBeNull();
    });

    test("Update method", async () => {
        const response = await db.update("users", "name = '바뀐닉네임'", "email=?", ["test@test.com"]);
        expect(typeof response).toBe("number");
    })

    test("All method", async () => {
        const response = await db.all("users", "stage_01=?", [0]);
        expect(Array.isArray(response)).toBe(true);
    });

    test("Delete method", async () => {
        const response = await db.delete("users", "email=?", ["test@test.com"]);
        expect(response).toBe("Deleted..");
    });
});

describe('Test Download Image from S3', () => {
   
    // test("List images", async () => {
    //     const response = await request(app)
    //     .get('/photos');
    //     // console.log(response);
    // })
});
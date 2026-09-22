import { Elysia } from "elysia";

const app = new Elysia()

app.get('/',()=>{
  return {
    name: "Gopal N D",
    designation: " Full stack developer",
    application: " Exchages"
  }
})




app.listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

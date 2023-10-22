import {Authenticator, AuthorizationError} from "remix-auth"
import {sessionStorage} from "./session.server"
import {FormStrategy} from "remix-auth-form"
// import {getXataClient, UsersRecord} from "./xata" //this is basically database
import bcrypt from "bcryptjs"
import { pool } from "./database"
import { RowDataPacket } from 'mysql2';


export interface UsersRecord {
  user_id: number;
  login: string | null;
  password: string;
  phone_number: string | null;
  name: string | null;
  surname: string | null;
  email: string;
  age: string | null;
  country: string | null;
  score: string | null;
  score_divided_by: string | null;
}



const authenticator = new Authenticator<UsersRecord>(sessionStorage)

const formStrategy = new FormStrategy(async ({form}) => {
  console.log("formStrategy")
  const email = form.get("email") as string
  const password = form.get("password") as string

  const queryParams = [];
  queryParams.push(email);
  const query = "SELECT * FROM USERS WHERE EMAIL = ? LIMIT 1";
  const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);
  const user = rows[0] as UsersRecord; // Extract the first row as UsersRecord
  console.log(`user: ${JSON.stringify(user, null, 2)}`);

  if (!user) {
    console.log("wrong email")
    throw new AuthorizationError()
  }
  console.log(`user.password: ${user.password}`)
  const passwordsMatch = await bcrypt.compare(
    password,
    user.password as string,
  )
  console.log(`passwordsMatch: ${passwordsMatch}`)

  if (!passwordsMatch) {
    throw new AuthorizationError()
  }

  return user
})

authenticator.use(formStrategy, "form")

export {authenticator}

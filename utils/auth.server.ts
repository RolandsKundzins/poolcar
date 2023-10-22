import {Authenticator, AuthorizationError} from "remix-auth"
import {sessionStorage} from "./session.server"
import {FormStrategy} from "remix-auth-form"
// import {getXataClient, UsersRecord} from "./xata" //this is basically database
import bcrypt from "bcryptjs"
import { pool } from "./database"
import { RowDataPacket } from 'mysql2';


export interface UsersRecord {
  id: number;
  email: string;
  password: string;
  // ... other fields if applicable
}


const authenticator = new Authenticator<UsersRecord>(sessionStorage)

const formStrategy = new FormStrategy(async ({form}) => {
  const email = form.get("email") as string
  const password = form.get("password") as string

  // const xata = getXataClient()
  // const user = await xata.db.users.filter({email}).getFirst()
  const queryParams = [];
  queryParams.push(email);
  const query = "SELECT * FROM USERS WHERE EMAIL = ?";
  const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);
  const user = rows[0] as UsersRecord; // Extract the first row as UsersRecord

  if (!user) {
    console.log("wrong email")
    throw new AuthorizationError()
  }

  const passwordsMatch = await bcrypt.compare(
    password,
    user.password as string,
  )

  if (!passwordsMatch) {
    throw new AuthorizationError()
  }

  return user
})

authenticator.use(formStrategy, "form")

export {authenticator}

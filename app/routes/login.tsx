import type {ActionFunction} from "@remix-run/node"
import {Form, Link} from "@remix-run/react"
import {authenticator} from "utils/auth.server"


const loader = async ({request}: any) => {
  console.log(`login.tsx loader`)
  const user = await authenticator.isAuthenticated(request, {
    successRedirect: "/navigate",
  })
  console.log(`user loader: ${JSON.stringify(user, null, 2)}`)

  return user
}

const action: ActionFunction = async ({request}) => {
  console.log(`login.tsx action`)

  return authenticator.authenticate("form", request, {
    successRedirect: "/navigate",
    failureRedirect: "/login",
  })
}

const LoginPage = () => {
    return (
        <Form method="post" className="p-10 text-center">
            <h1 className="font-bold text-xl">
                Welcome! Login to see your navigate.
            </h1>
            <p className="mb-6">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-500">
                    Sign up
                </Link>
            </p>

            <label className="font-semibold mr-2" htmlFor="email">
                Email
            </label>
            <input
                className="border-2 rounded-md mr-8 border-gray-600 px-3 py-1"
                type="email"
                name="email"
                id="email"
            />

            <label className="font-semibold mr-2" htmlFor="password">
                Password
            </label>
            <input
                className="border-2 rounded-md mr-8 border-gray-600 px-3 py-1"
                type="password"
                name="password"
                id="password"
            />

            <button
                type="submit"
                className="bg-blue-500 text-white py-1 px-3 rounded-md font-semibold"
            >
                Login
            </button>
        </Form>
    )
}

export default LoginPage
export {action, loader}
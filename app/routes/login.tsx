import { Form } from "@remix-run/react";


export default function Login() {

  return (
    <Form>
        <input type="text" placeholder="email"/>
        <input type="text" placeholder="password"/>
        <button>Login</button>
    </Form>
  );
}
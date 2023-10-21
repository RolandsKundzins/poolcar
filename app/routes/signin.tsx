import { Form } from "@remix-run/react";


export default function SignIn() {

  return (
    <Form>
        <input type="text" placeholder="email"/>
        <input type="text" placeholder="password"/>
        <button>Sign In</button>
    </Form>
  );
}
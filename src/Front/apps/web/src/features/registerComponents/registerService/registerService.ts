import api from "../../../../axios/axios";
export async function registerWithEmail(payload: {name:string,email:string,password:string}) {
  return (await api.post("/users/register", payload)).data;
}
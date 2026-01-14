import { Redirect } from "expo-router";

// The Expo template ships a "Welcome" screen here. For this project we want the
// web landing page (/) to show the actual app (login/home).
export default function Index() {
  return <Redirect href="/home" />;
}

import { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user) router.replace("/foryou");
    else router.replace("/(auth)/signup");
  }, [user, isLoading]);

  return <View />;
}

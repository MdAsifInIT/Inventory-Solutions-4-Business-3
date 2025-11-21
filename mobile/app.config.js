import appJson from "./app.json";

export default ({ config }) => ({
  ...config,
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo?.extra,
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1",
    },
  },
});

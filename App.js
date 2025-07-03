import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import { Droplet, Thermometer, Wind, Gauge } from "lucide-react-native";

const API_KEY = "FcfNcf0JdHcGJ6xtDNMNiG1UIZduZYgW";

export default function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const coords = `${location.coords.latitude},${location.coords.longitude}`;

        const locRes = await axios.get(
          `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search`,
          {
            params: {
              apikey: API_KEY,
              q: coords,
            },
          }
        );

        const locationKey = locRes.data.Key;
        const loc = locRes.data;
        const cityName = loc.LocalizedName;
        const region = loc.AdministrativeArea?.LocalizedName || "";
        const country = loc.Country?.LocalizedName || "";

        const weatherRes = await axios.get(
          `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}`,
          {
            params: {
              apikey: API_KEY,
              details: true,
            },
          }
        );

        if (!weatherRes.data || weatherRes.data.length === 0) {
          throw new Error("No weather data found.");
        }

        const w = weatherRes.data[0];

        setWeather({
          city: cityName,
          region,
          country,
          temp: w.Temperature.Metric.Value,
          text: w.WeatherText,
          wind: w.Wind.Speed.Metric.Value,
          humidity: w.RelativeHumidity,
          realFeel: w.RealFeelTemperature.Metric.Value,
        });
      } catch (e) {
        setErrorMsg("Failed to fetch weather.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {loading ? (
        <ActivityIndicator size="large" color="#1e3a8a" />
      ) : errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : weather ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topCard}>
            <Text style={styles.cityName}>{weather.city}</Text>
            <Text style={styles.locationSubtext}>
              {weather.region}, {weather.country}
            </Text>
            <Text style={styles.temperature}>{weather.temp}°</Text>
            <View style={styles.conditionRow}>
              <Text style={styles.conditionText}>{weather.text}</Text>
              <Droplet size={20} color="#fff" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Hours</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[14, 15, 16, 17, 18].map((h, i) => (
                <View key={i} style={styles.hourItem}>
                  <Text style={styles.hourTemp}>
                    {Math.round(weather.temp - i)}°
                  </Text>
                  <View style={[styles.bar, { height: 20 + i * 5 }]} />
                  <Text style={styles.hour}>{h}:00</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.analytics}>
            <View style={styles.analyticsBox}>
              <Droplet size={16} color="#555" />
              <Text style={styles.analyticsText}>7 mm/h</Text>
              <Text style={styles.analyticsLabel}>Precipitation</Text>
            </View>
            <View style={styles.analyticsBox}>
              <Wind size={16} color="#555" />
              <Text style={styles.analyticsText}>{weather.wind} km/h</Text>
              <Text style={styles.analyticsLabel}>Wind</Text>
            </View>
            <View style={styles.analyticsBox}>
              <Gauge size={16} color="#555" />
              <Text style={styles.analyticsText}>{weather.humidity}%</Text>
              <Text style={styles.analyticsLabel}>Humidity</Text>
            </View>
            <View style={styles.analyticsBox}>
              <Thermometer size={16} color="#555" />
              <Text style={styles.analyticsText}>{weather.realFeel}°</Text>
              <Text style={styles.analyticsLabel}>Feels Like</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.placeholder}>Weather not available.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    paddingTop: 40,
  },
  content: {
    padding: 20,
  },
  topCard: {
    backgroundColor: "#0a2540",
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
  },
  cityName: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "600",
  },
  temperature: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#fff",
  },
  conditionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  conditionText: {
    color: "#fff",
    fontSize: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  hourItem: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  hourTemp: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  bar: {
    width: 16,
    backgroundColor: "#5bb5ff",
    borderRadius: 4,
    marginVertical: 4,
  },
  hour: {
    fontSize: 12,
    color: "#888",
  },
  analytics: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  analyticsBox: {
    width: "48%",
    backgroundColor: "#f0f4f8",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  analyticsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: "#555",
  },
  error: {
    color: "#dc2626",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  placeholder: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginTop: 20,
  },
  locationSubtext: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 4,
  },
});

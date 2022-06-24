import {
  IMigration,
  sql,
  runQuery,
  IInitDbClientConfig,
  reactiveQueriesPlugin,
  migrationsPlugin,
  EnsureDbLoaded,
  DbProvider,
} from "@trong-orm/react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "./components/Themed";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import React from "react";
import { Platform } from "react-native";

const createNotesTable: IMigration = {
  up: async (db) => {
    const query = sql`
      CREATE TABLE notes (
        id varchar(20) PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_note_title ON notes(title);
    `;

    await runQuery(db, query);
  },
  id: 1653668686076, // id should be uniq
  name: "createNotesTable",
};

const config: IInitDbClientConfig = {
  dbName: "trong-db",
  dbBackend:
    Platform.OS === "web"
      ? require("@trong-orm/absurd-web-backend").initAbsurdWebBackend({
          wasmUrl: require("@trong-orm/sql.js/dist/sql-wasm.wasm").default,
        })
      : require("@trong-orm/native-expo-backend").nativeExpoBackend(),
  plugins: [
    migrationsPlugin({ migrations: [createNotesTable] }),
    reactiveQueriesPlugin({ webMultiTabSupport: Platform.OS === "web" }),
  ],
};

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  return (() => {
    if (!isLoadingComplete) {
      return null;
    } else {
      return (
        <SafeAreaProvider>
          <DbProvider config={config}>
            <EnsureDbLoaded fallback={<Text>Loading db...</Text>}>
              <Navigation colorScheme={colorScheme} />
            </EnsureDbLoaded>
          </DbProvider>
          <StatusBar />
        </SafeAreaProvider>
      );
    }
  })();
}

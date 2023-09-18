import "../styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import Head from "next/head";

import { AuthContextProvider } from "../contexts/AuthContext";
import Layout from "../components/Layout";

function MyApp({ Component, pageProps }) {
  return (
    <AuthContextProvider>
      <ChakraProvider>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Travel Together</title>
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </AuthContextProvider>
  );
}

export default MyApp;

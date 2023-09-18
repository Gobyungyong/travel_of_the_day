import "../styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";

import { AuthContextProvider } from "../contexts/AuthContext";
import Layout from "../components/Layout";

function MyApp({ Component, pageProps }) {
  return (
    <AuthContextProvider>
      <ChakraProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </AuthContextProvider>
  );
}

export default MyApp;

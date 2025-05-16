"use client"
import Navbar from "@/components/Navbar";
import { ApolloProvider } from "@apollo/client";
import client from "@/lib/apolloClient";


export default function RootLayout({ children }) {
  return (
    <>
      <ApolloProvider client={client}>
        <Navbar/>
      </ApolloProvider>
        {children}
        
    </>
  );
}
